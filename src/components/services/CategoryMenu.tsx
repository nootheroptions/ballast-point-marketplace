'use client';

import { TemplateKey } from '@prisma/client';
import { cn } from '@/lib/utils/shadcn';
import { TEMPLATES } from '@/lib/marketplace/templates';

interface CategoryMenuProps {
  selectedCategory: TemplateKey | 'all';
  onCategoryChange: (category: TemplateKey | 'all') => void;
  serviceCounts: Record<TemplateKey, number>;
}

export function CategoryMenu({
  selectedCategory,
  onCategoryChange,
  serviceCounts,
}: CategoryMenuProps) {
  const totalServices = Object.values(serviceCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="sticky top-24 hidden w-64 flex-shrink-0 lg:block">
      <div className="space-y-1">
        {/* All Services */}
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span>All Services</span>
          <span
            className={cn(
              'text-xs',
              selectedCategory === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {totalServices}
          </span>
        </button>

        {/* Divider */}
        <div className="py-2">
          <div className="border-border border-t" />
        </div>

        {/* Categories */}
        {TEMPLATES.map((template) => {
          const count = serviceCounts[template.key] || 0;
          return (
            <button
              key={template.key}
              onClick={() => onCategoryChange(template.key)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors',
                selectedCategory === template.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span>{template.label}</span>
              <span
                className={cn(
                  'text-xs',
                  selectedCategory === template.key
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
