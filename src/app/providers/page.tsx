import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { getOnboardingProgress } from '@/actions/onboarding';
import { getServices } from '@/actions/services';
import { getProviderBookings } from '@/actions/bookings';
import { BookingsPageContent, type BookingWithDetails } from '@/components/bookings';

export default async function ProviderDashboard() {
  const cookieStore = await cookies();
  const currentTeamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  // User has a team - show dashboard
  if (currentTeamId) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    );
  }

  // No team - show onboarding
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingPrompt />
    </Suspense>
  );
}

async function DashboardContent() {
  const servicesResult = await getServices();

  const hasServices =
    servicesResult.success && Array.isArray(servicesResult.data) && servicesResult.data.length > 0;

  // No services yet - prompt to create one
  if (!hasServices) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">List Your First Service</CardTitle>
            <CardDescription>
              Start attracting clients by productizing your architectural services. Create packaged
              offerings like feasibility studies, concept design packages, or planning
              consultations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/services/new">Create Service</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has services - check for bookings
  const bookingsResult = await getProviderBookings();

  const hasBookings =
    bookingsResult.success && Array.isArray(bookingsResult.data) && bookingsResult.data.length > 0;

  // Has bookings - show bookings page
  if (hasBookings) {
    const bookings = bookingsResult.data as BookingWithDetails[];
    return <BookingsPageContent bookings={bookings} />;
  }

  // Has services but no bookings yet
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">No Project Requests Yet</CardTitle>
          <CardDescription>
            You haven&apos;t received any bookings yet. Ensure your service descriptions are
            polished and clearly communicate what you offer, then share your profile to start
            receiving client requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/services">View Services</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

async function OnboardingPrompt() {
  const onboardingProgress = await getOnboardingProgress();
  const hasStarted = Boolean(onboardingProgress.data);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Colabri</CardTitle>
          <CardDescription>
            Set up your business profile to start connecting with clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/onboarding">{hasStarted ? 'Continue' : 'Start Now'}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto h-16 w-full" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-12 w-48" />
        </CardContent>
      </Card>
    </div>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto h-12 w-full" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
