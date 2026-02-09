import { Suspense } from 'react';
import { getProviderProfile } from '@/actions/providers';
import {
  ProviderProfilePageClient,
  ProviderProfilePageSkeleton,
} from '@/components/provider-profile/ProviderfilePageContent';
import { ProviderProfile } from '@prisma/client';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProviderProfilePageSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}

async function ProfilePageContent() {
  const result = await getProviderProfile();

  // Handle error cases
  if (!result.success) {
    redirect('/');
  }

  const profile = result.data as ProviderProfile;

  return <ProviderProfilePageClient profile={profile} />;
}
