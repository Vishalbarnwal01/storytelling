'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MessageCircle, Heart, User, Trash2, Loader2, Calendar, Play, Pause, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAudio } from '@/contexts/AudioContext';
import { motion } from 'framer-motion';

interface Story {
  id: number;
  title: string;
  description: string;
  audioPath: string;
  audioUrl?: string;
  thumbnailPath: string;
  coverImage?: string;
  creatorName: string;
  author?: string;
  status: string;
  views: number;
  likes: number;
  createdAt: string;
  duration?: string;
}

interface Comment {
  id: number;
  user_id: number;
  user_email: string;
  comment_text: string;
  created_at: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { playSong, currentAudio, isPlaying, togglePlayPause } = useAudio();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [duration, setDuration] = useState('00:00');
  const [allStories, setAllStories] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.role === 'admin' || user.email?.includes('admin'));
    }
  }, []);

  useEffect(() => {
    const fetchStoryAndComments = async () => {
      try {
        const [storyRes, commentsRes, likesRes, storiesRes] = await Promise.all([
          fetch(`/api/story/${storyId}`),
          fetch(`/api/story/${storyId}/comments`),
          fetch(`/api/likes?songId=${storyId}&userId=${currentUser?.id || ''}`),
          fetch('/api/stories'),
        ]);

        if (storyRes.ok) {
          const storyData = await storyRes.json();
          setStory(storyData);

          // Calculate duration from audio file
          if (storyData.audioPath || storyData.audioUrl) {
            const audioUrl = storyData.audioUrl || `/uploads/${storyData.audioPath}`;
            const audio = new Audio();
            audio.src = audioUrl;
            
            const updateDuration = () => {
              if (audio.duration && !isNaN(audio.duration)) {
                const minutes = Math.floor(audio.duration / 60);
                const seconds = Math.floor(audio.duration % 60);
                const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                setDuration(formattedDuration);
              }
            };
            
            audio.addEventListener('loadedmetadata', updateDuration);
          }
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || []);
        }

        if (likesRes.ok) {
          const likesData = await likesRes.json();
          setLikeCount(likesData.likeCount);
          setIsLiked(likesData.userHasLiked);
        }

        if (storiesRes.ok) {
          const storiesData = await storiesRes.json();
          const transformedStories = (storiesData.stories || []).map((s: any) => ({
            id: s.id.toString(),
            title: s.title,
            author: s.creator_name || 'John',
            coverImage: s.thumbnail_path ? `/uploads/${s.thumbnail_path}` : '/placeholder.jpg',
            audioUrl: s.audio_path ? `/uploads/${s.audio_path}` : '',
          }));
          setAllStories(transformedStories);
        }
      } catch (error) {
        console.error('Error fetching story:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load story',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryAndComments();
  }, [storyId, currentUser, toast]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Login first for comment',
      });
      router.push('/login');
      return;
    }

    if (!commentText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Comment cannot be empty',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: storyId,
          userId: currentUser.id,
          userEmail: currentUser.email,
          commentText: commentText.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
        });
        setCommentText('');

        const commentsRes = await fetch(`/api/story/${storyId}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || []);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to post comment',
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post comment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch('/api/comments/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment deleted successfully',
        });
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete comment',
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete comment',
      });
    }
  };

  const handleLike = async () => {
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
        const response = await fetch('/api/likes/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: storyId,
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
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: storyId,
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

  const handlePlay = () => {
    if (!story) return;

    const audioUrl = story.audioUrl || `/uploads/${story.audioPath}`;
    const song = {
      id: story.id,
      title: story.title,
      author: story.creatorName || 'John',
      coverImage: story.coverImage || `/uploads/${story.thumbnailPath}`,
      audioUrl: audioUrl,
    };

    if (currentAudio?.id === story.id) {
      togglePlayPause();
    } else {
      // Pass all stories as playlist if available
      if (allStories.length > 0) {
        playSong(song, allStories);
      } else {
        playSong(song);
      }
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.description,
        url: url,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Story link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 sm:py-12">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto max-w-6xl py-8 sm:py-12">
        <div className="text-center">
          <p className="text-xl font-semibold">Story not found</p>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentAudio?.id === story.id && isPlaying;

  return (
    <div className="container mx-auto max-w-6xl py-8 sm:py-12 space-y-12">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
          >
            {story.title}
          </motion.h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={16} />
              <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
            </div>
          </div>
          
          {/* Author Section */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://picsum.photos/seed/${story.creatorName}/48/48`} alt={story.creatorName} />
              <AvatarFallback>{story.creatorName ? story.creatorName.charAt(0).toUpperCase() : 'J'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-base">{story.creatorName || 'John'}</p>
              <p className="text-xs text-muted-foreground">Storyteller</p>
            </div>
          </div>
          
          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground/90">{story.description}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={handlePlay}
              disabled={isLikeLoading}
              size="lg"
              className="flex items-center gap-2"
            >
              {isCurrentlyPlaying ? (
                <>
                  <Pause size={18} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={18} />
                  Play
                </>
              )}
            </Button>
            <Button 
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              disabled={isLikeLoading}
              size="lg"
              className="flex items-center gap-2"
            >
              <Heart 
                size={18} 
                fill={isLiked ? "currentColor" : "none"}
              />
              {isLiked ? "Liked" : "Like"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleShare}
              size="lg"
              className="flex items-center gap-2"
            >
              <Share2 size={18} />
              Share
            </Button>
          </div>
        </div>
        
        {/* Right Side - Cover Image (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Cover Image */}
            <div className="rounded-xl overflow-hidden aspect-square shadow-lg">
              <Image
                src={story.coverImage || `/uploads/${story.thumbnailPath}`}
                alt={story.title}
                width={500}
                height={500}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Audio Wave Animation */}
            {isCurrentlyPlaying && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1 h-12 items-end">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      initial={{ height: 8 }}
                      animate={{ height: [8, 24, 8, 12, 28, 12, 16, 24] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>
        
        {/* Comment Input */}
        {currentUser ? (
          <Card className="p-4 sm:p-6">
            <form onSubmit={handlePostComment} className="flex gap-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={`https://picsum.photos/seed/${currentUser?.email}/40/40`} />
                <AvatarFallback>{currentUser?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-3">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm"
                />
                <Button type="submit" size="sm" disabled={isSubmitting || !commentText.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Comment
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to comment on this story.</p>
            <Button onClick={() => router.push('/login')}>Log In</Button>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={`https://picsum.photos/seed/${comment.user_email}/40/40`} />
                  <AvatarFallback>{comment.user_email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm">{comment.user_email}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
