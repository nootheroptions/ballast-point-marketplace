'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Service } from '@prisma/client';
import { createService, updateService } from '@/actions/services';
import { ServiceFormSidebar } from './ServiceFormSidebar';
import { FormHeader } from './FormHeader';
import { BasicDetailsForm } from './BasicDetailsForm';
import { CreateServiceData, createServiceSchema } from '@/lib/validations/service';

interface ServiceFormProps {
  service?: Service;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!service;

  const form = useForm<CreateServiceData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description ?? '',
    },
  });

  const handleClose = () => {
    router.push('/services');
  };

  const handleSave = async () => {
    // Trigger validation
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const data = form.getValues();

      if (isEditMode) {
        const result = await updateService({
          id: service.id,
          name: data.name,
          description: data.description,
        });

        if (result.success) {
          router.push('/services');
        } else {
          setError(result.error ?? 'Failed to update service');
        }
      } else {
        const result = await createService(data);

        if (result.success) {
          router.push('/services');
        } else {
          setError(result.error ?? 'Failed to create service');
        }
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <ServiceFormSidebar activeSection="basic" />
      <main className="flex-1">
        <FormHeader
          title={isEditMode ? 'Edit service' : 'New service'}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
          isDisabled={!form.formState.isDirty}
        />
        <div className="px-6 py-8">
          {error && (
            <div className="border-destructive/50 bg-destructive/10 mb-6 rounded-lg border p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          <BasicDetailsForm form={form} />
        </div>
      </main>
    </div>
  );
}
