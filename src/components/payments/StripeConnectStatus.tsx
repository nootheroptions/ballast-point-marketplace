'use client';

import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StripeAccountData {
  hasAccount: boolean;
  accountId: string | null;
  status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' | null;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
}

interface StripeConnectStatusProps {
  accountData: StripeAccountData;
}

export function StripeConnectStatus({ accountData }: StripeConnectStatusProps) {
  const { hasAccount, status, detailsSubmitted, payoutsEnabled, chargesEnabled, requirements } =
    accountData;

  if (!hasAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-5 w-5" />
            No Stripe Account
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to start accepting payments from clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-medium">Why connect Stripe?</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Accept secure payments from clients</li>
                <li>Get paid directly to your bank account</li>
                <li>Track all your earnings in one place</li>
                <li>Stripe handles all payment security and compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'ACTIVE') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-success h-5 w-5" />
                Payments Enabled
              </CardTitle>
              <CardDescription>
                Your Stripe account is fully set up and ready to accept payments.
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-success">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatusItem label="Details Submitted" enabled={detailsSubmitted} />
            <StatusItem label="Charges Enabled" enabled={chargesEnabled} />
            <StatusItem label="Payouts Enabled" enabled={payoutsEnabled} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'RESTRICTED') {
    return (
      <Card className="border-warning">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-warning h-5 w-5" />
                Action Required
              </CardTitle>
              <CardDescription>
                Your Stripe account needs attention before you can accept payments.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-warning text-warning">
              Restricted
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatusItem label="Details Submitted" enabled={detailsSubmitted} />
              <StatusItem label="Charges Enabled" enabled={chargesEnabled} />
              <StatusItem label="Payouts Enabled" enabled={payoutsEnabled} />
            </div>

            {requirements && requirements.pastDue.length > 0 && (
              <div className="bg-warning/10 border-warning/20 rounded-lg border p-4">
                <h4 className="text-warning mb-2 font-medium">Past due requirements:</h4>
                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                  {requirements.pastDue.map((req) => (
                    <li key={req}>{formatRequirement(req)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // PENDING status
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-5 w-5" />
              Setup In Progress
            </CardTitle>
            <CardDescription>
              Complete your Stripe account setup to start accepting payments.
            </CardDescription>
          </div>
          <Badge variant="secondary">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatusItem label="Details Submitted" enabled={detailsSubmitted} />
            <StatusItem label="Charges Enabled" enabled={chargesEnabled} />
            <StatusItem label="Payouts Enabled" enabled={payoutsEnabled} />
          </div>

          {requirements && requirements.currentlyDue.length > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="mb-2 font-medium">Required information:</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                {requirements.currentlyDue.slice(0, 5).map((req) => (
                  <li key={req}>{formatRequirement(req)}</li>
                ))}
                {requirements.currentlyDue.length > 5 && (
                  <li>And {requirements.currentlyDue.length - 5} more items...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <CheckCircle className="text-success h-4 w-4" />
      ) : (
        <Clock className="text-muted-foreground h-4 w-4" />
      )}
      <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function formatRequirement(requirement: string): string {
  // Convert Stripe requirement keys to readable format
  const formatted = requirement
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return formatted;
}

export function StripeConnectStatusSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}
