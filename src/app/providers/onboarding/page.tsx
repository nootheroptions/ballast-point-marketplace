import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { OnboardingFlow } from '@/components/onboarding';
import { getOnboardingProgress } from '@/actions/onboarding';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const currentTeamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  // If user already has a team, redirect to home
  if (currentTeamId) {
    redirect('/');
  }

  const result = await getOnboardingProgress();

  // If not authenticated, the action will return an error
  // The middleware should handle redirecting to login
  if (!result.success) {
    redirect('/login');
  }

  return <OnboardingFlow initialData={result.data ?? null} />;
}
