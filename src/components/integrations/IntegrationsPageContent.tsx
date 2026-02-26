'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarIcon, Check, Link2Off, Loader2, AlertCircle } from 'lucide-react';
import { disconnectCalendar } from '@/actions/calendar-integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/shadcn';
import type { CalendarProvider } from '@prisma/client';

type CalendarIntegrationInfo = {
  id: string;
  provider: CalendarProvider;
  calendarEmail: string | null;
  lastSyncAt: Date | null;
  syncError: string | null;
};

interface IntegrationsPageContentProps {
  integration: CalendarIntegrationInfo | null;
}

const CALENDAR_PROVIDERS = [
  {
    id: 'GOOGLE' as const,
    name: 'Google Calendar',
    description: 'Connect your Google Calendar to sync events',
    icon: GoogleCalendarIcon,
    connectUrl: '/api/auth/calendar/google',
  },
  {
    id: 'OUTLOOK' as const,
    name: 'Microsoft Outlook',
    description: 'Connect your Outlook calendar to sync events',
    icon: OutlookIcon,
    connectUrl: '/api/auth/calendar/outlook',
  },
];

export function IntegrationsPageContent({ integration }: IntegrationsPageContentProps) {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="border-success/50 bg-success/10 text-success flex items-center gap-2 rounded-lg border p-4">
          <Check className="h-5 w-5" />
          <span className="text-sm">
            {success === 'google_connected'
              ? 'Google Calendar connected successfully!'
              : success === 'outlook_connected'
                ? 'Outlook Calendar connected successfully!'
                : 'Calendar connected successfully!'}
          </span>
        </div>
      )}

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{getErrorMessage(error)}</span>
        </div>
      )}

      {/* Calendar Integration Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Calendar Sync</h3>
        <p className="text-muted-foreground text-sm">
          Connect your calendar to automatically block out busy times. Only one calendar can be
          connected at a time.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {CALENDAR_PROVIDERS.map((provider) => (
            <CalendarProviderCard
              key={provider.id}
              provider={provider}
              isConnected={integration?.provider === provider.id}
              connectedEmail={
                integration?.provider === provider.id ? integration.calendarEmail : null
              }
              lastSyncAt={integration?.provider === provider.id ? integration.lastSyncAt : null}
              syncError={integration?.provider === provider.id ? integration.syncError : null}
              hasOtherConnection={integration !== null && integration.provider !== provider.id}
            />
          ))}
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <h4 className="mb-2 text-sm font-medium">How calendar sync works</h4>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>Confirmed events in your external calendar will block booking slots</li>
          <li>Bookings made through the marketplace will appear in your external calendar</li>
          <li>Tentative or free time blocks will not affect your availability</li>
          <li>Your calendar data is synced securely and only used to manage availability</li>
        </ul>
      </div>
    </div>
  );
}

interface CalendarProviderCardProps {
  provider: (typeof CALENDAR_PROVIDERS)[number];
  isConnected: boolean;
  connectedEmail: string | null;
  lastSyncAt: Date | null;
  syncError: string | null;
  hasOtherConnection: boolean;
}

function CalendarProviderCard({
  provider,
  isConnected,
  connectedEmail,
  lastSyncAt,
  syncError,
  hasOtherConnection,
}: CalendarProviderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const Icon = provider.icon;

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await disconnectCalendar();
      if (result.success) {
        setShowDisconnectDialog(false);
        // Refresh the page to update the UI
        window.location.reload();
      }
    });
  };

  return (
    <Card
      className={cn('relative overflow-hidden', isConnected && 'border-success/50 bg-success/5')}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base">{provider.name}</CardTitle>
              <CardDescription className="text-xs">{provider.description}</CardDescription>
            </div>
          </div>
          {isConnected && (
            <div className="bg-success text-success-foreground flex h-6 w-6 items-center justify-center rounded-full">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            {connectedEmail && (
              <p className="text-sm">
                <span className="text-muted-foreground">Connected as:</span>{' '}
                <span className="font-medium">{connectedEmail}</span>
              </p>
            )}

            {syncError && (
              <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-2 text-xs">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {lastSyncAt && !syncError && (
              <p className="text-muted-foreground text-xs">
                Last synced: {formatLastSync(lastSyncAt)}
              </p>
            )}

            <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full" disabled={isPending}>
                  <Link2Off className="h-4 w-4" />
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect {provider.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the calendar sync. Your existing bookings will not be affected,
                    but new bookings will no longer sync to your calendar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnect}
                    disabled={isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button
            variant={hasOtherConnection ? 'outline' : 'default'}
            size="sm"
            className="w-full"
            asChild
            disabled={hasOtherConnection}
          >
            <a href={provider.connectUrl}>
              <CalendarIcon className="h-4 w-4" />
              {hasOtherConnection ? 'Disconnect other first' : 'Connect'}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegrationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// SVG Icons for calendar providers
function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 4H17V2H15V4H9V2H7V4H6C4.9 4 4 4.9 4 6V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V6C20 4.9 19.1 4 18 4ZM18 20H6V9H18V20Z"
        fill="currentColor"
      />
      <path d="M8 11H10V13H8V11Z" fill="#4285F4" />
      <path d="M11 11H13V13H11V11Z" fill="#34A853" />
      <path d="M14 11H16V13H14V11Z" fill="#FBBC05" />
      <path d="M8 14H10V16H8V14Z" fill="#EA4335" />
      <path d="M11 14H13V16H11V14Z" fill="#4285F4" />
      <path d="M14 14H16V16H14V14Z" fill="#34A853" />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M21.5 5H14V3.5C14 2.67 13.33 2 12.5 2H2.5C1.67 2 1 2.67 1 3.5V20.5C1 21.33 1.67 22 2.5 22H12.5C13.33 22 14 21.33 14 20.5V19H21.5C22.33 19 23 18.33 23 17.5V6.5C23 5.67 22.33 5 21.5 5Z"
        fill="#0078D4"
      />
      <ellipse cx="7.5" cy="12" rx="3.5" ry="4" fill="white" />
      <path
        d="M16 8H21V10H16V8ZM16 11H21V13H16V11ZM16 14H21V16H16V14Z"
        fill="white"
        opacity="0.8"
      />
    </svg>
  );
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'oauth_cancelled':
      return 'Calendar authorization was cancelled.';
    case 'no_code':
      return 'No authorization code received. Please try again.';
    case 'not_authenticated':
      return 'You must be logged in to connect a calendar.';
    case 'invalid_state':
      return 'Invalid authorization state. Please try again.';
    case 'state_expired':
      return 'Authorization timed out. Please try again.';
    case 'no_team':
      return 'No team selected. Please complete provider onboarding first.';
    case 'not_team_member':
      return 'You are not a member of this team.';
    case 'token_exchange_failed':
      return 'Failed to complete calendar authorization. Please try again.';
    case 'unexpected_error':
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

function formatLastSync(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}
