'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface TimeSlotListProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  timezone: string;
  loading?: boolean;
  onNext?: () => void;
  selectedDate?: Date;
}

export function TimeSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  timezone,
  loading = false,
  onNext,
  selectedDate,
}: TimeSlotListProps) {
  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [slots]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground text-center">
          <Clock className="mx-auto mb-3 h-6 w-6 animate-spin opacity-50" />
          <p className="text-sm">Loading available times...</p>
        </div>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground text-center">
          <Clock className="mx-auto mb-3 h-6 w-6 opacity-30" />
          <p className="mb-1 text-sm font-medium">Select a date to see times</p>
          <p className="text-sm">Choose a day from the calendar.</p>
        </div>
      </div>
    );
  }

  const formattedDateShort = format(selectedDate, 'EEE, MMM d');
  const formattedDateLong = format(selectedDate, 'MMMM d, yyyy');
  const slotCountLabel = slots.length === 1 ? '1 time' : `${slots.length} times`;

  if (slots.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground text-center">
          <Clock className="mx-auto mb-3 h-6 w-6 opacity-30" />
          <p className="mb-1 text-sm font-medium">No times on {formattedDateLong}</p>
          <p className="text-sm">Try selecting another day.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          {formattedDateShort} • {slotCountLabel} available
        </p>
      </div>

      {/* Time slots list */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {sortedSlots.map((slot) => {
          const isSelected = selectedSlot?.startTime.getTime() === slot.startTime.getTime();
          const timeStr = formatInTimeZone(slot.startTime, timezone, 'h:mm a');

          return (
            <div key={slot.startTime.toISOString()} className="flex gap-2">
              <Button
                variant={isSelected ? 'secondary' : 'outline'}
                onClick={() => onSelectSlot(slot)}
                className={cn('h-auto flex-1 justify-between rounded-lg py-2 transition-colors')}
                aria-pressed={isSelected}
              >
                <span>{timeStr}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </Button>

              {isSelected && onNext && (
                <Button onClick={onNext} className="shrink-0 gap-2 px-5">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
