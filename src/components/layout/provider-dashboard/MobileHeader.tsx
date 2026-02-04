'use client';

import { Menu } from 'lucide-react';
import { MobileNav, MobileNavTrigger } from './MobileNav';

export function MobileHeader() {
  return (
    <header className="border-sidebar-border bg-sidebar flex h-14 items-center border-b px-4">
      <MobileNav>
        <MobileNavTrigger>
          <Menu className="text-sidebar-foreground h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </MobileNavTrigger>
      </MobileNav>
      <span className="text-sidebar-foreground ml-3 text-lg font-bold">Ballast Point</span>
    </header>
  );
}
