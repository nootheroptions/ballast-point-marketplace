'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceInfo } from '@/components/booking/ServiceInfo';
import { BookingForm } from '@/components/booking/BookingForm';
import { createBooking } from '@/actions/bookings';

interface BookingData {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  slotDuration: number;
  providerName: string;
  providerSlug: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export default function ConfirmBookingPage() {
  const params = useParams();
  const router = useRouter();
  const providerSlug = params.providerSlug as string;
  const serviceSlug = params.serviceSlug as string;

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load booking data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      // No booking data, redirect back to booking page
      router.push(`/${providerSlug}/${serviceSlug}`);
      return;
    }

    try {
      const data = JSON.parse(storedData) as BookingData;
      setBookingData(data);
    } catch (err) {
      console.error('Error parsing booking data:', err);
      router.push(`/${providerSlug}/${serviceSlug}`);
    }
  }, [providerSlug, serviceSlug, router]);

  const handleSubmit = async (formData: { name: string; email: string; notes?: string }) => {
    if (!bookingData) return;

    try {
      setLoading(true);
      setError(null);

      const result = await createBooking({
        serviceId: bookingData.serviceId,
        startTime: new Date(bookingData.startTime),
        endTime: new Date(bookingData.endTime),
        timezone: bookingData.timezone,
        name: formData.name,
        email: formData.email,
        notes: formData.notes,
      });

      if (!result.success) {
        // Check if it's a slot availability error
        if (result.error?.includes('no longer available')) {
          setError(result.error);
          // Wait a moment to show error, then redirect
          setTimeout(() => {
            router.push(`/${providerSlug}/${serviceSlug}`);
          }, 3000);
          return;
        }

        setError(result.error || 'Failed to create booking');
        return;
      }

      // Success! Store booking ID and redirect to success page
      sessionStorage.setItem(
        'bookingSuccess',
        JSON.stringify({
          bookingId: result.data!.id,
          serviceName: bookingData.serviceName,
          providerName: bookingData.providerName,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          timezone: bookingData.timezone,
          slotDuration: bookingData.slotDuration,
          name: formData.name,
          email: formData.email,
        })
      );

      // Clear booking data from session
      sessionStorage.removeItem('bookingData');

      router.push(`/${providerSlug}/${serviceSlug}/success`);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/${providerSlug}/${serviceSlug}`);
  };

  if (!bookingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="px-8 text-center">
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Left Column - Booking Details */}
      <div className="border-border/30 border-b p-6 lg:border-r lg:border-b-0 lg:p-8">
        <ServiceInfo
          serviceName={bookingData.serviceName}
          serviceDescription={bookingData.serviceDescription}
          providerName={bookingData.providerName}
          slotDuration={bookingData.slotDuration}
          startTime={new Date(bookingData.startTime)}
          endTime={new Date(bookingData.endTime)}
          timezone={bookingData.timezone}
        />
      </div>

      {/* Right Column - Booking Form */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <BookingForm
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
