import { UseFormReturn } from 'react-hook-form';
import { CreateServiceData } from '@/lib/validations/service';
import { TemplateKey } from '@prisma/client';

/**
 * Hook for managing template data in the service form
 * Provides type-safe access to template data with validation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTemplateData<T extends Record<string, any>>(
  form: UseFormReturn<CreateServiceData>,
  _templateKey: TemplateKey
) {
  const templateData = (form.watch('templateData') as T) || ({} as T);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    const updated = { ...templateData, [field]: value };
    form.setValue('templateData', updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const getError = (field: keyof T): string | undefined => {
    const errors = form.formState.errors.templateData;
    if (errors && typeof errors === 'object' && field in errors) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldError = (errors as any)[field];
      return fieldError?.message;
    }
    return undefined;
  };

  return {
    templateData,
    updateField,
    getError,
  };
}
