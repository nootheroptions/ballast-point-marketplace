import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/services/stripe';
import { paymentRepo } from '@/lib/repositories/payment.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { prisma } from '@/lib/db/prisma';

/**
 * Stripe Webhook Handler
 *
 * Handles incoming webhook events from Stripe for:
 * - Payment status updates (succeeded, failed)
 * - Connect account updates
 *
 * Stripe Webhooks Guide: https://stripe.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Stripe webhook: Missing signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature to ensure request is from Stripe
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        // Log unhandled events for debugging
        console.log(`Stripe webhook: Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Stripe webhook handler error for ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying (we've logged the error)
    // If you want retries, return 500 instead
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

/**
 * Handle successful payment
 * Updates payment record status to SUCCEEDED
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  try {
    // Update payment record
    await paymentRepo.markSucceeded(paymentIntent.id);
    console.log(`Payment record updated for ${paymentIntent.id}`);
  } catch (err) {
    // Payment record might not exist if webhook arrives before our DB write
    // This is fine - the confirmBookingWithPayment action handles this case
    console.log(`Payment record not found for ${paymentIntent.id} (may be created later)`);
  }
}

/**
 * Handle failed payment
 * Updates payment record status to FAILED
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  try {
    await paymentRepo.markFailed(paymentIntent.id);
    console.log(`Payment record marked as failed for ${paymentIntent.id}`);
  } catch (err) {
    console.log(`Payment record not found for ${paymentIntent.id}`);
  }
}

/**
 * Handle Stripe Connect account updates
 * Updates provider's stripe account status based on capabilities
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`Account updated: ${account.id}`);

  // Find provider with this Stripe account ID
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!providerProfile) {
    console.log(`No provider found for Stripe account ${account.id}`);
    return;
  }

  // Determine account status
  let status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' = 'PENDING';

  if (account.charges_enabled && account.payouts_enabled) {
    status = 'ACTIVE';
  } else if (account.requirements?.past_due && account.requirements.past_due.length > 0) {
    status = 'RESTRICTED';
  }

  // Update provider profile if status changed
  if (providerProfile.stripeAccountStatus !== status) {
    const providerRepo = createProviderProfileRepository();
    await providerRepo.update(providerProfile.id, {
      stripeAccountStatus: status,
    });
    console.log(`Provider ${providerProfile.id} Stripe status updated to ${status}`);
  }
}

/**
 * Handle refunded charge
 * Updates payment record status to REFUNDED
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge refunded: ${charge.id}`);

  // Get the payment intent ID from the charge
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.log('No payment intent ID found on refunded charge');
    return;
  }

  try {
    await paymentRepo.markRefunded(paymentIntentId);
    console.log(`Payment record marked as refunded for ${paymentIntentId}`);
  } catch (err) {
    console.log(`Payment record not found for ${paymentIntentId}`);
  }
}
