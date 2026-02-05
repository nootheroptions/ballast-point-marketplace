'use client';

import * as React from 'react';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { addDays, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DayButton } from 'react-day-picker';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = new Date(),
  maxDate = addDays(new Date(), 90),
  className,
}: BookingCalendarProps) {
  // Create a set of available date strings for quick lookup
  const availableDateStrings = React.useMemo(
    () => new Set(availableDates.map((date) => date.toDateString())),
    [availableDates]
  );

  const [month, setMonth] = React.useState(() => startOfMonth(selectedDate ?? minDate));

  React.useEffect(() => {
    setMonth(startOfMonth(selectedDate ?? minDate));
  }, [minDate, selectedDate]);

  const isOutOfBookingWindow = React.useCallback(
    (date: Date) => date < minDate || date > maxDate,
    [maxDate, minDate]
  );

  const isUnavailableInWindow = React.useCallback(
    (date: Date) =>
      !isOutOfBookingWindow(date) &&
      availableDates.length > 0 &&
      !availableDateStrings.has(date.toDateString()),
    [availableDateStrings, availableDates.length, isOutOfBookingWindow]
  );

  function handleSelect(date: Date | undefined) {
    if (date) {
      setMonth(startOfMonth(date));
    }
    onSelectDate(date);
  }

  // Custom DayButton to make selected dates circular
  const CustomDayButton = React.useCallback(
    (props: React.ComponentProps<typeof DayButton>) => {
      const date = props.day.date;
      const isUnavailable = isUnavailableInWindow(date);

      return (
        <CalendarDayButton
          {...props}
          className={cn(
            props.className,
            'rounded-full hover:bg-transparent',
            'data-[selected-single=true]:rounded-full',
            isUnavailable && 'disabled:opacity-100'
          )}
        />
      );
    },
    [isUnavailableInWindow]
  );

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        defaultMonth={selectedDate ?? minDate}
        fromDate={minDate}
        toDate={maxDate}
        month={month}
        onMonthChange={setMonth}
        fixedWeeks
        disabled={(date) => {
          // Disable dates outside the booking window
          if (isOutOfBookingWindow(date)) {
            return true;
          }

          // If we have available dates, only enable those
          if (availableDates.length > 0) {
            return !availableDateStrings.has(date.toDateString());
          }

          // Otherwise, all dates in range are enabled
          return false;
        }}
        modifiers={{
          available: availableDates,
          unavailable: isUnavailableInWindow,
        }}
        modifiersClassNames={{
          available:
            'bg-accent text-accent-foreground font-medium rounded-full hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer',
          unavailable:
            '!text-foreground !opacity-100 data-[outside=true]:!text-muted-foreground/70',
        }}
        className={cn('w-full bg-transparent p-0 shadow-none', className)}
        classNames={{
          root: 'w-full',
          months: 'w-full',
          month: 'w-full',
          day: 'relative w-full h-full p-0 text-center group/day aspect-square select-none',
          today: 'font-semibold',
          outside: 'text-muted-foreground/70',
          disabled: 'cursor-not-allowed',
        }}
        components={{
          DayButton: CustomDayButton,
        }}
      />
    </div>
  );
}
