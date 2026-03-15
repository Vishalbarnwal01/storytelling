'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import SearchBar from '@/components/audio/SearchBar';
import FilterTabs, { type FilterType } from '@/components/audio/FilterTabs';
import StoryCard from '@/components/audio/StoryCard';
import type { Story } from '@/lib/types';

export default function ExplorePage() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          const transformedStories: Story[] = (data.stories || []).map((story: any) => ({
            id: story.id.toString(),
            title: story.title,
            author: story.creator_name ? story.creator_name : 'John',
            coverImage: story.thumbnail_path ? `/uploads/${story.thumbnail_path}` : '/placeholder.jpg',
            imageHint: 'story cover',
            audioUrl: story.audio_path ? `/uploads/${story.audio_path}` : '',
            duration: '00:00',
            likes: story.likes || 0,
            comments: [],
          }));
          setAllStories(transformedStories);
          filterStories(transformedStories, searchQuery, activeFilter);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Filter stories based on search and filter type
  const filterStories = (stories: Story[], query: string, filter: FilterType) => {
    let result = [...stories];

    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (story) =>
          story.title.toLowerCase().includes(lowerQuery) ||
          story.author.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sort filter
    if (filter === 'trending') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (filter === 'newest') {
      result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    setFilteredStories(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterStories(allStories, query, activeFilter);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterStories(allStories, searchQuery, filter);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Explore Stories</h1>
        <p className="text-muted-foreground text-lg">Discover audio stories from creators around the world.</p>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Filter Tabs */}
      <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No stories found matching your search.' : 'No stories available yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} playlist={filteredStories} />
          ))}
        </div>
      )}
    </div>
  );
}
