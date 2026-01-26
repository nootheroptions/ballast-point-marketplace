'use client';

import { Service } from '@prisma/client';
import { ServiceActions } from './ServiceActions';

interface ServiceListProps {
  services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="border-muted-foreground/25 bg-muted/20 mt-8 rounded-lg border border-dashed p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">No services yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first service to start managing your business offerings.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="border-l-primary bg-card rounded-lg border border-l-4 p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
              {service.description && (
                <p className="text-muted-foreground line-clamp-2 text-sm">{service.description}</p>
              )}
            </div>
            <ServiceActions service={service} />
          </div>
        </div>
      ))}
    </div>
  );
}
