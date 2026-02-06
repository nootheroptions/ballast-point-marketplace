'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateServiceData } from '@/lib/validations/service';

interface PricingAndTimingFieldsProps {
  form: UseFormReturn<CreateServiceData>;
}

export function PricingAndTimingFields({ form }: PricingAndTimingFieldsProps) {
  const priceCents = form.watch('priceCents');
  const priceDisplay = priceCents ? `$${(priceCents / 100).toFixed(2)}` : '$0.00';
  const [priceInput, setPriceInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Pricing & Timing</h3>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price (AUD) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center">
            $
          </span>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className="pl-7"
            value={isFocused ? priceInput : priceCents ? priceCents / 100 : ''}
            onFocus={(e) => {
              setIsFocused(true);
              // Show the current cents value as dollars for editing
              const currentValue = priceCents ? (priceCents / 100).toString() : '';
              setPriceInput(currentValue);
              // Select all text so user can easily replace it or backspace
              setTimeout(() => e.target.select(), 0);
            }}
            onChange={(e) => {
              const value = e.target.value;
              // Track the input for display
              setPriceInput(value);

              // Update the form so it knows it's dirty
              if (!value || value === '') {
                form.setValue('priceCents', 0, {
                  shouldValidate: false,
                  shouldDirty: true,
                });
              } else {
                const cents = Math.round(parseFloat(value) * 100);
                form.setValue('priceCents', cents, {
                  shouldValidate: false,
                  shouldDirty: true,
                });
              }
            }}
            onBlur={() => {
              setIsFocused(false);
              setPriceInput('');
            }}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Fixed price for this service ({priceDisplay} AUD)
        </p>
      </div>

      {/* Lead Time */}
      <div className="space-y-2">
        <Label htmlFor="leadTime">
          Lead Time (days) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="leadTime"
          type="number"
          min="0"
          {...form.register('leadTimeDays', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">How many days in advance clients must book</p>
      </div>

      {/* Turnaround */}
      <div className="space-y-2">
        <Label htmlFor="turnaround">
          Turnaround Time (days) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="turnaround"
          type="number"
          min="1"
          {...form.register('turnaroundDays', { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">Delivery time once work begins</p>
      </div>
    </div>
  );
}
