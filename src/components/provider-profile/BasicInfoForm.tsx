'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProviderProfile } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  updateProviderProfileSchema,
  type UpdateProviderProfileData,
} from '@/lib/validations/provider-profile';
import { updateProviderProfile } from '@/actions/providers';

interface BasicInfoFormProps {
  profile: ProviderProfile;
}

export function BasicInfoForm({ profile }: BasicInfoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<UpdateProviderProfileData>({
    resolver: zodResolver(updateProviderProfileSchema),
    defaultValues: {
      name: profile.name,
      slug: profile.slug,
      description: profile.description ?? '',
      logoUrl: profile.logoUrl ?? '',
    },
  });

  const { isDirty } = form.formState;

  async function onSubmit(data: UpdateProviderProfileData) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateProviderProfile(data);

      if ('success' in result && !result.success) {
        setErrorMessage(result.error || 'Failed to update profile');
        return;
      }

      setSuccessMessage('Profile updated successfully');
      // Reset form state to mark as not dirty after successful save
      if ('data' in result && result.data) {
        form.reset({
          name: result.data.name,
          slug: result.data.slug,
          description: result.data.description ?? '',
          logoUrl: result.data.logoUrl ?? '',
        });
      }
      router.refresh();
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
            {successMessage}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Business Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your business name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed publicly on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                URL Slug <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="your-business-name" {...field} />
              </FormControl>
              <FormDescription>
                This will be used in your public profile URL. Only lowercase letters, numbers, and
                hyphens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your business"
                  className="min-h-32 resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                A brief description of your business (max 600 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/logo.png"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>URL to your business logo image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
