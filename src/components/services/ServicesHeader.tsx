'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ServicesHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Services</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View and manage the services offered by your business.
        </p>
      </div>
      <Button asChild>
        <Link href="/services/new">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Link>
      </Button>
    </div>
  );
}
