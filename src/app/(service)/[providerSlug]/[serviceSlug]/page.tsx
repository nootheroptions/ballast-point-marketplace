import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { env } from '@/lib/config/env';
import { getServiceBySlug } from '@/actions/services';
import { getUserWithProvider } from '@/actions/users';
import {
  MarketplaceHeader,
  MarketplaceHeaderSkeleton,
} from '@/components/shared/marketplace-header';
import { ServiceDetailHeader } from '@/components/marketplace/service/service-detail-header';
import { WhatsIncluded } from '@/components/marketplace/service/whats-included';
import { ClientRequirements } from '@/components/marketplace/service/client-requirements';
import { WhatsNotIncluded } from '@/components/marketplace/service/whats-not-included';
import { ProviderInfo } from '@/components/marketplace/service/provider-info';
import { BookingCard } from '@/components/marketplace/service/booking-card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageCarousel } from '@/components/shared/ImageCarousel';
import { formatPrice } from '@/lib/utils/format-price';
import { serializeJsonLd } from '@/lib/utils/json-ld';

interface ServiceDetailPageProps {
  params: Promise<{
    providerSlug: string;
    serviceSlug: string;
  }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { providerSlug, serviceSlug } = await params;
  const service = await getServiceBySlug(providerSlug, serviceSlug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const priceFormatted = formatPrice(service.priceCents);
  const title = `${service.name} | ${service.providerProfile.name}`;
  const description =
    service.description ||
    `${service.name} by ${service.providerProfile.name}. ${priceFormatted}. ${service.positioning || ''}`.trim();
  const imageUrl = service.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: service.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `/${providerSlug}/${serviceSlug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { providerSlug, serviceSlug } = await params;

  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={<MarketplaceHeaderSkeleton />}>
        <MarketplaceHeaderAsync />
      </Suspense>

      <Suspense fallback={<ServiceDetailSkeleton />}>
        <ServiceDetailContent providerSlug={providerSlug} serviceSlug={serviceSlug} />
      </Suspense>
    </div>
  );
}

async function MarketplaceHeaderAsync() {
  const { user, hasProvider, providerSlug: userProviderSlug } = await getUserWithProvider();

  return (
    <MarketplaceHeader
      showSearchBar={true}
      user={user}
      hasProvider={hasProvider}
      providerSlug={userProviderSlug}
    />
  );
}

async function ServiceDetailContent({
  providerSlug,
  serviceSlug,
}: {
  providerSlug: string;
  serviceSlug: string;
}) {
  const service = await getServiceBySlug(providerSlug, serviceSlug);

  if (!service) {
    notFound();
  }

  const templateData = service.templateData as Record<string, unknown>;
  const clientResponsibilities = service.clientResponsibilities as string[] | undefined;

  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: service.providerProfile.name,
      description: service.providerProfile.description || undefined,
      image: service.providerProfile.imageUrls?.[0],
      url: `${baseUrl}/providers/${providerSlug}`,
    },
    offers: {
      '@type': 'Offer',
      price: service.priceCents / 100,
      priceCurrency: 'AUD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/${providerSlug}/${serviceSlug}`,
    },
    image: service.imageUrls?.[0],
    url: `${baseUrl}/${providerSlug}/${serviceSlug}`,
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column - Scrollable content */}
          <div className="space-y-8 lg:col-span-2">
            <ImageCarousel imageUrls={service.imageUrls} alt={`${service.name} images`} />

            {/* Header */}
            <ServiceDetailHeader
              serviceName={service.name}
              providerName={service.providerProfile.name}
              positioning={service.positioning || undefined}
              templateKey={service.templateKey}
            />

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">About This Service</h2>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>

            {/* What's Included */}
            <WhatsIncluded
              templateKey={service.templateKey}
              templateData={templateData}
              coveragePackageKey={service.coveragePackageKey || undefined}
              leadTimeDays={service.leadTimeDays}
              turnaroundDays={service.turnaroundDays}
            />

            {/* What We Need From You */}
            <ClientRequirements
              templateKey={service.templateKey}
              templateData={templateData}
              clientResponsibilities={clientResponsibilities}
              assumptions={service.assumptions || undefined}
            />

            {/* What's NOT Included */}
            <WhatsNotIncluded templateKey={service.templateKey} />

            {/* Provider Info - shown above How It Works on all screen sizes */}
            <ProviderInfo provider={service.providerProfile} />

            {/* Timeline/Process placeholder */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">How It Works</h2>
              <div className="bg-muted/50 space-y-4 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Request Booking</h3>
                    <p className="text-muted-foreground text-sm">
                      Submit your project details and any required documents
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Kickoff Meeting</h3>
                    <p className="text-muted-foreground text-sm">
                      Meet with the provider to discuss your vision and requirements
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Delivery</h3>
                    <p className="text-muted-foreground text-sm">
                      Receive your completed service within {service.turnaroundDays} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Pinned booking card */}
          <div className="lg:col-span-1">
            {/* Booking Card - sticky and full height */}
            <BookingCard
              providerSlug={providerSlug}
              serviceSlug={serviceSlug}
              priceCents={service.priceCents}
              leadTimeDays={service.leadTimeDays}
              turnaroundDays={service.turnaroundDays}
              deliveryMode={service.deliveryMode}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ServiceDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-lg md:h-96" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-4 rounded-lg border p-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
