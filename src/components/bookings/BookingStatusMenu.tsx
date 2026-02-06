'use client';

import { cn } from '@/lib/utils/shadcn';

export type BookingFilterType = 'upcoming' | 'past' | 'all';

interface BookingStatusMenuProps {
  selectedFilter: BookingFilterType;
  onFilterChange: (filter: BookingFilterType) => void;
  counts: {
    upcoming: number;
    past: number;
    all: number;
  };
}

export function BookingStatusMenu({
  selectedFilter,
  onFilterChange,
  counts,
}: BookingStatusMenuProps) {
  const filters: { key: BookingFilterType; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="sticky top-24 hidden w-64 flex-shrink-0 lg:block">
      <div className="space-y-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
              selectedFilter === filter.key
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span>{filter.label}</span>
            <span
              className={cn(
                'text-xs',
                selectedFilter === filter.key
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              )}
            >
              {counts[filter.key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
