'use client';

import { ProviderProfile } from '@prisma/client';
import { useState } from 'react';
import { BasicInfoForm } from './BasicInfoForm';
import { ProviderProfileHeader } from './ProviderProfileHeader';
import { ProviderProfileMenu } from './ProviderProfileMenu';

type ProfileTab = 'basic-info';

interface ProfilePageClientProps {
  profile: ProviderProfile;
}

export function ProviderProfilePageClient({ profile }: ProfilePageClientProps) {
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('basic-info');

  return (
    <div className="max-w-7xl">
      <ProviderProfileHeader />

      <div className="mt-8 flex gap-8">
        {/* Left sidebar - Profile menu */}
        <ProviderProfileMenu selectedTab={selectedTab} onTabChange={setSelectedTab} />

        {/* Right side - Profile content */}
        <div className="min-w-0 flex-1">
          {selectedTab === 'basic-info' && <BasicInfoForm profile={profile} />}
        </div>
      </div>
    </div>
  );
}
