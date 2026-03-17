'use client';

import { Button } from '@/components/ui/button';
import { Clock, TrendingUp } from 'lucide-react';

export type FilterType = 'all' | 'trending' | 'newest' | string;

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  categories: { id: string; name: string }[];
}

export default function FilterTabs({ activeFilter, onFilterChange, categories }: FilterTabsProps) {
  return (
    <div className='test'>
      <div className="flex gap-3 mb-2">
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
      <div className='flex-gap-3 '>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeFilter === category.id ? 'default' : 'outline'}
            onClick={() => onFilterChange(category.id)}
            className="whitespace-nowrap mr-2"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>

  );
}
