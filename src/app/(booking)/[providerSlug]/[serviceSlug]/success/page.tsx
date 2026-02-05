'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, ChevronDown, Clock, Mail, User } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface BookingSuccessData {
  bookingId: string;
  serviceName: string;
  providerName: string;
  startTime: string;
  endTime: string;
  timezone: string;
  slotDuration: number;
  name: string;
  email: string;
}

function isScrolledToBottom(element: HTMLElement) {
  const threshold = 8;
  return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
}

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const providerSlug = params.providerSlug as string;
  const serviceSlug = params.serviceSlug as string;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const [bookingData] = useState<BookingSuccessData | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedData = sessionStorage.getItem('bookingSuccess');
    if (!storedData) return null;

    try {
      return JSON.parse(storedData) as BookingSuccessData;
    } catch (err) {
      console.error('Error parsing success data:', err);
      return null;
    }
  });

  useEffect(() => {
    if (!bookingData) {
      router.push(`/${providerSlug}/${serviceSlug}`);
    }
  }, [bookingData, providerSlug, serviceSlug, router]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const update = () => {
      const currentlyOverflows = scrollEl.scrollHeight > scrollEl.clientHeight + 1;
      setHasOverflow(currentlyOverflows);
      setAtBottom(isScrolledToBottom(scrollEl));
    };

    const rafUpdate = () => requestAnimationFrame(update);
    rafUpdate();

    const resizeObserver = new ResizeObserver(rafUpdate);
    resizeObserver.observe(scrollEl);

    window.addEventListener('resize', rafUpdate);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', rafUpdate);
    };
  }, [bookingData]);

  const handleBookAnother = () => {
    sessionStorage.removeItem('bookingSuccess');
    router.push(`/${providerSlug}/${serviceSlug}`);
  };

  const startTime = useMemo(() => {
    if (!bookingData) return null;
    return new Date(bookingData.startTime);
  }, [bookingData]);

  const dateStr = useMemo(() => {
    if (!startTime) return '';
    return format(startTime, 'EEEE, MMMM d, yyyy');
  }, [startTime]);

  const timeStr = useMemo(() => {
    if (!startTime || !bookingData) return '';
    return formatInTimeZone(startTime, bookingData.timezone, 'h:mm a zzz');
  }, [startTime, bookingData]);

  if (!bookingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="px-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={() => {
          const scrollEl = scrollRef.current;
          if (!scrollEl) return;
          setAtBottom(isScrolledToBottom(scrollEl));
        }}
        className="h-full overflow-y-auto"
      >
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your appointment has been scheduled. A confirmation email has been sent to{' '}
              <span className="text-foreground font-medium">{bookingData.email}</span>.
            </p>
          </div>

          <div className="mb-8 w-full space-y-4 text-left">
            <div className="border-t pt-6">
              <h2 className="mb-4 text-center text-lg font-semibold">Appointment Details</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Service</p>
                    <p className="text-muted-foreground text-sm">{bookingData.serviceName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Provider</p>
                    <p className="text-muted-foreground text-sm">{bookingData.providerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Date &amp; Time</p>
                    <p className="text-muted-foreground text-sm">{dateStr}</p>
                    <p className="text-muted-foreground text-sm">{timeStr}</p>
                    <p className="text-muted-foreground text-sm">
                      Duration: {bookingData.slotDuration} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Attendee</p>
                    <p className="text-muted-foreground text-sm">{bookingData.name}</p>
                    <p className="text-muted-foreground text-sm">{bookingData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted mb-6 w-full rounded-md p-4 text-left">
            <p className="text-muted-foreground mb-1 text-xs">Booking Reference</p>
            <p className="font-mono text-sm break-all">{bookingData.bookingId}</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Print Details
            </Button>
            <Button onClick={handleBookAnother} className="flex-1">
              Book Another Appointment
            </Button>
          </div>

          <div className="mt-6 w-full rounded-md bg-blue-50 p-4 text-left dark:bg-blue-950/20">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>What’s next?</strong> You’ll receive a confirmation email with all the details
              and any instructions from {bookingData.providerName}.
            </p>
          </div>
        </div>
      </div>

      {hasOverflow && !atBottom ? (
        <>
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div className="bg-background/85 text-muted-foreground flex items-center gap-1 rounded-full border px-3 py-1 text-xs backdrop-blur">
              <ChevronDown className="h-3.5 w-3.5" />
              Scroll for more
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
