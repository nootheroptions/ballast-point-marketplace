import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getStripeAccountStatus } from '@/actions/stripe-connect';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentsCallbackPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<LoadingState />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}

async function CallbackContent() {
  const result = await getStripeAccountStatus();

  // Handle error
  if (!result.success) {
    return <ErrorState message={result.error ?? 'Failed to verify account status'} />;
  }

  const accountData = result.data!;

  // Account is now active
  if (accountData.status === 'ACTIVE') {
    return <SuccessState />;
  }

  // Account needs more information
  if (accountData.status === 'PENDING' || accountData.status === 'RESTRICTED') {
    return <PendingState status={accountData.status} />;
  }

  // Fallback: No account (shouldn't happen after callback)
  return <ErrorState message="No Stripe account found. Please try connecting again." />;
}

function LoadingState() {
  return (
    <div className="text-center">
      <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
      <h2 className="mt-4 text-xl font-semibold">Verifying your account...</h2>
      <p className="text-muted-foreground mt-2">Please wait while we confirm your Stripe setup.</p>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="max-w-md text-center">
      <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CheckCircle className="text-success h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
      <p className="text-muted-foreground mt-2">
        Your Stripe account is now connected and you can start accepting payments from clients.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/payments">View Payment Settings</Link>
        </Button>
      </div>
    </div>
  );
}

function PendingState({ status }: { status: 'PENDING' | 'RESTRICTED' }) {
  return (
    <div className="max-w-md text-center">
      <div className="bg-warning/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <AlertCircle className="text-warning h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold">Almost there!</h2>
      <p className="text-muted-foreground mt-2">
        {status === 'RESTRICTED'
          ? 'Your Stripe account needs some additional information before you can accept payments.'
          : 'Your Stripe account setup is incomplete. Please provide the remaining information to start accepting payments.'}
      </p>
      <div className="mt-6 space-x-3">
        <Button asChild>
          <Link href="/payments">View Status</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-md text-center">
      <div className="bg-destructive/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/payments">Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
