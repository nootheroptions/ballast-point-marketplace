import { getProviderProfile } from '@/actions/providers';
import { ProviderProfilePageClient } from '@/components/provider-profile/ProviderfilePageContent';
import { ProviderProfile } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const result = await getProviderProfile();

  // Handle error cases
  if (!result.success) {
    redirect('/');
  }

  const profile = result.data as ProviderProfile;

  return <ProviderProfilePageClient profile={profile} />;
}
