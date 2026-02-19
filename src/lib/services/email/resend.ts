import 'server-only';

import { Resend } from 'resend';

import { env } from '@/lib/config/env';
import type {
  SendEmailResponse,
  SendHtmlEmailOptions,
  SendReactEmailOptions,
  SendTemplateEmailOptions,
} from './types';

function getDefaultFromAddress(): string {
  return `Buildipedia <${env.RESEND_FROM_EMAIL}>`;
}

export interface EmailService {
  /** Send an email using a React Email component */
  sendReact(options: SendReactEmailOptions): Promise<SendEmailResponse>;

  /** Send an email using raw HTML */
  sendHtml(options: SendHtmlEmailOptions): Promise<SendEmailResponse>;

  /** Send an email using a Resend dashboard template */
  sendTemplate(options: SendTemplateEmailOptions): Promise<SendEmailResponse>;
}

export function createEmailService(): EmailService {
  const resend = new Resend(env.RESEND_API_KEY);

  return {
    async sendReact(options: SendReactEmailOptions): Promise<SendEmailResponse> {
      const { react, from = getDefaultFromAddress(), ...rest } = options;

      const { data, error } = await resend.emails.send({
        from,
        react,
        ...rest,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { id: data!.id };
    },

    async sendHtml(options: SendHtmlEmailOptions): Promise<SendEmailResponse> {
      const { html, text, from = getDefaultFromAddress(), ...rest } = options;

      const { data, error } = await resend.emails.send({
        from,
        html,
        text,
        ...rest,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { id: data!.id };
    },

    async sendTemplate(options: SendTemplateEmailOptions): Promise<SendEmailResponse> {
      const { templateId, variables, from = getDefaultFromAddress(), to, ...rest } = options;

      // When using templates, pass template object instead of html/react/text
      // Template defines its own subject (can be overridden in rest params)
      const { data, error } = await resend.emails.send({
        from,
        to,
        template: {
          id: templateId,
          variables,
        },
        ...rest,
      } as Parameters<typeof resend.emails.send>[0]);

      if (error) {
        throw new Error(`Failed to send template email: ${error.message}`);
      }

      return { id: data!.id };
    },
  };
}
