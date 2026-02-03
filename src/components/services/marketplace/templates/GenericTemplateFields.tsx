'use client';

import { UseFormReturn } from 'react-hook-form';
import { TemplateKey } from '@prisma/client';
import { TEMPLATES_BY_KEY } from '@/lib/marketplace/templates';
import { TemplateFieldRenderer } from './TemplateFieldRenderer';
import { useTemplateData } from '@/hooks/useTemplateData';
import type { CreateServiceData } from '@/lib/validations/service';

interface GenericTemplateFieldsProps {
  templateKey: TemplateKey;
  form: UseFormReturn<CreateServiceData>;
}

/**
 * Generic template fields component
 * Dynamically renders form fields based on the template configuration
 * This single component replaces all individual template field components
 */
export function GenericTemplateFields({ templateKey, form }: GenericTemplateFieldsProps) {
  const template = TEMPLATES_BY_KEY[templateKey];
  const { templateData, updateField, getError } = useTemplateData(form, templateKey);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">{template.label} Configuration</h3>
        <p className="text-muted-foreground mb-6 text-sm">{template.description}</p>
      </div>

      {template.fields.map((field) => (
        <TemplateFieldRenderer
          key={field.key}
          field={field}
          value={templateData[field.key]}
          onChange={(value) => updateField(field.key, value)}
          error={getError(field.key)}
        />
      ))}
    </div>
  );
}
