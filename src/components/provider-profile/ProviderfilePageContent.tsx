'use client';

import { ProviderProfile } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BasicInfoForm } from './BasicInfoForm';
import { LicensingForm } from './LicensingForm';
import { ServiceAreasForm } from './ServiceAreasForm';
import { ProviderProfileMenu, type ProfileTab } from './ProviderProfileMenu';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import { PageHeader } from '../layout/provider-dashboard/PageHeader';

interface ProfilePageClientProps {
  profile: ProviderProfile;
}

const VALID_TABS: ProfileTab[] = ['basic-info', 'licensing', 'service-areas'];

function isValidTab(tab: string | null): tab is ProfileTab {
  return VALID_TABS.includes(tab as ProfileTab);
}

function getTabFromSearchParams(searchParams: URLSearchParams): ProfileTab {
  const tabParam = searchParams.get('tab');
  return isValidTab(tabParam) ? tabParam : 'basic-info';
}

export function ProviderProfilePageClient({ profile }: ProfilePageClientProps) {
  const searchParams = useSearchParams();

  const [selectedTab, setSelectedTab] = useState<ProfileTab>(() => {
    return getTabFromSearchParams(new URLSearchParams(searchParams.toString()));
  });

  const handleTabChange = useCallback((tab: ProfileTab) => {
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get('tab') === tab) return;

    setSelectedTab(tab);

    currentParams.set('tab', tab);

    const nextUrl = `${window.location.pathname}?${currentParams.toString()}${window.location.hash}`;
    const nextState =
      window.history.state && typeof window.history.state === 'object'
        ? { ...window.history.state }
        : window.history.state;
    window.history.pushState(nextState, '', nextUrl);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextTab = getTabFromSearchParams(new URLSearchParams(window.location.search));
      setSelectedTab(nextTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PageHeaderProvider>
      <div className="max-w-7xl">
        <PageHeader title="Profile" subtitle="Manage your business profile information." />

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left sidebar - Profile menu */}
          <ProviderProfileMenu selectedTab={selectedTab} onTabChange={handleTabChange} />

          {/* Right side - Profile content */}
          <div className="min-w-0 flex-1">
            {selectedTab === 'basic-info' && <BasicInfoForm profile={profile} />}
            {selectedTab === 'licensing' && <LicensingForm key="licensing" />}
            {selectedTab === 'service-areas' && (
              <ServiceAreasForm key="service-areas" onTabChange={handleTabChange} />
            )}
          </div>
        </div>
      </div>
    </PageHeaderProvider>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

export function ProviderProfilePageSkeleton() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left sidebar skeleton */}
        <div className="w-full lg:w-64">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Right side form skeleton */}
        <div className="min-w-0 flex-1">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
