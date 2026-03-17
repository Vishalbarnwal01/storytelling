'use client';

import FilterTabs, { type FilterType } from '@/components/audio/FilterTabs';
import SearchBar from '@/components/audio/SearchBar';
import StoryCard from '@/components/audio/StoryCard';
import type { Story } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ExplorePage() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'pop', name: 'Pop' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'rock', name: 'Rock' },
    { id: 'classical', name: 'Classical' },
  ];

  // Filter stories — defined BEFORE useEffect so it's safely callable from within it
  const filterStories = (stories: Story[], query: string, filter: string) => {
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

    // Apply sort / category filter
    if (filter === 'trending') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (filter === 'newest') {
      result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    } else if (filter !== 'all') {
      // Category filter — compare story.category against selected category id
      result = result.filter(
        (story) => story.category?.toLowerCase() === filter.toLowerCase()
      );
    }

    setFilteredStories(result);
  };

  // Fetch all stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          const transformedStories: Story[] = (data.stories || []).map((story: any) => ({
            id: story.id.toString(),
            title: story.title,
            category: story.category,
            author: story.creator_name ? story.creator_name : 'John',
            coverImage: story.thumbnail_path ? `/uploads/${story.thumbnail_path}` : '/placeholder.jpg',
            imageHint: 'story cover',
            audioUrl: story.audio_path ? `/uploads/${story.audio_path}` : '',
            duration: '00:00',
            likes: story.likes || 0,
            commentCount: Number(story.comment_count) || 0,
            comments: [],
          }));
          setAllStories(transformedStories);
          // Default: show all stories
          filterStories(transformedStories, '', 'all');
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterStories(allStories, query, activeFilter);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterStories(allStories, searchQuery, filter);
  };

  const getEmptyMessage = () => {
    if (searchQuery) return 'No stories found matching your search.';
    const isCategoryFilter = activeFilter !== 'all' && activeFilter !== 'trending' && activeFilter !== 'newest';
    if (isCategoryFilter) {
      const name = categories.find((c) => c.id === activeFilter)?.name ?? activeFilter;
      return `No stories available in the "${name}" category yet.`;
    }
    return 'No stories available yet. Check back soon!';
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
      <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} categories={categories} />

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{getEmptyMessage()}</p>
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
