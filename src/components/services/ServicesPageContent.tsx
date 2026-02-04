'use client';

import { useState, useMemo } from 'react';
import { Service, TemplateKey } from '@prisma/client';
import { CategoryMenu } from './CategoryMenu';
import { ServiceList } from './ServiceList';
import { ServicesHeader } from './ServicesHeader';

interface ServicesPageContentProps {
  services: Service[];
}

export function ServicesPageContent({ services }: ServicesPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateKey | 'all'>('all');

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
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter((service) => service.templateKey === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <div className="max-w-7xl">
      <ServicesHeader />

      <div className="mt-8 flex gap-8">
        {/* Left sidebar - Category menu */}
        <CategoryMenu
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          serviceCounts={serviceCounts}
        />

        {/* Right side - Service list */}
        <div className="min-w-0 flex-1">
          <ServiceList services={filteredServices} isFiltered={selectedCategory !== 'all'} />
        </div>
      </div>
    </div>
  );
}
