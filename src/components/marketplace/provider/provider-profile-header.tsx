import Image from 'next/image';
import { Building2, MapPin, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PublicProvider } from '@/lib/types/public';

interface ProviderProfileHeaderProps {
  provider: PublicProvider;
}

export function ProviderProfileHeader({ provider }: ProviderProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Provider Logo and Name */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        {provider.profileUrl ? (
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border md:h-32 md:w-32">
            <Image
              src={provider.profileUrl}
              alt={`${provider.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="bg-muted flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border md:h-32 md:w-32">
            <Building2 className="text-muted-foreground h-12 w-12 md:h-16 md:w-16" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold md:text-4xl">{provider.name}</h1>
          {provider.description && (
            <p className="text-muted-foreground mt-2 text-base md:text-lg">
              {provider.description}
            </p>
          )}
        </div>
      </div>

      {/* Provider Details */}
      <div className="border-t pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Serving Australia-wide</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Award className="h-5 w-5" />
            <span>Verified provider</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProviderProfileHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg md:h-32 md:w-32" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
      </div>
      <div className="border-t pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    </div>
  );
}
