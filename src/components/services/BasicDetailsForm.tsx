'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicDetailsFormProps {
  form: UseFormReturn<{
    name: string;
    slug: string;
    description: string;
  }>;
  onSlugManualEdit?: () => void;
}

export function BasicDetailsForm({ form, onSlugManualEdit }: BasicDetailsFormProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const nameValue = watch('name') || '';
  const slugValue = watch('slug') || '';
  const descriptionValue = watch('description') || '';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-xl font-semibold">Basic details</h2>

        <div className="max-w-2xl space-y-6">
          {/* Service name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">
                Service name <span className="text-destructive">*</span>
              </Label>
              <span className="text-muted-foreground text-sm">{nameValue.length}/255</span>
            </div>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Floor plan, Heritage consultation"
              maxLength={255}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          {/* Service slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">
                URL slug <span className="text-destructive">*</span>
              </Label>
              <span className="text-muted-foreground text-sm">{slugValue.length}/100</span>
            </div>
            <Input
              id="slug"
              {...register('slug', {
                onChange: onSlugManualEdit,
              })}
              placeholder="e.g., floor-plan, heritage-consultation"
              maxLength={100}
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && <p className="text-destructive text-sm">{errors.slug.message}</p>}
            <p className="text-muted-foreground text-xs">
              Lowercase letters, numbers, and hyphens only. Used in booking URLs.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <span className="text-muted-foreground text-sm">{descriptionValue.length}/1000</span>
            </div>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Add a short description"
              rows={6}
              maxLength={1000}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
