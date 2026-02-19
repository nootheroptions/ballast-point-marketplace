import type { ReactElement } from 'react';

/** Resend API response for a sent email */
export interface SendEmailResponse {
  id: string;
}

/** Base email options shared by all send methods */
export interface BaseEmailOptions {
  to: string | string[];
  subject: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  /** Custom headers */
  headers?: Record<string, string>;
  /** Tags for analytics/filtering in Resend dashboard */
  tags?: Array<{ name: string; value: string }>;
}

/** Send email using React Email component */
export interface SendReactEmailOptions extends BaseEmailOptions {
  react: ReactElement;
}

/** Send email using raw HTML */
export interface SendHtmlEmailOptions extends BaseEmailOptions {
  html: string;
  /** Plain text fallback */
  text?: string;
}

/** Send email using a Resend dashboard template */
export interface SendTemplateEmailOptions extends Omit<BaseEmailOptions, 'subject'> {
  /** Template ID from Resend dashboard */
  templateId: string;
  /** Variables to replace in the template */
  variables?: Record<string, unknown>;
}

/** Union type for all email send options */
export type SendEmailOptions =
  | SendReactEmailOptions
  | SendHtmlEmailOptions
  | SendTemplateEmailOptions;
