'use client';

import { TemplateKey } from '@prisma/client';
import { cn } from '@/lib/utils/shadcn';
import { TEMPLATES } from '@/lib/marketplace/templates';

export type CategoryType = TemplateKey | 'all' | 'bundle';

interface CategoryMenuProps {
  selectedCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  serviceCounts: Record<TemplateKey, number>;
  bundleCount: number;
}

export function CategoryMenu({
  selectedCategory,
  onCategoryChange,
  serviceCounts,
  bundleCount,
}: CategoryMenuProps) {
  const totalServices = Object.values(serviceCounts).reduce((sum, count) => sum + count, 0);
  const totalItems = totalServices + bundleCount;

  return (
    <div className="sticky top-24 hidden w-64 flex-shrink-0 lg:block">
      <div className="space-y-1">
        {/* All */}
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span>All</span>
          <span
            className={cn(
              'text-xs',
              selectedCategory === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {totalItems}
          </span>
        </button>

        {/* Divider */}
        <div className="py-2">
          <div className="border-border border-t" />
        </div>

        {/* Service Categories */}
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

        {/* Divider */}
        <div className="py-2">
          <div className="border-border border-t" />
        </div>

        {/* Bundles */}
        <button
          onClick={() => onCategoryChange('bundle')}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors',
            selectedCategory === 'bundle'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <span className="flex items-center gap-2">Bundles</span>
          <span
            className={cn(
              'text-xs',
              selectedCategory === 'bundle' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {bundleCount}
          </span>
        </button>
      </div>
    </div>
  );
}
