'use client';

import { Menu } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { MobileNav, MobileNavTrigger } from './MobileNav';

interface MobileHeaderProps {
  hasProvider?: boolean;
}

export function MobileHeader({ hasProvider = true }: MobileHeaderProps) {
  return (
    <header className="border-sidebar-border bg-sidebar flex h-14 items-center border-b px-4">
      <MobileNav hasProvider={hasProvider}>
        <MobileNavTrigger>
          <Menu className="text-sidebar-foreground h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </MobileNavTrigger>
      </MobileNav>
      <Logo href="/" size="md" className="ml-3" />
    </header>
  );
}
