'use client';

import { createService, updateService } from '@/actions/services';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createServiceSchema, type CreateServiceData } from '@/lib/validations/service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormHeader } from '../FormHeader';
import { BookingFields } from './BookingFields';
import { CoveragePackageSelector } from './CoveragePackageSelector';
import { DeliveryModeSelector } from './DeliveryModeSelector';
import { PricingAndTimingFields } from './PricingAndTimingFields';
import { GenericTemplateFields } from './templates/GenericTemplateFields';
import { TemplateSelector } from './TemplateSelector';

interface MarketplaceServiceFormProps {
  service?: Service;
}

/**
 * Convert a service name to a URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function MarketplaceServiceForm({ service }: MarketplaceServiceFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const isEditMode = !!service;

  const form = useForm<CreateServiceData>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onBlur',
    defaultValues: service
      ? {
          name: service.name,
          slug: service.slug,
          description: service.description,
          templateKey: service.templateKey ?? undefined,
          templateData: (service.templateData as Record<string, unknown>) ?? {},
          coveragePackageKey: service.coveragePackageKey ?? undefined,
          priceCents: service.priceCents ?? 0,
          leadTimeDays: service.leadTimeDays ?? 7,
          turnaroundDays: service.turnaroundDays ?? 5,
          deliveryMode: service.deliveryMode ?? undefined,
          positioning: service.positioning ?? undefined,
          assumptions: service.assumptions ?? undefined,
          clientResponsibilities: (service.clientResponsibilities as string[]) ?? undefined,
          slotDuration: service.slotDuration ?? 60,
          slotBuffer: service.slotBuffer ?? 15,
          advanceBookingMin: service.advanceBookingMin ?? 1440,
          advanceBookingMax: service.advanceBookingMax ?? 43200,
        }
      : {
          name: '',
          slug: '',
          description: '',
          templateData: {},
          priceCents: 0,
          slotDuration: 60,
          slotBuffer: 15,
          advanceBookingMin: 1440,
          advanceBookingMax: 43200,
          leadTimeDays: 7,
          turnaroundDays: 5,
        },
  });

  const templateKey = form.watch('templateKey');
  const name = form.watch('name');
  const [previousTemplateKey, setPreviousTemplateKey] = useState(templateKey);

  // Auto-generate slug from name
  useEffect(() => {
    if (isSlugManuallyEdited) return;

    if (name) {
      const generatedSlug = generateSlug(name);
      form.setValue('slug', generatedSlug, { shouldValidate: false });
    }
  }, [name, form, isSlugManuallyEdited]);

  // Reset template data when template changes (but not on initial load)
  useEffect(() => {
    if (templateKey && previousTemplateKey && templateKey !== previousTemplateKey) {
      // Template was changed, reset data
      form.setValue('templateData', {}, { shouldValidate: false });
    }
    setPreviousTemplateKey(templateKey);
  }, [templateKey, previousTemplateKey, form]);

  const handleClose = () => {
    router.push('/services');
  };

  const onSubmit = async (data: CreateServiceData) => {
    setError(null);
    setIsSaving(true);

    try {
      const result = isEditMode
        ? await updateService({ id: service.id, ...data })
        : await createService(data);

      if (result.success) {
        router.push('/services');
      } else {
        setError(result.error ?? `Failed to ${isEditMode ? 'update' : 'create'} service`);
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const onError = () => {
    setError('Please fix the validation errors before saving');
  };

  const handleSave = () => {
    // Use form.handleSubmit to trigger validation
    form.handleSubmit(onSubmit, onError)();
  };

  return (
    <div className="min-h-screen">
      {/* Main Form */}
      <main>
        <FormHeader
          title={isEditMode ? 'Edit Marketplace Service' : 'New Marketplace Service'}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
          isDisabled={!form.formState.isDirty}
        />
        <div className="max-w-4xl">
          {error && (
            <div className="border-destructive/50 bg-destructive/10 mb-6 rounded-lg border p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Details */}
            <section>
              <h2 className="mb-6 text-xl font-semibold">Basic Details</h2>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Service Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Quick Feasibility Assessment"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    placeholder="quick-feasibility-assessment"
                    {...form.register('slug')}
                    onChange={(e) => {
                      form.register('slug').onChange(e);
                      setIsSlugManuallyEdited(true);
                    }}
                  />
                  <p className="text-muted-foreground text-sm">
                    URL-friendly identifier (auto-generated from name)
                  </p>
                  {form.formState.errors.slug && (
                    <p className="text-destructive text-sm">{form.formState.errors.slug.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this service includes and who it's for..."
                    rows={4}
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Template Selection */}
            <section>
              <h2 className="mb-6 text-xl font-semibold">Service Template</h2>
              <TemplateSelector
                value={templateKey}
                onChange={(value) => form.setValue('templateKey', value, { shouldValidate: false })}
              />
              {form.formState.errors.templateKey && (
                <p className="text-destructive mt-2 text-sm">
                  {form.formState.errors.templateKey.message}
                </p>
              )}
            </section>

            {/* Template-Specific Fields */}
            {templateKey && (
              <>
                <Separator />
                <section>
                  <GenericTemplateFields templateKey={templateKey} form={form} />
                </section>
              </>
            )}

            {/* Coverage Package */}
            {templateKey && (
              <>
                <Separator />
                <section>
                  <h2 className="mb-6 text-xl font-semibold">Coverage</h2>
                  <CoveragePackageSelector
                    templateKey={templateKey}
                    value={form.watch('coveragePackageKey')}
                    onChange={(value) =>
                      form.setValue('coveragePackageKey', value, { shouldValidate: false })
                    }
                  />
                  {form.formState.errors.coveragePackageKey && (
                    <p className="text-destructive mt-2 text-sm">
                      {form.formState.errors.coveragePackageKey.message}
                    </p>
                  )}
                </section>
              </>
            )}

            {/* Pricing & Timing */}
            <Separator />
            <section>
              <PricingAndTimingFields form={form} />
            </section>

            {/* Delivery Mode */}
            <Separator />
            <section>
              <h2 className="mb-6 text-xl font-semibold">Delivery</h2>
              <DeliveryModeSelector
                value={form.watch('deliveryMode')}
                onChange={(value) =>
                  form.setValue('deliveryMode', value, { shouldValidate: false })
                }
              />
              {form.formState.errors.deliveryMode && (
                <p className="text-destructive mt-2 text-sm">
                  {form.formState.errors.deliveryMode.message}
                </p>
              )}
            </section>

            {/* Booking Configuration */}
            <Separator />
            <section>
              <BookingFields form={form} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
