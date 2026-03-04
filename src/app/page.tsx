'use client';

import { useEffect, useState } from 'react';
import StoryCard from '@/components/audio/StoryCard';
import type { Story } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          // Transform API data to Story interface
          const transformedStories: Story[] = (data.stories || []).map((story: any) => ({
            id: story.id.toString(),
            title: story.title,
            author: story.creator_email || 'Unknown',
            coverImage: story.thumbnail_path ? `/uploads/${story.thumbnail_path}` : '/placeholder.jpg',
            imageHint: 'story cover',
            audioUrl: story.audio_path ? `/uploads/${story.audio_path}` : '',
            duration: '00:00',
            likes: story.likes || 0,
            comments: [],
          }));
          setStories(transformedStories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-headline font-bold mb-8">Featured Stories</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No approved stories yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
