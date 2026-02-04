'use client';

import { cn } from '@/lib/utils/shadcn';

type ProfileTab = 'basic-info';

interface ProfileMenuProps {
  selectedTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProviderProfileMenu({ selectedTab, onTabChange }: ProfileMenuProps) {
  return (
    <div className="sticky top-24 hidden w-64 flex-shrink-0 lg:block">
      <div className="space-y-1">
        <button
          onClick={() => onTabChange('basic-info')}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
            selectedTab === 'basic-info'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span>Basic Information</span>
        </button>
      </div>
    </div>
  );
}
