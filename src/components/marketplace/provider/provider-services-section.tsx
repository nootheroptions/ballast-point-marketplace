import Link from 'next/link';
import type { PublicProvider, PublicService, PublicBundleWithServices } from '@/lib/types/public';
import { ServiceCard } from './service-card';
import { BundleCard } from './bundle-card';

interface ProviderServicesSectionProps {
  provider: PublicProvider;
  services: PublicService[];
  bundles: PublicBundleWithServices[];
}

export function ProviderServicesSection({
  provider,
  services,
  bundles,
}: ProviderServicesSectionProps) {
  const hasItems = services.length > 0 || bundles.length > 0;

  if (!hasItems) {
    return (
      <div className="bg-muted/50 rounded-lg py-12 text-center">
        <h2 className="mb-2 text-xl font-semibold">No Services Available</h2>
        <p className="text-muted-foreground">
          This provider hasn&apos;t published any services or bundles yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Services Section */}
      {services.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Services</h2>
            <p className="text-muted-foreground mt-1">
              {services.length} {services.length === 1 ? 'service' : 'services'} available
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.id} href={`/${provider.slug}/${service.slug}`} className="block">
                <ServiceCard service={service} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bundles Section */}
      {bundles.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Bundles</h2>
            <p className="text-muted-foreground mt-1">
              {bundles.length} {bundles.length === 1 ? 'bundle' : 'bundles'} available
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
