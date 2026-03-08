'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Play, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAudio } from '@/contexts/AudioContext';

interface StoryCardProps {
  story: Story;
  playlist?: Story[];
}

export default function StoryCard({ story, playlist }: StoryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes);
  const [duration, setDuration] = useState(story.duration || '00:00');
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { playSong } = useAudio();

  // Load current user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch like status when component mounts or user changes
  useEffect(() => {
    fetchLikeStatus();
  }, [currentUser, story.id]);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(
        `/api/likes?songId=${story.id}&userId=${currentUser?.id || ''}`
      );
      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.likeCount);
        setIsLiked(data.userHasLiked || false);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

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
      router.push('/login');
      return;
    }
    
   
    const song = {
      id: story.id,
      title: story.title,
      author: story.author,
      coverImage: story.coverImage,
      audioUrl: story.audioUrl,
    };
    
    // Pass playlist if available, so next/previous buttons work
    if (playlist && playlist.length > 0) {
      playSong(song, playlist);
    } else {
      playSong(song);
    }
  };

  return (
    <Link href={`/story/${story.id}`} aria-label={`Listen to ${story.title}`}>
      <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="block">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={story.coverImage}
              alt={`Cover art for ${story.title}`}
              width={438}
              height={328}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={story.imageHint}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Play Button - Bottom Right */}
            <button
              onClick={handlePlay}
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all duration-200"
            >
              <Play size={18} fill="currentColor" className="ml-0.5" />
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
            <p className="text-sm text-muted-foreground mt-1">{story.author || 'John'}</p>
            
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
                  <span className="text-xs text-muted-foreground">{story.comments?.length || 0}</span>
                </div>
              </div>
              
              {/* <span className="text-xs text-muted-foreground">2min</span> */}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
