'use client';

import { createBundle, updateBundle } from '@/actions/bundles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterPageHeaderSave } from '@/components/layout/provider-dashboard/PageHeaderContext';
import { createBundleSchema, type CreateBundleData } from '@/lib/validations/bundle';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, BundlePricingType, TemplateKey } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TEMPLATES, TEMPLATE_STAGE_ORDER } from '@/lib/marketplace/templates';
import { cn } from '@/lib/utils/shadcn';
import { generateSlug } from '@/lib/utils/slug';
import { Check, Loader2 } from 'lucide-react';
import { BundleWithServices } from '@/lib/repositories/bundle.repo';
import { formatPrice } from '@/lib/utils/format-price';

interface BundleFormProps {
  bundle?: BundleWithServices;
  services: Service[];
}

export function BundleForm({ bundle, services }: BundleFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const isEditMode = !!bundle;

  // Group services by template key
  const servicesByTemplate = useMemo(() => {
    const grouped: Record<TemplateKey, Service[]> = {
      [TemplateKey.CONSULTATION]: [],
      [TemplateKey.FEASIBILITY]: [],
      [TemplateKey.CONCEPT_DESIGN]: [],
      [TemplateKey.PLANNING_APPROVALS]: [],
      [TemplateKey.REVIEW]: [],
    };

    services.forEach((service) => {
      if (service.templateKey) {
        grouped[service.templateKey].push(service);
      }
    });

    return grouped;
  }, [services]);

  // Track selected service per template (serviceId or null)
  const [selectedServices, setSelectedServices] = useState<Record<TemplateKey, string | null>>(
    () => {
      const initial: Record<TemplateKey, string | null> = {
        [TemplateKey.CONSULTATION]: null,
        [TemplateKey.FEASIBILITY]: null,
        [TemplateKey.CONCEPT_DESIGN]: null,
        [TemplateKey.PLANNING_APPROVALS]: null,
        [TemplateKey.REVIEW]: null,
      };

      // Pre-populate from existing bundle
      if (bundle?.services) {
        bundle.services.forEach((bs) => {
          initial[bs.service.templateKey] = bs.serviceId;
        });
      }

      return initial;
    }
  );

  const form = useForm<CreateBundleData>({
    resolver: zodResolver(createBundleSchema),
    mode: 'onBlur',
    defaultValues: bundle
      ? {
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          positioning: bundle.positioning ?? undefined,
          pricingType: bundle.pricingType,
          priceCents: bundle.priceCents,
          services: bundle.services.map((bs) => ({
            serviceId: bs.serviceId,
            sortOrder: bs.sortOrder,
          })),
        }
      : {
          name: '',
          slug: '',
          description: '',
          pricingType: BundlePricingType.SUM_OF_PARTS,
          priceCents: 0,
          services: [],
        },
  });

  const pricingType = form.watch('pricingType');
  const name = form.watch('name');

  // Calculate sum of parts price
  const sumOfPartsPriceCents = useMemo(() => {
    return TEMPLATE_STAGE_ORDER.reduce((sum, templateKey) => {
      const serviceId = selectedServices[templateKey];
      if (serviceId) {
        const service = services.find((s) => s.id === serviceId);
        return sum + (service?.priceCents ?? 0);
      }
      return sum;
    }, 0);
  }, [selectedServices, services]);

  // Count selected services
  const selectedServiceCount = useMemo(() => {
    return Object.values(selectedServices).filter((id) => id !== null).length;
  }, [selectedServices]);

  // Update form services whenever selection changes
  useEffect(() => {
    const selectedServicesList: { serviceId: string; sortOrder: number }[] = [];
    let sortOrder = 0;

    TEMPLATE_STAGE_ORDER.forEach((templateKey) => {
      const serviceId = selectedServices[templateKey];
      if (serviceId) {
        selectedServicesList.push({
          serviceId,
          sortOrder,
        });
        sortOrder++;
      }
    });

    form.setValue('services', selectedServicesList, { shouldValidate: true });
  }, [selectedServices, form]);

  // Auto-generate slug from name
  useEffect(() => {
    if (isSlugManuallyEdited) return;

    if (name) {
      const generatedSlug = generateSlug(name);
      form.setValue('slug', generatedSlug, { shouldValidate: false });
    }
  }, [name, form, isSlugManuallyEdited]);

  const handleServiceToggle = (templateKey: TemplateKey, serviceId: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [templateKey]: prev[templateKey] === serviceId ? null : serviceId,
    }));
  };

  const onSubmit = async (data: CreateBundleData) => {
    setError(null);
    setIsSaving(true);

    try {
      const result = isEditMode
        ? await updateBundle({ id: bundle.id, ...data })
        : await createBundle(data);

      if (result.success) {
        router.push('/services');
      } else {
        setError(result.error ?? `Failed to ${isEditMode ? 'update' : 'create'} bundle`);
      }
    } catch (err) {
      console.error('Error saving bundle:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const onError = () => {
    setError('Please fix the validation errors before saving');
  };

  const handleSave = () => {
    form.handleSubmit(onSubmit, onError)();
  };

  useRegisterPageHeaderSave(handleSave, isSaving, !form.formState.isDirty && !isEditMode);

  return (
    <>
      {error && (
        <div className="border-destructive/50 bg-destructive/10 mb-6 rounded-lg border p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Details */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">Basic Details</h2>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Bundle Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Full Planning Package"
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
                placeholder="full-planning-package"
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
                placeholder="Describe what this bundle includes and who it's for..."
                rows={4}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Positioning */}
            <div className="space-y-2">
              <Label htmlFor="positioning">Positioning</Label>
              <Input
                id="positioning"
                placeholder="e.g., Best for comprehensive projects"
                {...form.register('positioning')}
              />
              <p className="text-muted-foreground text-sm">
                Optional short text to highlight what makes this bundle unique
              </p>
              {form.formState.errors.positioning && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.positioning.message}
                </p>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* Service Selection */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Select Services</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose one service from each category to include in this bundle. You must select at
              least 2 services.
            </p>
            {selectedServiceCount < 2 && (
              <p className="mt-2 text-sm text-amber-600">
                {selectedServiceCount === 0
                  ? 'No services selected'
                  : `${selectedServiceCount} service selected - need at least 2`}
              </p>
            )}
            {form.formState.errors.services && (
              <p className="text-destructive mt-2 text-sm">
                {form.formState.errors.services.message}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {TEMPLATES.map((template) => {
              const templateServices = servicesByTemplate[template.key];
              const selectedServiceId = selectedServices[template.key];

              return (
                <div key={template.key} className="space-y-4">
                  <div>
                    <h3 className="font-medium">{template.label}</h3>
                    <p className="text-muted-foreground text-sm">{template.description}</p>
                  </div>

                  {templateServices.length === 0 ? (
                    <div className="border-muted bg-muted/20 rounded-lg border border-dashed p-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        No services in this category yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {templateServices.map((service) => {
                        const isSelected = selectedServiceId === service.id;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceToggle(template.key, service.id)}
                            className={cn(
                              'relative flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            )}
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30'
                              )}
                            >
                              {isSelected && <Check className="text-primary-foreground h-3 w-3" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{service.name}</p>
                                <span className="text-muted-foreground text-sm">
                                  {formatPrice(service.priceCents)}
                                </span>
                              </div>
                              {service.description && (
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Pricing */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">Pricing</h2>

          <div className="space-y-4">
            {/* Pricing Type */}
            <div className="space-y-3">
              <Label>Pricing Type</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue('pricingType', BundlePricingType.SUM_OF_PARTS, {
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    'relative flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                    pricingType === BundlePricingType.SUM_OF_PARTS
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      pricingType === BundlePricingType.SUM_OF_PARTS
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {pricingType === BundlePricingType.SUM_OF_PARTS && (
                      <Check className="text-primary-foreground h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Sum of Parts</p>
                    <p className="text-muted-foreground text-sm">
                      Bundle price equals the total of all included services. Automatically updates
                      if service prices change.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    form.setValue('pricingType', BundlePricingType.FIXED, { shouldValidate: true })
                  }
                  className={cn(
                    'relative flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                    pricingType === BundlePricingType.FIXED
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      pricingType === BundlePricingType.FIXED
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {pricingType === BundlePricingType.FIXED && (
                      <Check className="text-primary-foreground h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Fixed Price</p>
                    <p className="text-muted-foreground text-sm">
                      Set a custom bundle price. Use this to offer a discount or special pricing.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Display / Input */}
            {pricingType === BundlePricingType.SUM_OF_PARTS ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Calculated Price:</span>
                  <span className="text-lg font-semibold">{formatPrice(sumOfPartsPriceCents)}</span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  This price is automatically calculated from the selected services and will update
                  if service prices change.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="priceCents">
                  Bundle Price (AUD) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    id="priceCents"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    {...form.register('priceCents', {
                      setValueAs: (v) => (v === '' ? 0 : Math.round(parseFloat(v) * 100)),
                    })}
                    defaultValue={bundle?.priceCents ? bundle.priceCents / 100 : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const cents = value === '' ? 0 : Math.round(parseFloat(value) * 100);
                      form.setValue('priceCents', cents, { shouldValidate: true });
                    }}
                  />
                </div>
                {sumOfPartsPriceCents > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Sum of parts: {formatPrice(sumOfPartsPriceCents)}
                    {form.watch('priceCents') > 0 &&
                      form.watch('priceCents') < sumOfPartsPriceCents && (
                        <span className="ml-2 text-green-600">
                          (
                          {Math.round(
                            ((sumOfPartsPriceCents - form.watch('priceCents')) /
                              sumOfPartsPriceCents) *
                              100
                          )}
                          % discount)
                        </span>
                      )}
                  </p>
                )}
                {form.formState.errors.priceCents && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.priceCents.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || (!form.formState.isDirty && !isEditMode)}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </>
  );
}
