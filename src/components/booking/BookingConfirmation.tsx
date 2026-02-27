'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingForm } from './BookingForm';
import { BookingSummary } from './BookingSummary';
import { PaymentForm } from './PaymentForm';
import { PaymentSuccess } from './PaymentSuccess';
import { createPaymentIntent, confirmBookingWithPayment } from '@/actions/payments';
import { env } from '@/lib/config/env';
import type { InviteeInfoData } from '@/lib/validations/booking';

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

type Step = 'info' | 'payment' | 'success';

interface ServiceData {
  id: string;
  name: string;
  priceCents: number;
  slotDuration: number;
  deliveryMode: string;
  providerProfile: {
    id: string;
    name: string;
    slug: string;
    stripeAccountId: string | null;
    stripeAccountStatus: string | null;
  };
}

interface BookingConfirmationProps {
  service: ServiceData;
  startTime: Date;
  endTime: Date;
  timezone: string;
}

export function BookingConfirmation({
  service,
  startTime,
  endTime,
  timezone,
}: BookingConfirmationProps) {
  const [step, setStep] = useState<Step>('info');
  const [inviteeInfo, setInviteeInfo] = useState<InviteeInfoData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if provider can accept payments
  const canAcceptPayments =
    service.providerProfile.stripeAccountId &&
    service.providerProfile.stripeAccountStatus === 'ACTIVE';

  // Handle invitee info submission - create payment intent
  const handleInfoSubmit = useCallback(
    async (data: InviteeInfoData) => {
      setLoading(true);
      setError(null);

      try {
        // Create payment intent
        const result = await createPaymentIntent({
          serviceId: service.id,
          startTime,
          endTime,
          timezone,
        });

        if (!result.success) {
          setError(result.error ?? 'Failed to initialize payment');
          return;
        }

        // Save invitee info and payment details
        setInviteeInfo(data);
        setClientSecret(result.data!.clientSecret);
        setStep('payment');
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [service.id, startTime, endTime, timezone]
  );

  // Handle successful payment - create booking
  const handlePaymentSuccess = useCallback(
    async (completedPaymentIntentId: string) => {
      if (!inviteeInfo) return;

      setLoading(true);
      setError(null);

      try {
        const result = await confirmBookingWithPayment({
          serviceId: service.id,
          startTime,
          endTime,
          timezone,
          paymentIntentId: completedPaymentIntentId,
          name: inviteeInfo.name,
          email: inviteeInfo.email,
          notes: inviteeInfo.notes,
        });

        if (!result.success) {
          setError(result.error ?? 'Failed to confirm booking');
          return;
        }

        setStep('success');
      } catch (err) {
        console.error('Error confirming booking:', err);
        setError('Payment succeeded but booking confirmation failed. Please contact support.');
      } finally {
        setLoading(false);
      }
    },
    [service.id, startTime, endTime, timezone, inviteeInfo]
  );

  // Handle payment error
  const handlePaymentError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Go back to info step
  const handleBack = useCallback(() => {
    setStep('info');
    setClientSecret(null);
    setError(null);
  }, []);

  // Provider cannot accept payments
  if (!canAcceptPayments) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="bg-warning/10 border-warning/20 rounded-lg border p-6 text-center">
          <h2 className="text-lg font-semibold">Payments Not Available</h2>
          <p className="text-muted-foreground mt-2">
            This provider has not set up payments yet. Please contact them directly to book this
            service.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <a href={`/providers/${service.providerProfile.slug}`}>View Provider Profile</a>
          </Button>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success' && inviteeInfo) {
    return (
      <PaymentSuccess
        serviceName={service.name}
        providerName={service.providerProfile.name}
        startTime={startTime}
        endTime={endTime}
        clientEmail={inviteeInfo.email}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Main Content */}
        <div className="order-2 lg:order-1">
          {step === 'info' && (
            <BookingForm onSubmit={handleInfoSubmit} loading={loading} error={error} />
          )}

          {step === 'payment' && clientSecret && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-2"
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Details
              </Button>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: 'hsl(var(--primary))',
                      colorBackground: 'hsl(var(--background))',
                      colorText: 'hsl(var(--foreground))',
                      colorDanger: 'hsl(var(--destructive))',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm
                  amountCents={service.priceCents}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>

              {error && (
                <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Booking Summary */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <BookingSummary
              serviceName={service.name}
              providerName={service.providerProfile.name}
              startTime={startTime}
              endTime={endTime}
              timezone={timezone}
              priceCents={service.priceCents}
              deliveryMode={service.deliveryMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
