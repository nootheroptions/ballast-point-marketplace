'use client';

import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function ComingSoonHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[74rem] px-8 md:px-10 lg:px-12">
        {/* Desktop Layout */}
        <div className="hidden py-6 lg:block">
          <div className="flex items-center justify-between gap-8">
            <Logo href="/home" size="lg" />
            <nav className="flex min-w-[22rem] items-center justify-between gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-background'
                      : 'text-background hover:text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex items-center justify-between py-4 lg:hidden">
          <Logo href="/home" size="md" />

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-background hover:bg-background/10 h-10 w-10 rounded-full"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="bg-muted border-b px-6 py-4">
                <SheetTitle className="text-left text-xl font-bold">Buildipedia</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
