'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DayToggle } from './DayToggle';
import { TimezoneSelector } from './TimezoneSelector';
import { updateWeeklyAvailability } from '@/actions/availabilities';
import type { Availability } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  enabled: boolean;
  timeRanges: TimeRange[];
}

interface WeeklyAvailabilityFormProps {
  initialAvailability?: Availability[];
  serviceId?: string | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Detect user's timezone
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export function WeeklyAvailabilityForm({
  initialAvailability = [],
  serviceId = null,
}: WeeklyAvailabilityFormProps) {
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Copy dialog state
  const [copyDialog, setCopyDialog] = useState<{
    isOpen: boolean;
    sourceDayIndex: number;
  } | null>(null);

  // Initialize weekly availability state
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayAvailability[]>(() => {
    const initial: DayAvailability[] = DAYS.map(() => ({
      enabled: false,
      timeRanges: [],
    }));

    // Populate from initial data
    initialAvailability.forEach((avail) => {
      if (!initial[avail.dayOfWeek]) return;

      if (!initial[avail.dayOfWeek]!.enabled) {
        initial[avail.dayOfWeek]!.enabled = true;
        initial[avail.dayOfWeek]!.timeRanges = [];
      }

      initial[avail.dayOfWeek]!.timeRanges.push({
        startTime: avail.startTime,
        endTime: avail.endTime,
      });
    });

    // Set timezone from first availability entry
    if (initialAvailability[0]?.timezone) {
      setTimezone(initialAvailability[0].timezone);
    }

    return initial;
  });

  // Auto-dismiss save message
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    const newAvailability = [...weeklyAvailability];
    newAvailability[dayIndex] = {
      enabled,
      timeRanges: enabled ? [{ startTime: '09:00', endTime: '17:00' }] : [],
    };
    setWeeklyAvailability(newAvailability);
  };

  const handleTimeRangeChange = (
    dayIndex: number,
    rangeIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newAvailability = [...weeklyAvailability];
    const day = newAvailability[dayIndex];
    if (day) {
      const newTimeRanges = [...day.timeRanges];
      const range = newTimeRanges[rangeIndex];
      if (range) {
        newTimeRanges[rangeIndex] = { ...range, [field]: value };
        newAvailability[dayIndex] = { ...day, timeRanges: newTimeRanges };
        setWeeklyAvailability(newAvailability);
      }
    }
  };

  const handleAddTimeRange = (dayIndex: number) => {
    const newAvailability = [...weeklyAvailability];
    const day = newAvailability[dayIndex];
    if (day) {
      // Calculate next time range based on the last one
      let startTime = '09:00';
      let endTime = '17:00';

      if (day.timeRanges.length > 0) {
        const lastRange = day.timeRanges[day.timeRanges.length - 1];
        if (lastRange) {
          // Parse the end time of the last range
          const [hours, minutes] = lastRange.endTime.split(':').map(Number);

          // Add 1 hour for start time
          const newStartHours = (hours ?? 0) + 1;
          const newEndHours = (hours ?? 0) + 2;

          // Format with leading zeros
          startTime = `${String(newStartHours).padStart(2, '0')}:${String(minutes ?? 0).padStart(2, '0')}`;
          endTime = `${String(newEndHours).padStart(2, '0')}:${String(minutes ?? 0).padStart(2, '0')}`;
        }
      }

      newAvailability[dayIndex] = {
        ...day,
        timeRanges: [...day.timeRanges, { startTime, endTime }],
      };
      setWeeklyAvailability(newAvailability);
    }
  };

  const handleDeleteTimeRange = (dayIndex: number, rangeIndex: number) => {
    const newAvailability = [...weeklyAvailability];
    const day = newAvailability[dayIndex];
    if (day) {
      const newTimeRanges = day.timeRanges.filter((_, i) => i !== rangeIndex);

      // If no time ranges left, disable the day
      if (newTimeRanges.length === 0) {
        newAvailability[dayIndex] = { enabled: false, timeRanges: [] };
      } else {
        newAvailability[dayIndex] = { ...day, timeRanges: newTimeRanges };
      }

      setWeeklyAvailability(newAvailability);
    }
  };

  const handleCopyTimeRange = (dayIndex: number) => {
    setCopyDialog({
      isOpen: true,
      sourceDayIndex: dayIndex,
    });
  };

  const handleCopyToDay = (targetDayIndex: number) => {
    if (!copyDialog) return;

    const sourceDayAvailability = weeklyAvailability[copyDialog.sourceDayIndex];
    const timeRanges = sourceDayAvailability?.timeRanges;

    if (!timeRanges || timeRanges.length === 0) return;

    const newAvailability = [...weeklyAvailability];
    const targetDay = newAvailability[targetDayIndex];

    if (targetDay) {
      // Enable the day and copy all time ranges
      newAvailability[targetDayIndex] = {
        enabled: true,
        timeRanges: timeRanges.map((range) => ({ ...range })),
      };
    }

    setWeeklyAvailability(newAvailability);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Transform data for API
      const availability = weeklyAvailability.flatMap((day, dayOfWeek) =>
        day.enabled
          ? day.timeRanges.map((range) => ({
              dayOfWeek,
              timeRanges: [range],
              timezone,
            }))
          : []
      );

      const result = await updateWeeklyAvailability({
        availability,
        timezone,
        serviceId,
      });

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Availability saved successfully' });
      } else {
        setSaveMessage({
          type: 'error',
          text: result.error || 'Failed to save availability',
        });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timezone Selector */}
      <TimezoneSelector value={timezone} onChange={setTimezone} />

      {/* Days Grid */}
      <div className="space-y-4">
        {DAYS.map((dayName, index) => (
          <DayToggle
            key={dayName}
            dayName={dayName}
            dayOfWeek={index}
            enabled={weeklyAvailability[index]?.enabled ?? false}
            timeRanges={weeklyAvailability[index]?.timeRanges ?? []}
            onToggle={(enabled) => handleDayToggle(index, enabled)}
            onTimeRangeChange={(rangeIndex, field, value) =>
              handleTimeRangeChange(index, rangeIndex, field, value)
            }
            onAddTimeRange={() => handleAddTimeRange(index)}
            onDeleteTimeRange={(rangeIndex) => handleDeleteTimeRange(index, rangeIndex)}
            onCopyTimeRange={() => handleCopyTimeRange(index)}
          />
        ))}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`rounded-lg border p-4 ${
            saveMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <p className="text-sm">{saveMessage.text}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Availability
        </Button>
      </div>

      {/* Copy Dialog */}
      <AlertDialog
        open={copyDialog?.isOpen ?? false}
        onOpenChange={(open) => !open && setCopyDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy to other days</AlertDialogTitle>
            <AlertDialogDescription>
              Select which days you want to copy all time ranges to.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid grid-cols-2 gap-2 py-4">
            {DAYS.map((dayName, index) => {
              const isSourceDay = index === copyDialog?.sourceDayIndex;
              return (
                <Button
                  key={dayName}
                  variant={isSourceDay ? 'secondary' : 'outline'}
                  disabled={isSourceDay}
                  onClick={() => {
                    handleCopyToDay(index);
                  }}
                  className="justify-start"
                >
                  {dayName} {isSourceDay && '(current)'}
                </Button>
              );
            })}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Done</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
