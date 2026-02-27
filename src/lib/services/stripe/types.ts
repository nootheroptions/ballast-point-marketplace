import type Stripe from 'stripe';

/**
 * Stripe Connect account creation parameters
 */
export interface CreateConnectAccountParams {
  email: string;
  /** ISO 3166-1 alpha-2 country code (e.g., "AU") */
  country: string;
  /** Business type for the connected account */
  businessType?: Stripe.AccountCreateParams.BusinessType;
}

/**
 * Result of creating a Stripe Connect account
 */
export interface CreateConnectAccountResult {
  accountId: string;
  /** URL for the user to complete onboarding */
  onboardingUrl: string;
}

/**
 * Parameters for creating an account link for onboarding
 */
export interface CreateAccountLinkParams {
  accountId: string;
  /** URL to redirect to on success */
  returnUrl: string;
  /** URL to redirect to if user needs to restart onboarding */
  refreshUrl: string;
}

/**
 * Stripe Connect account status information
 */
export interface ConnectAccountStatus {
  accountId: string;
  /** Whether the account has completed onboarding */
  detailsSubmitted: boolean;
  /** Whether payouts are enabled */
  payoutsEnabled: boolean;
  /** Whether charges are enabled */
  chargesEnabled: boolean;
  /** Current requirements that need to be fulfilled */
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
}

/**
 * Parameters for creating a payment intent
 */
export interface CreatePaymentIntentParams {
  /** Amount in cents */
  amountCents: number;
  /** ISO 4217 currency code (e.g., "aud") */
  currency: string;
  /** Stripe Connect account ID to receive the payment */
  connectedAccountId: string;
  /** Platform fee in cents (marketplace commission) */
  platformFeeCents: number;
  /** Optional metadata to attach to the payment intent */
  metadata?: Record<string, string>;
  /** Optional description for the payment */
  description?: string;
}

/**
 * Result of creating a payment intent
 */
export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: Stripe.PaymentIntent.Status;
}

/**
 * Payment intent status information
 */
export interface PaymentIntentStatus {
  id: string;
  status: Stripe.PaymentIntent.Status;
  amountCents: number;
  currency: string;
  metadata: Record<string, string>;
}

/**
 * Stripe service interface
 */
export interface StripeService {
  // Connect account methods
  createConnectAccount(params: CreateConnectAccountParams): Promise<CreateConnectAccountResult>;
  createAccountLink(params: CreateAccountLinkParams): Promise<string>;
  getAccountStatus(accountId: string): Promise<ConnectAccountStatus>;

  // Payment methods
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult>;
  getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntentStatus>;
  refundPayment(paymentIntentId: string): Promise<void>;
}

/**
 * Webhook event types we handle
 */
export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'account.updated';

/**
 * Parsed webhook event data
 */
export interface StripeWebhookEvent {
  type: StripeWebhookEventType;
  data: Stripe.Event.Data;
}
