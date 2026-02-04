'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils/shadcn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navItems, useNavigation } from './navigation.config';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { checkIsActive } = useNavigation();

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex h-full', className)}>
        {/* Icon Rail */}
        <div className="bg-sidebar flex w-16 flex-col items-center pt-16 pb-4">
          {/* Nav Items */}
          <nav className="flex flex-1 flex-col items-center gap-2 pt-4">
            {navItems.map((item) => {
              const isActive = checkIsActive(item);
              const Icon = item.icon;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
