'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
    toast({
      title: 'Link Copied!',
      description: 'You can now share this story with your friends.',
    });
  };

  return (
    <Card className="w-full overflow-hidden border-0 bg-card/50 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20">
      <Link href={`/story/${story.id}`} aria-label={`Listen to ${story.title}`}>
        <CardHeader className="p-0 relative group">
          <Image
            src={story.coverImage}
            alt={`Cover art for ${story.title}`}
            width={600}
            height={600}
            className="aspect-square object-cover w-full"
            data-ai-hint={story.imageHint}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <Link href={`/story/${story.id}`}>
          <CardTitle className="font-headline text-lg leading-tight truncate hover:text-accent transition-colors">
            {story.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{story.author}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={handleLike} className="px-2">
          <Heart className={cn('mr-2 h-4 w-4 transition-colors', isLiked ? 'text-accent fill-accent' : '')} />
          {story.likes + (isLiked ? 1 : 0)}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
