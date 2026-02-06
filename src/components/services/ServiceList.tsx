'use client';

import { Service } from '@prisma/client';
import { ServiceItem } from './ServiceItem';

interface ServiceListProps {
  services: Service[];
  isFiltered?: boolean;
}

export function ServiceList({ services, isFiltered = false }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="border-muted-foreground/25 bg-muted/20 rounded-lg border border-dashed p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">
          {isFiltered ? 'No services in this category' : 'No services yet'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {isFiltered
            ? 'Try selecting a different category or create a new service.'
            : 'Create your first service to start managing your business offerings.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <ServiceItem key={service.id} service={service} />
      ))}
    </div>
  );
}
