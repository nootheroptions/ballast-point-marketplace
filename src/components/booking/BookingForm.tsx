'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { inviteeInfoSchema, type InviteeInfoData } from '@/lib/validations/booking';

type BookingFormData = InviteeInfoData;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
}

export function BookingForm({ onSubmit, onBack, loading = false, error = null }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BookingFormData>({
    resolver: zodResolver(inviteeInfoSchema),
    mode: 'onChange',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Your Information</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="John Doe"
            autoComplete="name"
            disabled={loading}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-destructive mt-1 text-sm">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            autoComplete="email"
            disabled={loading}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-destructive mt-1 text-sm">{errors.email.message}</p>}
        </div>

        {/* Notes (optional) */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information you'd like to share..."
            rows={4}
            disabled={loading}
            aria-invalid={!!errors.notes}
          />
          {errors.notes && <p className="text-destructive mt-1 text-sm">{errors.notes.message}</p>}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-28"
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto sm:min-w-44"
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm booking'
            )}
          </Button>
        </div>

        <p className="text-muted-foreground text-right text-xs">
          By confirming, you agree to receive booking confirmation via email.
        </p>
      </form>
    </div>
  );
}
