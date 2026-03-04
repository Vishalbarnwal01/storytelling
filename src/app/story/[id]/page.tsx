'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MessageCircle, User, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import AudioPlayer from '@/components/audio/AudioPlayer';
import StoryActions from '@/components/audio/StoryActions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: number;
  title: string;
  description: string;
  audioPath: string;
  thumbnailPath: string;
  creatorEmail: string;
  status: string;
  views: number;
  likes: number;
  createdAt: string;
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
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    // For now, check if user email is admin (you can improve this with a role system)
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Check if user is admin - you can modify this logic
      setIsAdmin(user.role === 'admin' || user.email?.includes('admin'));
    }
  }, []);

  useEffect(() => {
    const fetchStoryAndComments = async () => {
      try {
        const [storyRes, commentsRes] = await Promise.all([
          fetch(`/api/story/${storyId}`),
          fetch(`/api/story/${storyId}/comments`),
        ]);

        if (storyRes.ok) {
          const storyData = await storyRes.json();
          setStory(storyData);
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || []);
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
  }, [storyId, toast]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please log in to comment',
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

        // Refresh comments
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

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 sm:py-12">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto max-w-4xl py-8 sm:py-12">
        <div className="text-center">
          <p className="text-xl font-semibold">Story not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 sm:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {story.thumbnailPath && (
            <Image
              src={`/uploads/${story.thumbnailPath}`}
              alt={story.title}
              width={600}
              height={600}
              className="rounded-lg aspect-square object-cover w-full shadow-lg shadow-black/30"
              priority
            />
          )}
        </div>
        <div className="md:col-span-2 flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold">{story.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{story.creatorEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="my-6">
            <AudioPlayer audioUrl={`/uploads/${story.audioPath}`} />
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{story.description}</p>
          </div>
        </div>
      </div>

      <Separator className="my-8 sm:my-12" />

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageCircle className="mr-3 h-6 w-6" /> Comments ({comments.length})
        </h2>
        
        <Card className="p-4 sm:p-6 mb-8">
          <form onSubmit={handlePostComment} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={`https://picsum.photos/seed/${currentUser?.email}/40/40`} />
              <AvatarFallback>{currentUser?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Input
                placeholder={currentUser ? 'Add a comment...' : 'Log in to comment...'}
                className="mb-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!currentUser || isSubmitting}
              />
              <Button type="submit" size="sm" disabled={!currentUser || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Comment
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/${comment.user_email}/40/40`} />
                  <AvatarFallback>{comment.user_email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.user_email}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground/80 mt-1">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
