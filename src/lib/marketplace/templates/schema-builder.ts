import { z } from 'zod';
import { TemplateConfiguration, TemplateFieldDefinition } from '../types';

/**
 * Build a Zod schema for a single field based on its definition
 */
export function buildFieldSchema(field: TemplateFieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'select':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]];
        schema = z.enum(values, {
          message: `${field.label} is required`,
        });
      } else {
        schema = z.string();
      }
      break;

    case 'multiselect':
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]];
        const enumSchema = z.enum(values);
        if (field.required) {
          schema = z
            .array(enumSchema)
            .min(1, `At least one ${field.label.toLowerCase()} is required`);
        } else {
          schema = z.array(enumSchema);
        }
      } else {
        schema = z.array(z.string());
      }
      break;

    case 'number':
      // Accept both number and string, transform string to number
      schema = z
        .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
        .pipe(z.number().int());
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'text':
      schema = z.string();
      break;

    default:
      schema = z.unknown();
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Build a complete Zod schema for a template configuration
 * This generates a schema from the field definitions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildTemplateSchema(templateConfig: TemplateConfiguration): z.ZodObject<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shape: Record<string, any> = {};

  for (const field of templateConfig.fields) {
    shape[field.key] = buildFieldSchema(field);
  }

  return z.object(shape);
}
