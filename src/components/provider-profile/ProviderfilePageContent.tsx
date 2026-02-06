'use client';

import { ProviderProfile } from '@prisma/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { BasicInfoForm } from './BasicInfoForm';
import { LicensingForm } from './LicensingForm';
import { ServiceAreasForm } from './ServiceAreasForm';
import { ProviderProfileHeader } from './ProviderProfileHeader';
import { ProviderProfileMenu, type ProfileTab } from './ProviderProfileMenu';

interface ProfilePageClientProps {
  profile: ProviderProfile;
}

const VALID_TABS: ProfileTab[] = ['basic-info', 'licensing', 'service-areas'];

function isValidTab(tab: string | null): tab is ProfileTab {
  return VALID_TABS.includes(tab as ProfileTab);
}

export function ProviderProfilePageClient({ profile }: ProfilePageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const selectedTab: ProfileTab = isValidTab(tabParam) ? tabParam : 'basic-info';

  const handleTabChange = (tab: ProfileTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl">
      <ProviderProfileHeader />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left sidebar - Profile menu */}
        <ProviderProfileMenu selectedTab={selectedTab} onTabChange={handleTabChange} />

        {/* Right side - Profile content */}
        <div className="min-w-0 flex-1">
          {selectedTab === 'basic-info' && <BasicInfoForm profile={profile} />}
          {selectedTab === 'licensing' && <LicensingForm />}
          {selectedTab === 'service-areas' && <ServiceAreasForm onTabChange={handleTabChange} />}
        </div>
      </div>
    </div>
  );
}
