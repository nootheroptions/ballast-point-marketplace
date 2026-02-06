import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PublicService, PublicServiceWithProvider } from '@/lib/types/public';
import { formatPrice } from '@/lib/utils/format-price';
import { Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ServiceCardProps {
  service: PublicService | PublicServiceWithProvider;
  variant?: 'default' | 'with-provider';
  className?: string;
}

function hasProviderProfile(
  service: PublicService | PublicServiceWithProvider
): service is PublicServiceWithProvider {
  return 'providerProfile' in service;
}

export function ServiceCard({ service, variant = 'default', className }: ServiceCardProps) {
  return (
    <Card
      className={`flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg ${className ?? ''}`}
    >
      {/* Placeholder Image */}
      <div className="bg-muted relative h-48 w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/40"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{service.name}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0">
            {formatPrice(service.priceCents)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {/* Service Description and Positioning */}
        <div className="mb-4 flex-1 space-y-2">
          {service.positioning && (
            <p className="text-primary text-sm font-medium">{service.positioning}</p>
          )}
          {service.description && (
            <p className="text-muted-foreground line-clamp-3 text-sm">{service.description}</p>
          )}
        </div>

        {/* Bottom Section - varies by variant */}
        {variant === 'default' && (
          <div className="text-muted-foreground mt-auto flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{service.leadTimeDays}d lead</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{service.turnaroundDays}d delivery</span>
            </div>
          </div>
        )}

        {variant === 'with-provider' && hasProviderProfile(service) && (
          <div className="mt-auto space-y-4">
            <Separator />

            {/* Provider Info Section */}
            <div className="flex items-start gap-3">
              {service.providerProfile.logoUrl ? (
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={service.providerProfile.logoUrl}
                    alt={`${service.providerProfile.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border">
                  <span className="text-muted-foreground text-sm font-semibold">
                    {service.providerProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{service.providerProfile.name}</p>
                {service.providerProfile.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {service.providerProfile.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
