'use client';

import { useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { step2Schema } from '@/lib/validations/onboarding';
import { cn } from '@/lib/utils/shadcn';

const MIN_CHARS = 1;
const MAX_CHARS = 600;

interface Step2FormProps {
  description: string;
  onChange: (description: string) => void;
  onValidChange: (valid: boolean) => void;
}

export function Step2Form({ description, onChange, onValidChange }: Step2FormProps) {
  const charCount = description.length;
  const isUnderMin = charCount < MIN_CHARS;
  const isOverMax = charCount > MAX_CHARS;
  const isValid = !isUnderMin && !isOverMax;

  const validateForm = useCallback(() => {
    const result = step2Schema.safeParse({ description });
    return result.success;
  }, [description]);

  useEffect(() => {
    onValidChange(validateForm());
  }, [description, validateForm, onValidChange]);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Tell us a bit about your business
      </h1>
      <p className="text-muted-foreground mt-2">
        The most effective descriptions showcase key details about your business and highlight what
        makes you stand out, helping to attract and engage clients.
      </p>

      <div className="mt-8 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Business description</Label>
          <span
            className={cn(
              'text-sm',
              isUnderMin || isOverMax ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell potential clients about your business, your expertise, and what sets you apart..."
          className="min-h-[200px] resize-y"
          aria-invalid={!isValid && charCount > 0}
        />
        {isUnderMin && charCount > 0 && (
          <p className="text-destructive text-sm">
            A minimum of {MIN_CHARS} characters is required ({MIN_CHARS - charCount} more needed)
          </p>
        )}
        {isOverMax && (
          <p className="text-destructive text-sm">
            Description must be less than {MAX_CHARS} characters ({charCount - MAX_CHARS} over)
          </p>
        )}
        {charCount === 0 && (
          <p className="text-muted-foreground text-sm">
            A minimum of {MIN_CHARS} characters is required.
          </p>
        )}
      </div>
    </div>
  );
}
