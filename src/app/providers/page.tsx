import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';

export default async function ProviderDashboard() {
  const cookieStore = await cookies();
  const currentTeamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  // User has a team - show dashboard
  if (currentTeamId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Ballast Point Partner Portal.</p>
      </div>
    );
  }

  // User has no team - show onboarding CTA
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Ballast Point</CardTitle>
          <CardDescription>
            Set up your provider profile to start connecting with customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/onboarding">Start Now</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
