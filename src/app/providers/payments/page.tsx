import { Suspense } from 'react';
import { getStripeAccountStatus } from '@/actions/stripe-connect';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import {
  StripeConnectStatus,
  StripeConnectStatusSkeleton,
} from '@/components/payments/StripeConnectStatus';
import { ConnectStripeButton } from '@/components/payments/ConnectStripeButton';

export default function PaymentsPage() {
  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="Payments"
          subtitle="Manage your payment settings and connect your Stripe account to receive payments from clients."
        />

        <Suspense fallback={<PaymentsContentSkeleton />}>
          <PaymentsContent />
        </Suspense>
      </div>
    </PageHeaderProvider>
  );
}

async function PaymentsContent() {
  const result = await getStripeAccountStatus();

  // Handle error state
  if (!result.success) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
        <p className="text-destructive text-sm">{result.error}</p>
      </div>
    );
  }

  const accountData = result.data!;

  return (
    <div className="space-y-6">
      <StripeConnectStatus accountData={accountData} />

      <div className="flex justify-start">
        <ConnectStripeButton
          hasExistingAccount={accountData.hasAccount}
          isAccountActive={accountData.status === 'ACTIVE'}
        />
      </div>

      {/* Commission Information */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="mb-2 text-lg font-semibold">Platform Commission</h3>
        <p className="text-muted-foreground mb-4">
          A 10% platform fee is deducted from each transaction to cover payment processing, platform
          maintenance, and customer support.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Client Pays</p>
            <p className="text-2xl font-bold">$100</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Platform Fee (10%)</p>
            <p className="text-2xl font-bold">-$10</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-muted-foreground text-sm">You Receive</p>
            <p className="text-success text-2xl font-bold">$90</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsContentSkeleton() {
  return (
    <div className="space-y-6">
      <StripeConnectStatusSkeleton />
    </div>
  );
}
