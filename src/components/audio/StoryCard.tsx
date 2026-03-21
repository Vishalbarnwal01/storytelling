'use client';

import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Heart, MessageCircle, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StoryCardProps {
  story: Story;
  playlist?: Story[];
}

export default function StoryCard({ story, playlist }: StoryCardProps) {
  const [isLiked, setIsLiked] = useState(story.isLiked || false);
  const [likeCount, setLikeCount] = useState(story.likes);
  const [commentCount, setCommentCount] = useState(story.commentCount || 0);
  const [duration, setDuration] = useState(story.duration || '00:00');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { playSong, currentAudio, isPlaying, togglePlayPause } = useAudio();

  // Check if this story is currently playing
  const isCurrentlyPlaying = currentAudio?.id === Number(story.id) && isPlaying;

  // Load current user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleLikeChange = (event: CustomEvent) => {
      const { storyId, isLiked, likeCount } = event.detail;
      const currentStoryId = typeof story.id === 'string' ? parseInt(story.id) : story.id;

      if (storyId === currentStoryId) {
        setIsLiked(isLiked);
        setLikeCount(likeCount);
      }
    };

    window.addEventListener('storyLikeChanged', handleLikeChange as EventListener);

    return () => {
      window.removeEventListener('storyLikeChanged', handleLikeChange as EventListener);
    };
  }, [story.id]);

  // Calculate duration from audio file
  useEffect(() => {
    if (story.audioUrl) {
      const audio = new Audio();
      audio.src = story.audioUrl;

      const updateDuration = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          setDuration(formattedDuration);
        }
      };

      audio.addEventListener('loadedmetadata', updateDuration);
      return () => audio.removeEventListener('loadedmetadata', updateDuration);
    }
  }, [story.audioUrl]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Login first for like',
      });
      router.push('/login');
      return;
    }

    setIsLikeLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const response = await fetch('/api/likes/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: story.id,
            userId: currentUser.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsLiked(false);
          setLikeCount(data.likeCount);
          toast({
            title: 'Success',
            description: 'Like removed',
          });

          // Emit event to update other cards
          window.dispatchEvent(new CustomEvent('storyLikeChanged', {
            detail: { storyId: Number(story.id), isLiked: false, likeCount: data.likeCount }
          }));
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to remove like',
          });
        }
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: story.id,
            userId: currentUser.id,
            userEmail: currentUser.email,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsLiked(true);
          setLikeCount(data.likeCount);
          toast({
            title: 'Success',
            description: 'Story liked!',
          });

          // Emit event to update other cards
          window.dispatchEvent(new CustomEvent('storyLikeChanged', {
            detail: { storyId: Number(story.id), isLiked: true, likeCount: data.likeCount }
          }));
        } else if (response.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Already Liked',
            description: 'You already liked this story',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to like story',
          });
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update like',
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Login first to play songs',
      });
      router.push('/login');
      return;
    }

    // If already playing this song, toggle pause/play
    if (currentAudio?.id === Number(story.id)) {
      togglePlayPause();
      return;
    }

    const song = {
      id: Number(story.id),
      title: story.title,
      author: story.author,
      coverImage: story.coverImage,
      audioUrl: story.audioUrl,
    };

    // Pass playlist if available, so next/previous buttons work
    if (playlist && playlist.length > 0) {
      const playlistWithNumbers = playlist.map(s => ({
        id: Number(s.id),
        title: s.title,
        author: s.author,
        coverImage: s.coverImage,
        audioUrl: s.audioUrl,
      }));
      playSong(song, playlistWithNumbers);
    } else {
      playSong(song);
    }
  };

  const showStory = () => {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please login to listen this story',
      });
      router.push('/login');
      return;
    }
    router.push(`/story/${story.id}`);
  }

  return (
    <div onClick={showStory} aria-label={`Listen to ${story.title}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="block">
          {/* Image Container */}
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={story.coverImage}
              alt={`Cover art for ${story.title}`}
              unoptimized
              width={438}
              height={328}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={story.imageHint}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {story.user_id == 0 && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-md shadow-md">
                  KW Verified
                </span>
              </div>
            )}

            {/* Play Button - Bottom Right */}
            <button
              onClick={handlePlay}
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all duration-200"
            >
              {isCurrentlyPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            {/* Duration Badge - Bottom Left */}
            <div className="absolute bottom-3 left-3 flex items-center space-x-1">
              <Clock size={14} className="text-white/80" />
              <span className="text-xs text-white/80 font-medium">{duration}</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-semibold line-clamp-1">
              {story.title}
            </h3>

            {/* Author */}
            <p className="text-sm text-muted-foreground mt-1">{story.author?.split('@')[0]}</p>

            {/* Engagement Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="flex items-center space-x-1 cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={handleLike}
                >
                  <Heart
                    size={14}
                    className={cn(
                      'transition-colors',
                      isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{likeCount}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <MessageCircle size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{commentCount}</span>
                </div>
              </div>

              {/* <span className="text-xs text-muted-foreground">2min</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
