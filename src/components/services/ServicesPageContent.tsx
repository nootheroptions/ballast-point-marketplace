'use client';

import { useState, useMemo } from 'react';
import { Service, TemplateKey } from '@prisma/client';
import { CategoryMenu, CategoryType } from './CategoryMenu';
import { ServiceList } from './ServiceList';
import { BundleList } from './BundleList';
import { ServicesHeader } from './ServicesHeader';
import { BundleWithServices } from '@/lib/repositories/bundle.repo';

interface ServicesPageContentProps {
  services: Service[];
  bundles: (BundleWithServices & { calculatedPriceCents: number })[];
}

export function ServicesPageContent({ services, bundles }: ServicesPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  // Calculate service counts per category
  const serviceCounts = useMemo(() => {
    const counts: Record<TemplateKey, number> = {
      [TemplateKey.CONSULTATION]: 0,
      [TemplateKey.FEASIBILITY]: 0,
      [TemplateKey.CONCEPT_DESIGN]: 0,
      [TemplateKey.PLANNING_APPROVALS]: 0,
      [TemplateKey.REVIEW]: 0,
    };

    services.forEach((service) => {
      if (service.templateKey) {
        counts[service.templateKey] = (counts[service.templateKey] || 0) + 1;
      }
    });

    return counts;
  }, [services]);

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === 'bundle') {
      return selectedCategory === 'bundle' ? [] : services;
    }
    return services.filter((service) => service.templateKey === selectedCategory);
  }, [services, selectedCategory]);

  // Show bundles only when "all" or "bundle" is selected
  const showBundles = selectedCategory === 'all' || selectedCategory === 'bundle';
  const filteredBundles = showBundles ? bundles : [];

  return (
    <div className="max-w-7xl">
      <ServicesHeader />

      <div className="mt-8 flex gap-8">
        {/* Left sidebar - Category menu */}
        <CategoryMenu
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          serviceCounts={serviceCounts}
          bundleCount={bundles.length}
        />

        {/* Right side - Service and Bundle lists */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Services section */}
          {selectedCategory !== 'bundle' && (
            <ServiceList services={filteredServices} isFiltered={selectedCategory !== 'all'} />
          )}

          {/* Bundles section - show after services */}
          {filteredBundles.length > 0 && (
            <BundleList bundles={filteredBundles} isFiltered={selectedCategory === 'bundle'} />
          )}

          {/* Empty state when bundle filter is selected but no bundles */}
          {selectedCategory === 'bundle' && filteredBundles.length === 0 && (
            <div className="border-muted-foreground/25 bg-muted/20 rounded-lg border border-dashed p-12 text-center">
              <h3 className="mb-2 text-lg font-semibold">No bundles yet</h3>
              <p className="text-muted-foreground text-sm">
                Create your first bundle to offer packaged services to clients.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
