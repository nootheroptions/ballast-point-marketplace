'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils/shadcn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navItems, useNavigation } from './navigation.config';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { pathname, expandedId, handleItemClick, checkIsActive } = useNavigation();

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex h-full', className)}>
        {/* Icon Rail */}
        <div className="bg-sidebar flex w-16 flex-col items-center py-4">
          {/* Logo placeholder */}
          <div className="mb-6 flex h-10 w-10 items-center justify-center">
            <span className="text-sidebar-foreground text-lg font-bold">BP</span>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-1 flex-col items-center gap-2">
            {navItems.map((item) => {
              const isActive = checkIsActive(item);
              const isExpanded = expandedId === item.id;
              const Icon = item.icon;

              if (item.href && !item.subItems) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={() => handleItemClick(item)}
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
              }

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        isActive || isExpanded
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  {!isExpanded && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Expanded Panel */}
        {expandedId && (
          <div className="border-sidebar-border bg-sidebar w-48 border-r py-4">
            {navItems
              .filter((item) => item.id === expandedId && item.subItems)
              .map((item) => (
                <div key={item.id}>
                  <h2 className="text-sidebar-foreground px-4 py-2 text-sm font-semibold">
                    {item.label}
                  </h2>
                  <nav className="mt-2 flex flex-col">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'px-4 py-2 text-sm transition-colors',
                            isSubActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
