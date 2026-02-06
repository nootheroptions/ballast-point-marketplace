'use client';

import { cn } from '@/lib/utils/shadcn';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ProfileTab = 'basic-info' | 'licensing' | 'service-areas';

interface ProfileMenuProps {
  selectedTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const MENU_ITEMS: Array<{ id: ProfileTab; label: string }> = [
  { id: 'basic-info', label: 'Basic Information' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'service-areas', label: 'Service Areas' },
];

function isProfileTab(value: string): value is ProfileTab {
  return MENU_ITEMS.some((item) => item.id === value);
}

export function ProviderProfileMenu({ selectedTab, onTabChange }: ProfileMenuProps) {
  return (
    <div className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="lg:hidden">
        <Label htmlFor="provider-profile-tab" className="sr-only">
          Profile section
        </Label>
        <Select
          value={selectedTab}
          onValueChange={(value) => {
            if (isProfileTab(value)) onTabChange(value);
          }}
        >
          <SelectTrigger id="provider-profile-tab">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MENU_ITEMS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sticky top-24 hidden lg:block">
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
                selectedTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
