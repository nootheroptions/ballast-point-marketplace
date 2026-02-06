import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProviderBySlug } from '@/actions/providers';
import { getPublishedServicesByProviderSlug } from '@/actions/services';
import { getPublishedBundlesByProviderSlug } from '@/actions/bundles';
import { getUserWithProvider } from '@/actions/users';
import { MarketplaceHeader } from '@/components/shared/marketplace-header';
import { ProviderProfileHeader } from '@/components/marketplace/provider/provider-profile-header';
import { ProviderServicesSection } from '@/components/marketplace/provider/provider-services-section';

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
  const [provider, services, bundles, { user, hasProvider, providerSlug: userProviderSlug }] =
    await Promise.all([
      getProviderBySlug(providerSlug),
      getPublishedServicesByProviderSlug(providerSlug),
      getPublishedBundlesByProviderSlug(providerSlug),
      getUserWithProvider(),
    ]);

  if (!provider) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <MarketplaceHeader
        showSearchBar={true}
        user={user}
        hasProvider={hasProvider}
        providerSlug={userProviderSlug}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Provider Header */}
          <ProviderProfileHeader provider={provider} />

          {/* Services and Bundles Section */}
          <ProviderServicesSection provider={provider} services={services} bundles={bundles} />
        </div>
      </div>
    </div>
  );
}
