'use client';

import { Service } from '@prisma/client';
import { ServiceActions } from './ServiceActions';
import { Clock, Calendar } from 'lucide-react';

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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = minutes / 60;
    return hours === 1 ? '1hr' : `${hours}hrs`;
  };

  const formatAdvanceTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return hours === 1 ? '1hr' : `${hours}hrs`;
    }
    const days = Math.floor(minutes / 1440);
    return days === 1 ? '1 day' : `${days} days`;
  };

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="border-l-primary bg-card rounded-lg border border-l-4 p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-lg font-semibold">{service.name}</h3>
              {service.description && (
                <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                  {service.description}
                </p>
              )}

              {/* Booking settings display */}
              <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDuration(service.slotDuration)} appointments</span>
                </div>
                {service.slotBuffer > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span>•</span>
                    <span>{formatDuration(service.slotBuffer)} buffer</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Book {formatAdvanceTime(service.advanceBookingMin)} -{' '}
                    {formatAdvanceTime(service.advanceBookingMax)} ahead
                  </span>
                </div>
              </div>
            </div>
            <ServiceActions service={service} />
          </div>
        </div>
      ))}
    </div>
  );
}
