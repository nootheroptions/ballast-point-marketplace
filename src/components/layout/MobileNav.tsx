'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils/shadcn';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { navItems, useNavigation, type NavItem } from './navigation.config';

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const { pathname, expandedId, handleItemClick, checkIsActive } = useNavigation({
    onNavigate: () => setOpen(false),
  });

  const onItemClick = (item: NavItem) => {
    handleItemClick(item);
    if (!item.subItems) {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="bg-sidebar w-72 p-0">
        <SheetHeader className="border-sidebar-border border-b p-4">
          <SheetTitle className="text-sidebar-foreground text-left">
            <span className="text-lg font-bold">Ballast Point</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-4">
          {navItems.map((item) => {
            const isActive = checkIsActive(item);
            const isExpanded = expandedId === item.id;
            const Icon = item.icon;

            if (item.href && !item.subItems) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onItemClick(item)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.id}>
                <button
                  onClick={() => onItemClick(item)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && item.subItems && (
                  <div className="bg-sidebar-accent/50">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'block py-2 pr-4 pl-12 text-sm transition-colors',
                            isSubActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function MobileNavTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  return <Button variant="ghost" size="icon" className={className} {...props} />;
}
