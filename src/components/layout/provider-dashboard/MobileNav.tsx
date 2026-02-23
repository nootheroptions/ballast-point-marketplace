'use client';

import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils/shadcn';
import { useNavigation, NavItem, navItems } from './navigation.config';

interface MobileNavProps {
  children: React.ReactNode;
  hasProvider?: boolean;
}

export function MobileNav({ children, hasProvider = true }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const { pathname, checkIsActive } = useNavigation();

  const onItemClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="bg-sidebar w-72 p-0">
        <SheetHeader className="border-sidebar-border border-b p-4">
          <SheetTitle className="text-sidebar-foreground text-left">
            <Logo href="/" size="md" />
          </SheetTitle>
        </SheetHeader>
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col py-4">
            {navItems.map((item) => {
              const isActive = checkIsActive(item);
              const Icon = item.icon;
              const isDisabled = !hasProvider && item.id !== 'home';

              return isDisabled ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex cursor-not-allowed items-center gap-3 px-4 py-3 text-sm',
                        'text-sidebar-foreground/30'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Please complete your onboarding to access this page
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onItemClick}
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
            })}
          </nav>
        </TooltipProvider>
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
