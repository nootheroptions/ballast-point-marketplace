import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { env } from '@/lib/config/env';
import { getProviderBySlug } from '@/actions/providers';
import { getPublishedServicesByProviderSlug } from '@/actions/services';
import { getPublishedBundlesByProviderSlug } from '@/actions/bundles';
import { getUserWithProvider } from '@/actions/users';
import {
  MarketplaceHeader,
  MarketplaceHeaderSkeleton,
} from '@/components/shared/marketplace-header';
import {
  ProviderProfileHeader,
  ProviderProfileHeaderSkeleton,
} from '@/components/marketplace/provider/provider-profile-header';
import {
  ProviderServicesSection,
  ProviderServicesSectionSkeleton,
} from '@/components/marketplace/provider/provider-services-section';
import { ImageCarousel } from '@/components/shared/ImageCarousel';
import { serializeJsonLd } from '@/lib/utils/json-ld';

interface ProviderProfilePageProps {
  params: Promise<{
    providerSlug: string;
  }>;
}

export async function generateMetadata({ params }: ProviderProfilePageProps): Promise<Metadata> {
  const { providerSlug } = await params;
  const provider = await getProviderBySlug(providerSlug);

  if (!provider) {
    return {
      title: 'Provider Not Found',
    };
  }

  const title = `${provider.name} | Architecture Services`;
  const description =
    provider.description ||
    `Browse architecture services from ${provider.name}. View their portfolio and book consultations on Buildipedia.`;
  const imageUrl = provider.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: provider.name,
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
      canonical: `/providers/${providerSlug}`,
    },
  };
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const { providerSlug } = await params;

  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={<MarketplaceHeaderSkeleton />}>
        <MarketplaceHeaderAsync />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <Suspense fallback={<ProviderProfileSkeleton />}>
            <ProviderProfileContent providerSlug={providerSlug} />
          </Suspense>
        </div>
      </div>
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

async function ProviderProfileContent({ providerSlug }: { providerSlug: string }) {
  const [provider, services, bundles] = await Promise.all([
    getProviderBySlug(providerSlug),
    getPublishedServicesByProviderSlug(providerSlug),
    getPublishedBundlesByProviderSlug(providerSlug),
  ]);

  if (!provider) {
    notFound();
  }

  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const providerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/providers/${providerSlug}`,
    name: provider.name,
    description: provider.description || undefined,
    image: provider.imageUrls?.[0],
    url: `${baseUrl}/providers/${providerSlug}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Architecture Services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
          url: `${baseUrl}/${providerSlug}/${service.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(providerJsonLd) }}
      />
      <div className="space-y-8">
        <ImageCarousel imageUrls={provider.imageUrls} alt={`${provider.name} images`} />
        <ProviderProfileHeader provider={provider} />
        <ProviderServicesSection provider={provider} services={services} bundles={bundles} />
      </div>
    </>
  );
}

function ProviderProfileSkeleton() {
  return (
    <div className="space-y-8">
      <ProviderProfileHeaderSkeleton />
      <ProviderServicesSectionSkeleton />
    </div>
  );
}
