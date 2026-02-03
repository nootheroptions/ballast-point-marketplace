'use client';

import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { CreateServiceData } from '@/lib/validations/service';

interface BookingFieldsProps {
  form: UseFormReturn<CreateServiceData>;
}

export function BookingFields({ form }: BookingFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Booking Configuration</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Configure how clients can book appointments for this service
        </p>
      </div>

      {/* Slot Duration */}
      <div className="space-y-2">
        <Label htmlFor="slotDuration">
          Appointment Duration (minutes) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slotDuration"
          type="number"
          min="1"
          {...form.register('slotDuration', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">How long each appointment slot should be</p>
      </div>

      {/* Slot Buffer */}
      <div className="space-y-2">
        <Label htmlFor="slotBuffer">
          Buffer Time (minutes) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slotBuffer"
          type="number"
          min="0"
          {...form.register('slotBuffer', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">
          Buffer time between appointments (0 for no buffer)
        </p>
      </div>

      {/* Advance Booking Min */}
      <div className="space-y-2">
        <Label htmlFor="advanceBookingMin">
          Minimum Advance Notice (minutes) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="advanceBookingMin"
          type="number"
          min="0"
          {...form.register('advanceBookingMin', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">
          How far in advance clients must book (e.g., 1440 = 24 hours)
        </p>
      </div>

      {/* Advance Booking Max */}
      <div className="space-y-2">
        <Label htmlFor="advanceBookingMax">
          Maximum Advance Booking (minutes) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="advanceBookingMax"
          type="number"
          min="0"
          {...form.register('advanceBookingMax', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">
          How far in advance clients can book (e.g., 43200 = 30 days)
        </p>
      </div>
    </div>
  );
}
