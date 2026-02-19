'use server';

import { createAction } from '@/lib/auth/action-wrapper';
import { createEoiRepository } from '@/lib/repositories/eoi.repo';
import { eoiSchema } from '@/lib/validations/eoi';

const eoiRepository = createEoiRepository();

export const submitExpressionOfInterest = createAction(eoiSchema, async (data) => {
  await eoiRepository.upsert(data);

  return {
    success: true,
    message: "Thanks for your interest! We'll be in touch soon.",
  };
});
