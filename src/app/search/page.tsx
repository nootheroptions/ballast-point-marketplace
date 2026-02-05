import { searchServices } from '@/actions/services';
import { getUserWithProvider } from '@/actions/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MarketplaceHeader } from '@/components/shared/marketplace-header';
import Link from 'next/link';
import Image from 'next/image';

// Format price from cents to AUD
function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

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
              <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant="secondary">{formatPrice(service.priceCents)}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  {/* Service Description and Positioning - takes available space */}
                  <div className="mb-4 flex-1 space-y-2">
                    {service.positioning && (
                      <p className="text-primary text-sm font-medium">{service.positioning}</p>
                    )}
                    {service.description && (
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Separator and Provider Info - pinned to bottom */}
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
                </CardContent>
              </Card>
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
