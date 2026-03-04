'use client';

import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Story } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function StoryActions({ story }: { story: Story }) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
    toast({
      title: 'Link Copied!',
      description: 'You can now share this story with your friends.',
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={handleLike}>
        <Heart className={cn('mr-2 h-4 w-4 transition-colors', isLiked ? 'text-accent fill-accent' : '')} />
        Like ({story.likes + (isLiked ? 1 : 0)})
      </Button>
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
