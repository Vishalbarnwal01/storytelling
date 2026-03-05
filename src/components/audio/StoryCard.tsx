'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Play, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [duration, setDuration] = useState(story.duration || '00:00');
  const { toast } = useToast();

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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Play functionality can be added here
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
            <p className="text-sm text-muted-foreground mt-1">{story.author}</p>
            
            {/* Engagement Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 cursor-pointer" onClick={handleLike}>
                  <Heart
                    size={14}
                    className={cn(
                      'transition-colors',
                      isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{story.likes + (isLiked ? 1 : 0)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageCircle size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{story.comments?.length || 0}</span>
                </div>
              </div>
              
              <span className="text-xs text-muted-foreground">2 years ago</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
