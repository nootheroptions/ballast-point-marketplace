import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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

  return {
    title: `${provider.name} - Provider Profile`,
    description: provider.description || `View services and bundles from ${provider.name}`,
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

  return (
    <div className="space-y-8">
      <ImageCarousel imageUrls={provider.imageUrls} alt={`${provider.name} images`} />
      <ProviderProfileHeader provider={provider} />
      <ProviderServicesSection provider={provider} services={services} bundles={bundles} />
    </div>
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
