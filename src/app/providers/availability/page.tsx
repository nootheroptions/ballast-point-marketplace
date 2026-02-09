import { Suspense } from 'react';
import { getMyAvailability } from '@/actions/availabilities';
import {
  WeeklyAvailabilityForm,
  WeeklyAvailabilityFormSkeleton,
} from '@/components/availability/WeeklyAvailabilityForm';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import type { Availability } from '@prisma/client';

export default function AvailabilityPage() {
  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="Availability"
          subtitle="Set your weekly availability schedule. This determines when clients can book appointments with you."
        />

        <Suspense fallback={<WeeklyAvailabilityFormSkeleton />}>
          <AvailabilityContent />
        </Suspense>
      </div>
    </PageHeaderProvider>
  );
}

async function AvailabilityContent() {
  const result = await getMyAvailability({ serviceId: null });

  // Handle error state
  if (!result.success) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
        <p className="text-destructive text-sm">{result.error}</p>
      </div>
    );
  }

  const availability = (result.data ?? []) as Availability[];

  return <WeeklyAvailabilityForm initialAvailability={availability} />;
}
