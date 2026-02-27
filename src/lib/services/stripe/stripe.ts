import 'server-only';

import Stripe from 'stripe';
import { env } from '@/lib/config/env';
import type {
  StripeService,
  CreateConnectAccountParams,
  CreateConnectAccountResult,
  CreateAccountLinkParams,
  ConnectAccountStatus,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  PaymentIntentStatus,
} from './types';

/**
 * Platform fee percentage (10% marketplace commission)
 */
export const PLATFORM_FEE_PERCENTAGE = 0.1;

/**
 * Calculate platform fee from service price
 * @param amountCents - Total amount in cents
 * @returns Platform fee in cents (rounded to nearest cent)
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENTAGE);
}

/**
 * Create the Stripe SDK client
 * Uses the secret key from environment variables
 */
function createStripeClient(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
}

/**
 * Create a Stripe service instance
 * Factory pattern following project conventions
 */
export function createStripeService(): StripeService {
  const stripe = createStripeClient();

  return {
    /**
     * Create a Stripe Connect Express account for a provider
     * Express accounts handle most compliance requirements automatically
     *
     * Stripe API: https://stripe.com/docs/api/accounts/create
     */
    async createConnectAccount(
      params: CreateConnectAccountParams
    ): Promise<CreateConnectAccountResult> {
      const { email, country, businessType = 'individual' } = params;

      // Create Express account - Stripe handles onboarding UI
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_type: businessType,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Create account link for onboarding flow
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/payments?refresh=true`,
        return_url: `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/payments/callback`,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    },

    /**
     * Create an account link for continuing/completing onboarding
     * Used when a provider needs to update their information or complete setup
     *
     * Stripe API: https://stripe.com/docs/api/account_links/create
     */
    async createAccountLink(params: CreateAccountLinkParams): Promise<string> {
      const { accountId, returnUrl, refreshUrl } = params;

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    },

    /**
     * Get the current status of a Stripe Connect account
     * Used to check if a provider has completed onboarding and can receive payments
     *
     * Stripe API: https://stripe.com/docs/api/accounts/retrieve
     */
    async getAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
      const account = await stripe.accounts.retrieve(accountId);

      return {
        accountId: account.id,
        detailsSubmitted: account.details_submitted ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
        chargesEnabled: account.charges_enabled ?? false,
        requirements: {
          currentlyDue: account.requirements?.currently_due ?? [],
          eventuallyDue: account.requirements?.eventually_due ?? [],
          pastDue: account.requirements?.past_due ?? [],
        },
      };
    },

    /**
     * Create a payment intent for a booking
     * Uses Stripe Connect destination charges to split payment between platform and provider
     *
     * Stripe API: https://stripe.com/docs/api/payment_intents/create
     * Connect guide: https://stripe.com/docs/connect/destination-charges
     */
    async createPaymentIntent(
      params: CreatePaymentIntentParams
    ): Promise<CreatePaymentIntentResult> {
      const { amountCents, currency, connectedAccountId, platformFeeCents, metadata, description } =
        params;

      // Create payment intent with destination charge
      // Platform collects payment, then transfers to connected account minus fee
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency,
        description,
        metadata,
        // Destination charge: payment goes to connected account
        transfer_data: {
          destination: connectedAccountId,
        },
        // Platform keeps the application fee
        application_fee_amount: platformFeeCents,
        // Automatically confirm with payment method from client
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
      };
    },

    /**
     * Get the status of a payment intent
     *
     * Stripe API: https://stripe.com/docs/api/payment_intents/retrieve
     */
    async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntentStatus> {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amountCents: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata as Record<string, string>,
      };
    },

    /**
     * Refund a payment
     * Creates a full refund for the payment intent
     *
     * Stripe API: https://stripe.com/docs/api/refunds/create
     */
    async refundPayment(paymentIntentId: string): Promise<void> {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
    },
  };
}

/**
 * Verify a Stripe webhook signature and parse the event
 * Should be used in webhook handlers to ensure requests are from Stripe
 *
 * Stripe API: https://stripe.com/docs/webhooks/signatures
 *
 * @param payload - Raw request body as string
 * @param signature - Stripe-Signature header value
 * @returns Parsed Stripe event
 * @throws Error if signature verification fails
 */
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  const stripe = createStripeClient();

  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
