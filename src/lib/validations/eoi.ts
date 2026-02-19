import { z } from 'zod';

export const eoiSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  name: z.string().optional(),
});

export type EoiFormData = z.infer<typeof eoiSchema>;
