'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { TimeSlotList } from '@/components/booking/TimeSlotList';
import { ServiceInfo } from '@/components/booking/ServiceInfo';
import { TimezoneSelector } from '@/components/shared/TimezoneSelector';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceBySlug } from '@/actions/services';
import { getAvailableSlots } from '@/actions/bookings';

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface ServiceInfoData {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  slotDuration: number;
  providerName: string;
  providerSlug: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const providerSlug = params.providerSlug as string;
  const serviceSlug = params.serviceSlug as string;

  // State
  const [serviceInfo, setServiceInfo] = useState<ServiceInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect user's timezone
  const [timezone, setTimezone] = useState<string>('');
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
  }, []);

  // Booking flow state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const timezoneDisplayLabel = useMemo(() => {
    if (!timezone) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date());

    const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
    const offset = offsetPart === 'GMT' ? 'UTC+00:00' : offsetPart.replace('GMT', 'UTC');
    return `${timezone.replace(/_/g, ' ')} (${offset})`;
  }, [timezone]);

  // Load service info
  useEffect(() => {
    async function loadServiceInfo() {
      try {
        setLoading(true);
        const result = await getServiceBySlug(providerSlug, serviceSlug);

        if (!result) {
          setError('Service not found');
          return;
        }

        // Map the ServiceWithDetails to ServiceInfoData
        setServiceInfo({
          serviceId: result.id,
          serviceName: result.name,
          serviceDescription: result.description,
          slotDuration: result.slotDuration,
          providerName: result.providerProfile.name,
          providerSlug: result.providerProfile.slug,
        });
      } catch (err) {
        console.error('Error loading service info:', err);
        setError('Failed to load service information');
      } finally {
        setLoading(false);
      }
    }

    loadServiceInfo();
  }, [providerSlug, serviceSlug]);

  // Load all available slots for the next 3 months
  useEffect(() => {
    const serviceId = serviceInfo?.serviceId;
    if (!serviceId || !timezone) {
      setAllSlots([]);
      return;
    }

    async function loadAllSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);

        const startDate = startOfDay(new Date());
        const endDate = endOfDay(addDays(startDate, 90)); // 3 months

        const result = await getAvailableSlots({
          serviceId,
          startDate,
          endDate,
          timezone,
        });

        if (!result.success) {
          console.error('Error loading slots:', result.error);
          setAllSlots([]);
          return;
        }

        // Convert string dates back to Date objects
        const slots = (result.data || []).map(
          (slot: { startTime: string | Date; endTime: string | Date }) => ({
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
          })
        );

        setAllSlots(slots);
      } catch (err) {
        console.error('Error loading slots:', err);
        setAllSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAllSlots();
  }, [serviceInfo, timezone]);

  // Compute available dates from all slots
  const availableDates = useMemo(() => {
    if (!timezone) return [];

    const datesByKey = new Map<string, Date>();
    allSlots.forEach((slot) => {
      const day = startOfDay(toZonedTime(slot.startTime, timezone));
      const key = day.toDateString();
      if (!datesByKey.has(key)) {
        datesByKey.set(key, day);
      }
    });

    return Array.from(datesByKey.values()).sort((a, b) => a.getTime() - b.getTime());
  }, [allSlots, timezone]);

  // Default select the first available day (avoids selecting a disabled "today")
  useEffect(() => {
    if (availableDates.length === 0) return;

    const availableSet = new Set(availableDates.map((d) => d.toDateString()));
    const today = startOfDay(toZonedTime(new Date(), timezone));
    const firstAvailable = availableDates.find((d) => d >= today);
    if (!firstAvailable) return;

    setSelectedDate((current) => {
      if (current && current >= today && availableSet.has(startOfDay(current).toDateString())) {
        return current;
      }
      return firstAvailable;
    });
  }, [availableDates, timezone]);

  // Filter slots for the selected date
  const availableSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const selectedDayKey = startOfDay(selectedDate).toDateString();
    return allSlots.filter((slot) => {
      const slotDayKey = startOfDay(toZonedTime(slot.startTime, timezone || 'UTC')).toDateString();
      return slotDayKey === selectedDayKey;
    });
  }, [allSlots, selectedDate, timezone]);

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date ? startOfDay(date) : undefined);
    setSelectedSlot(null);
  };

  const handleNextClick = () => {
    if (!selectedSlot || !serviceInfo) return;

    // Store selected slot and service info in session storage for the next page
    sessionStorage.setItem(
      'bookingData',
      JSON.stringify({
        serviceId: serviceInfo.serviceId,
        serviceName: serviceInfo.serviceName,
        serviceDescription: serviceInfo.serviceDescription,
        slotDuration: serviceInfo.slotDuration,
        providerName: serviceInfo.providerName,
        providerSlug: serviceInfo.providerSlug,
        startTime: selectedSlot.startTime.toISOString(),
        endTime: selectedSlot.endTime.toISOString(),
        timezone,
      })
    );

    router.push(`/${providerSlug}/${serviceSlug}/confirm`);
  };

  if (loading) {
    return (
      <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <div className="border-border/30 border-b p-6 lg:border-r lg:border-b-0 lg:p-8">
          <Skeleton className="mb-3 h-4 w-1/3" />
          <Skeleton className="mb-4 h-7 w-2/3" />
          <Skeleton className="mb-6 h-16 w-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="border-border/30 border-b p-6 lg:border-r lg:border-b-0 lg:p-8">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="p-6 lg:p-8">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !serviceInfo) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="px-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Service Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The service you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
      {/* Service info */}
      <div className="border-border/30 border-b p-6 lg:border-r lg:border-b-0 lg:p-8">
        <ServiceInfo
          serviceName={serviceInfo.serviceName}
          serviceDescription={serviceInfo.serviceDescription}
          providerName={serviceInfo.providerName}
          slotDuration={serviceInfo.slotDuration}
        />
      </div>

      {/* Calendar */}
      <div className="border-border/30 flex h-full min-h-0 flex-col border-b p-6 lg:border-r lg:border-b-0 lg:p-8">
        <div className="shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Select a date</h2>
            </div>
          </div>
        </div>

        <div className="mt-2 flex min-h-0 flex-1 items-start justify-center p-4">
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            availableDates={availableDates}
            minDate={startOfDay(toZonedTime(new Date(), timezone || 'UTC'))}
            maxDate={addDays(startOfDay(toZonedTime(new Date(), timezone || 'UTC')), 90)}
            className="w-full"
          />
        </div>
      </div>

      {/* Times */}
      <div className="flex h-full min-h-0 flex-col gap-4 p-6 lg:p-8">
        {timezone && (
          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Choose a time</h2>
            </div>
            <p className="text-muted-foreground text-xs">Times shown in {timezoneDisplayLabel}</p>
            <div className="space-y-2">
              <TimezoneSelector value={timezone} onChange={setTimezone} showLabel={false} />
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1">
          <TimeSlotList
            slots={availableSlotsForSelectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            timezone={timezone}
            loading={loadingSlots}
            onNext={handleNextClick}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
