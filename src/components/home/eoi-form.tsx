'use client';

import { submitExpressionOfInterest } from '@/actions/eoi';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eoiSchema, type EoiFormData } from '@/lib/validations/eoi';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

export function EoiForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState<ActionResult<{ message: string }> | null, EoiFormData>(
    async (_, data) => {
      return submitExpressionOfInterest(data);
    },
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EoiFormData>({
    resolver: zodResolver(eoiSchema),
    mode: 'onBlur',
  });

  if (state?.success) {
    return (
      <Card className="border-primary/20 bg-white/90 shadow-sm backdrop-blur-sm">
        <CardContent className="flex min-h-[164px] flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 className="text-primary h-10 w-10" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold">You&apos;re on the provider waitlist</h3>
            <p className="text-muted-foreground">
              Thanks for your interest. We&apos;ll share onboarding details as we prepare for
              launch.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => {
            startTransition(() => formAction(data));
          })}
          className="space-y-4 text-left"
        >
          {state?.error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
              {...register('email')}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 h-12 w-full text-sm font-semibold"
            size="lg"
            disabled={isPending}
          >
            {isPending ? 'Joining waitlist...' : 'Join provider waitlist'}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Get early access to create your profile and list services. No spam.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
