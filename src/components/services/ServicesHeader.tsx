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
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';

export function ServicesHeader() {
  return (
    <PageHeader title="Services" subtitle="View and manage the services offered by your business.">
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
    </PageHeader>
  );
}
