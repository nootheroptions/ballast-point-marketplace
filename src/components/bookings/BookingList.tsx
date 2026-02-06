'use client';

import { BookingItem } from './BookingItem';
import { BookingFilterType } from './BookingStatusMenu';
import type { BookingWithDetails } from '@/lib/types/booking';

interface BookingListProps {
  bookings: BookingWithDetails[];
  filter: BookingFilterType;
}

export function BookingList({ bookings, filter }: BookingListProps) {
  if (bookings.length === 0) {
    const emptyMessages: Record<BookingFilterType, { title: string; description: string }> = {
      upcoming: {
        title: 'No upcoming bookings',
        description: 'When clients book your services, upcoming appointments will appear here.',
      },
      past: {
        title: 'No past bookings',
        description: 'Your completed bookings will appear here.',
      },
      all: {
        title: 'No bookings yet',
        description: 'When clients book your services, they will appear here.',
      },
    };

    const { title, description } = emptyMessages[filter];

    return (
      <div className="border-muted-foreground/25 bg-muted/20 rounded-lg border border-dashed p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingItem key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
