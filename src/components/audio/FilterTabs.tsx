'use client';

import { TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type FilterType = 'all' | 'trending' | 'newest';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant={activeFilter === 'all' ? 'default' : 'outline'}
        onClick={() => onFilterChange('all')}
        className="whitespace-nowrap"
      >
        All Stories
      </Button>

      <Button
        variant={activeFilter === 'trending' ? 'default' : 'outline'}
        onClick={() => onFilterChange('trending')}
        className="whitespace-nowrap gap-2"
      >
        <TrendingUp size={18} />
        Trending
      </Button>

      <Button
        variant={activeFilter === 'newest' ? 'default' : 'outline'}
        onClick={() => onFilterChange('newest')}
        className="whitespace-nowrap gap-2"
      >
        <Clock size={18} />
        Newest
      </Button>
    </div>
  );
}
