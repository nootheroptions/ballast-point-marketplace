'use client';

import { useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { connectStripeAccount } from '@/actions/stripe-connect';

interface ConnectStripeButtonProps {
  hasExistingAccount: boolean;
  isAccountActive: boolean;
}

export function ConnectStripeButton({
  hasExistingAccount,
  isAccountActive,
}: ConnectStripeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await connectStripeAccount({});

      if (!result.success) {
        setError(result.error ?? 'Failed to connect Stripe account');
        return;
      }

      // Redirect to Stripe onboarding
      if (result.data?.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      }
    } catch (err) {
      console.error('Error connecting Stripe account:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if account is already fully active
  if (isAccountActive) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Open Stripe Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleConnect} disabled={loading} size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : hasExistingAccount ? (
          'Continue Setup'
        ) : (
          'Connect with Stripe'
        )}
      </Button>

      {error && (
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {!hasExistingAccount && (
        <p className="text-muted-foreground text-sm">
          You&apos;ll be redirected to Stripe to complete the setup process.
        </p>
      )}
    </div>
  );
}
