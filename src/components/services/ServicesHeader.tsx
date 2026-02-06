'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, FileText, Package } from 'lucide-react';

export function ServicesHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Services</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View and manage the services offered by your business.
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/services/new" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Create Service
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/services/new-bundle" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Create Bundle
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
