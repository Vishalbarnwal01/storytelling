'use client';

import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Grid2X2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type FilterType = 'all' | 'trending' | 'newest' | string;

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  categories: { id: string; name: string }[];
}

export default function FilterTabs({ activeFilter, onFilterChange, categories }: FilterTabsProps) {
  const isCategoryActive = categories.some(c => c.id === activeFilter);

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
      <div className="flex flex-wrap gap-2">
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

      <div className="w-full md:w-[250px]">
        <Select 
          value={isCategoryActive ? activeFilter : "placeholder"} 
          onValueChange={(val) => {
            if (val && val !== "placeholder") onFilterChange(val);
          }}
        >
          <SelectTrigger className={isCategoryActive ? "border-primary" : ""}>
            <div className="flex items-center gap-2">
              <Grid2X2 className="w-4 h-4 opacity-70" />
              <SelectValue placeholder="Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder" disabled className="text-muted-foreground">Select a category...</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
