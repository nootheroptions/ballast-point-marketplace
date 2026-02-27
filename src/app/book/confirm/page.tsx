import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Skeleton } from '@/components/ui/skeleton';
import { addMinutes } from 'date-fns';

interface BookingConfirmPageProps {
  searchParams: Promise<{
    serviceId?: string;
    startTime?: string;
    timezone?: string;
  }>;
}

export default async function BookingConfirmPage({ searchParams }: BookingConfirmPageProps) {
  const params = await searchParams;

  // Validate required params
  if (!params.serviceId || !params.startTime || !params.timezone) {
    redirect('/');
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<BookingConfirmSkeleton />}>
          <BookingConfirmContent
            serviceId={params.serviceId}
            startTimeStr={params.startTime}
            timezone={params.timezone}
          />
        </Suspense>
      </div>
    </div>
  );
}

interface BookingConfirmContentProps {
  serviceId: string;
  startTimeStr: string;
  timezone: string;
}

async function BookingConfirmContent({
  serviceId,
  startTimeStr,
  timezone,
}: BookingConfirmContentProps) {
  // Parse and validate start time
  const startTime = new Date(startTimeStr);
  if (isNaN(startTime.getTime())) {
    notFound();
  }

  // Fetch service with provider profile
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      providerProfile: {
        select: {
          id: true,
          name: true,
          slug: true,
          stripeAccountId: true,
          stripeAccountStatus: true,
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  // Check service is published
  if (!service.isPublished) {
    notFound();
  }

  // Calculate end time from service configuration
  const endTime = addMinutes(startTime, service.slotDuration);

  // Prepare service data for client component
  const serviceData = {
    id: service.id,
    name: service.name,
    priceCents: service.priceCents,
    slotDuration: service.slotDuration,
    deliveryMode: service.deliveryMode,
    providerProfile: {
      id: service.providerProfile.id,
      name: service.providerProfile.name,
      slug: service.providerProfile.slug,
      stripeAccountId: service.providerProfile.stripeAccountId,
      stripeAccountStatus: service.providerProfile.stripeAccountStatus,
    },
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Complete Your Booking</h1>
        <p className="text-muted-foreground mt-2">
          Review your booking details and complete payment
        </p>
      </div>

      <BookingConfirmation
        service={serviceData}
        startTime={startTime}
        endTime={endTime}
        timezone={timezone}
      />
    </div>
  );
}

function BookingConfirmSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto h-9 w-64" />
        <Skeleton className="mx-auto mt-2 h-5 w-80" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="order-2 space-y-6 lg:order-1">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="order-1 lg:order-2">
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
