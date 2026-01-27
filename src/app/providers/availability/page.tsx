import { getMyAvailability } from '@/actions/availabilities';
import { WeeklyAvailabilityForm } from '@/components/availability/WeeklyAvailabilityForm';
import type { Availability } from '@prisma/client';

export default async function AvailabilityPage() {
  const result = await getMyAvailability({ serviceId: null });

  // Handle error state
  if (!result.success) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Availability</h1>
          <p className="text-muted-foreground mt-2">Set your weekly availability schedule</p>
        </div>

        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
          <p className="text-destructive text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const availability = (result.data ?? []) as Availability[];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground mt-2">
          Set your weekly availability schedule. This determines when clients can book appointments
          with you.
        </p>
      </div>

      {/* Form */}
      <WeeklyAvailabilityForm initialAvailability={availability} />
    </div>
  );
}
