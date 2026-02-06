export const dynamic = 'force-dynamic';

import { searchServices } from '@/actions/services';
import { getUserWithProvider } from '@/actions/users';
import { MarketplaceHeader } from '@/components/shared/marketplace-header';
import { ServiceCard } from '@/components/marketplace/service-card';
import Link from 'next/link';

export default async function SearchPage() {
  const services = await searchServices();
  const { user, hasProvider, providerSlug } = await getUserWithProvider();

  return (
    <>
      <MarketplaceHeader
        showSearchBar={true}
        user={user}
        hasProvider={hasProvider}
        providerSlug={providerSlug}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Architecture Services</h1>
          <p className="text-muted-foreground">
            {services.length} {services.length === 1 ? 'service' : 'services'} available
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/${service.providerProfile.slug}/${service.slug}`}
              className="block"
            >
              <ServiceCard service={service} variant="with-provider" />
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <div className="py-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">No services available yet</h2>
            <p className="text-muted-foreground">Check back soon for architecture services.</p>
          </div>
        )}
      </div>
    </>
  );
}
