'use client';

import { submitPodcastApplication } from '@/actions/podcast-application';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  podcastApplicationSchema,
  type PodcastApplicationFormData,
} from '@/lib/validations/podcast-application';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useActionState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function JoinUsForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult<{ message: string }> | null,
    PodcastApplicationFormData
  >(async (_, data) => {
    return submitPodcastApplication(data);
  }, null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PodcastApplicationFormData>({
    resolver: zodResolver(podcastApplicationSchema),
    mode: 'onBlur',
  });

  if (state?.success) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-white/80 p-8 text-center backdrop-blur-sm">
        <CheckCircle2 className="text-primary h-12 w-12" />
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">Application Submitted</h3>
          <p className="text-muted-foreground max-w-md">
            Thank you for your interest in joining Buildipedia! We&apos;ll review your application
            and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => {
        formAction(data);
      })}
      className="space-y-8"
    >
      {state?.error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="applicationType" className="text-sm font-medium">
          I want to apply as a <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="applicationType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="applicationType" className="h-11">
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="co-host">Co-Host</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.applicationType && (
          <p className="text-destructive text-sm">{errors.applicationType.message}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            autoComplete="given-name"
            className="h-11"
            disabled={isPending}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="text-destructive text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            className="h-11"
            disabled={isPending}
            {...register('lastName')}
          />
          {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            className="h-11"
            disabled={isPending}
            {...register('email')}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+61 400 000 000"
            autoComplete="tel"
            className="h-11"
            disabled={isPending}
            {...register('phone')}
          />
          {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City you live in <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            placeholder="Sydney"
            autoComplete="address-level2"
            className="h-11"
            disabled={isPending}
            {...register('city')}
          />
          {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="text-sm font-medium">
            LinkedIn profile URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/johndoe"
            className="h-11"
            disabled={isPending}
            {...register('linkedinUrl')}
          />
          {errors.linkedinUrl && (
            <p className="text-destructive text-sm">{errors.linkedinUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industryExpertise" className="text-sm font-medium">
          Overview of industry expertise relevant to this podcast{' '}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="industryExpertise"
          placeholder="Describe your background and expertise in the building and construction industry..."
          rows={5}
          className="min-h-32"
          disabled={isPending}
          {...register('industryExpertise')}
        />
        {errors.industryExpertise && (
          <p className="text-destructive text-sm">{errors.industryExpertise.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniqueInsight" className="text-sm font-medium">
          What makes you uniquely qualified? <span className="text-destructive">*</span>
        </Label>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Share your unique insight that challenges the status quo, insider knowledge, ability to
          debunk common misconceptions, discuss pressing issues in the field, or anything that makes
          you uniquely qualified to be on Buildipedia.
        </p>
        <Textarea
          id="uniqueInsight"
          placeholder="Share what makes you stand out..."
          rows={6}
          className="min-h-40"
          disabled={isPending}
          {...register('uniqueInsight')}
        />
        {errors.uniqueInsight && (
          <p className="text-destructive text-sm">{errors.uniqueInsight.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="workSampleUrl" className="text-sm font-medium">
          Link to a sample of your work <span className="text-destructive">*</span>
        </Label>
        <Input
          id="workSampleUrl"
          type="url"
          placeholder="https://example.com/my-work"
          className="h-11"
          disabled={isPending}
          {...register('workSampleUrl')}
        />
        {errors.workSampleUrl && (
          <p className="text-destructive text-sm">{errors.workSampleUrl.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 h-12 w-full text-base font-semibold"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Submitting Application...' : 'Submit Application'}
      </Button>
    </form>
  );
}
