'use server';

import { createAction } from '@/lib/auth/action-wrapper';
import { env } from '@/lib/config/env';
import { WaitlistSignupEmail } from '@/lib/email-templates/waitlist-signup-email';
import { createEoiRepository } from '@/lib/repositories/eoi.repo';
import { createEmailService } from '@/lib/services/email';
import { eoiSchema } from '@/lib/validations/eoi';

const eoiRepository = createEoiRepository();
const emailService = createEmailService();

export const submitExpressionOfInterest = createAction(eoiSchema, async (data) => {
  await eoiRepository.upsert(data);

  try {
    await emailService.sendReact({
      to: env.SUPPORT_EMAIL,
      subject: `New Waitlist Signup: ${data.email}`,
      react: WaitlistSignupEmail({ email: data.email }),
    });
  } catch (error) {
    console.error(`Failed to send waitlist signup notification email from ${data.email}:`, error);
  }

  return {
    success: true,
    message: "Thanks for your interest! We'll be in touch soon.",
  };
});
