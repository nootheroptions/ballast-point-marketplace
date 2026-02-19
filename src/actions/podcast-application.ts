'use server';

import { createAction } from '@/lib/auth/action-wrapper';
import { env } from '@/lib/config/env';
import { PodcastApplicationEmail } from '@/lib/email-templates/podcast-application-email';
import { createEmailService } from '@/lib/services/email';
import { podcastApplicationSchema } from '@/lib/validations/podcast-application';

const emailService = createEmailService();

export const submitPodcastApplication = createAction(podcastApplicationSchema, async (data) => {
  const applicationTypeLabel = data.applicationType === 'guest' ? 'Guest' : 'Co-Host';

  await emailService.sendReact({
    to: env.SUPPORT_EMAIL,
    subject: `New Podcast ${applicationTypeLabel} Application: ${data.firstName} ${data.lastName}`,
    react: PodcastApplicationEmail({ data }),
  });

  return {
    success: true,
    message: 'Your application has been submitted successfully!',
  };
});
