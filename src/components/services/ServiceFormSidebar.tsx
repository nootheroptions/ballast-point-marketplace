'use client';

import { cn } from '@/lib/utils/shadcn';

interface SidebarSection {
  id: string;
  label: string;
  enabled: boolean;
}

const sections: SidebarSection[] = [{ id: 'basic', label: 'Basic details', enabled: true }];

interface ServiceFormSidebarProps {
  activeSection: string;
}

export function ServiceFormSidebar({ activeSection }: ServiceFormSidebarProps) {
  return (
    <aside className="bg-muted/30 hidden border-r lg:flex lg:w-64 lg:flex-col">
      <div className="p-6">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              disabled={!section.enabled}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : section.enabled
                    ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    : 'text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
