'use client';

import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/podcast', label: 'Podcast' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function ComingSoonHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[74rem] px-4 md:px-10 lg:px-12">
        {/* Desktop Layout */}
        <div className="hidden py-6 lg:block">
          <div className="flex items-center justify-between gap-8">
            <Logo href="/home" size="lg" className="-ml-1" />
            <nav className="flex min-w-[12rem] items-center justify-between">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-background'
                      : 'text-background hover:decoration-background decoration-2 underline-offset-4 hover:underline'
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-background hover:bg-background/10 h-10 w-10 rounded-full"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="bg-foreground/50 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Panel - positioned to overlay the original header */}
          <div className="absolute inset-x-0 -top-3 z-50 px-1 pt-3 lg:hidden">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              {/* Dropdown Header - matches original header */}
              <div className="bg-primary px-4">
                <div className="flex items-center justify-between py-4">
                  <Logo href="/home" size="md" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-background text-foreground hover:bg-background/90 h-10 w-10 rounded-full"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="bg-background flex flex-col px-4 py-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-3 text-base font-medium transition-colors ${
                        isActive ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
