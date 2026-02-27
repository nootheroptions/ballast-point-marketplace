'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/format-price';

interface PaymentFormProps {
  amountCents: number;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (error: string) => void;
}

export function PaymentForm({ amountCents, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL not used since we handle redirect manually
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed
        const message = error.message ?? 'Payment failed. Please try again.';
        setErrorMessage(message);
        onError(message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        await onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Additional authentication required (3D Secure, etc.)
        // Stripe handles this automatically with redirect: 'if_required'
        setErrorMessage('Additional authentication required. Please complete the verification.');
      } else {
        // Unexpected status
        setErrorMessage('Payment could not be completed. Please try again.');
        onError('Payment could not be completed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const message = 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>

        {/* Stripe Payment Element - handles all payment methods */}
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || !elements || loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${formatPrice(amountCents)}`
        )}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
