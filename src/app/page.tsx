import { getUserWithProvider } from '@/actions/users';
import { MarketplaceHeader } from '@/components/shared/marketplace-header';
import { HeroSearch } from '@/components/home/hero-search';

export default async function Home() {
  const { user, hasProvider, providerSlug } = await getUserWithProvider();

  return (
    <div className="from-primary/20 via-primary/10 to-primary/5 min-h-screen bg-gradient-to-b">
      <MarketplaceHeader
        showSearchBar={false}
        user={user}
        hasProvider={hasProvider}
        providerSlug={providerSlug}
      />

      <main className="px-4 pt-32 pb-20 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-6xl lg:text-7xl">
              Find the right architecture service for your project
            </h1>
            <p className="mx-auto max-w-4xl text-lg text-gray-700 md:text-xl">
              Compare productized services from experienced architects. Fixed pricing, clear scope,
              fast turnaround.
            </p>
          </div>

          {/* Search Bar */}
          <HeroSearch />
        </div>
      </main>
    </div>
  );
}
