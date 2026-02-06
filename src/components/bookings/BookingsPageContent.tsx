'use client';

import { useState, useMemo } from 'react';
import { BookingStatusMenu, BookingFilterType } from './BookingStatusMenu';
import { BookingList } from './BookingList';
import type { BookingWithDetails } from '@/lib/types/booking';

interface BookingsPageContentProps {
  bookings: BookingWithDetails[];
}

export function BookingsPageContent({ bookings }: BookingsPageContentProps) {
  const [selectedFilter, setSelectedFilter] = useState<BookingFilterType>('upcoming');

  // Capture current time once on mount - bookings list is a snapshot view
  const now = useMemo(() => new Date(), []);

  // Calculate counts for each filter
  const counts = useMemo(() => {
    const upcoming = bookings.filter(
      (b) => new Date(b.startTime) >= now && b.status !== 'CANCELLED'
    ).length;
    const past = bookings.filter(
      (b) => new Date(b.startTime) < now || b.status === 'CANCELLED'
    ).length;

    return {
      upcoming,
      past,
      all: bookings.length,
    };
  }, [bookings, now]);

  // Filter bookings based on selection
  const filteredBookings = useMemo(() => {
    switch (selectedFilter) {
      case 'upcoming':
        return bookings
          .filter((b) => new Date(b.startTime) >= now && b.status !== 'CANCELLED')
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      case 'past':
        return bookings
          .filter((b) => new Date(b.startTime) < now || b.status === 'CANCELLED')
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      case 'all':
      default:
        return [...bookings].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    }
  }, [bookings, selectedFilter, now]);

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-2">Manage your client appointments</p>
      </div>

      <div className="flex gap-8">
        {/* Left sidebar - Status menu */}
        <BookingStatusMenu
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={counts}
        />

        {/* Right side - Booking list */}
        <div className="min-w-0 flex-1">
          <BookingList bookings={filteredBookings} filter={selectedFilter} />
        </div>
      </div>
    </div>
  );
}
