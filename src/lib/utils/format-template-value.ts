import { TemplateKey } from '@prisma/client';
import { TEMPLATES_BY_KEY } from '../marketplace/templates';

/**
 * Converts a template field value (enum) to its user-friendly label
 * @param templateKey - The template key (e.g., CONSULTATION)
 * @param fieldKey - The field key (e.g., 'delivery', 'focus')
 * @param value - The stored value (e.g., 'PHONE', 'RENOVATION_ADVICE')
 * @returns The user-friendly label or the original value if not found
 */
export function formatTemplateValue(
  templateKey: TemplateKey,
  fieldKey: string,
  value: string
): string {
  const template = TEMPLATES_BY_KEY[templateKey];
  if (!template) return value;

  const field = template.fields.find((f) => f.key === fieldKey);
  if (!field || !('options' in field)) return value;

  const option = field.options?.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * Formats an array of template values to their labels
 */
export function formatTemplateValues(
  templateKey: TemplateKey,
  fieldKey: string,
  values: string[]
): string[] {
  return values.map((value) => formatTemplateValue(templateKey, fieldKey, value));
}
