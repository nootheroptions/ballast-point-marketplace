import { Suspense } from 'react';
import { getMyCalendarIntegration } from '@/actions/calendar-integrations';
import {
  IntegrationsPageContent,
  IntegrationsPageSkeleton,
} from '@/components/integrations/IntegrationsPageContent';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';

export default function IntegrationsPage() {
  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="Integrations"
          subtitle="Connect your external calendars to automatically sync your availability. Events from connected calendars will block booking slots."
        />

        <Suspense fallback={<IntegrationsPageSkeleton />}>
          <IntegrationsContent />
        </Suspense>
      </div>
    </PageHeaderProvider>
  );
}

async function IntegrationsContent() {
  const result = await getMyCalendarIntegration();

  if (!result.success) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
        <p className="text-destructive text-sm">{result.error}</p>
      </div>
    );
  }

  const integration = result.data ?? null;
  return <IntegrationsPageContent integration={integration} />;
}
