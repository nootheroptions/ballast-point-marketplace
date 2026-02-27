'use client';

import { format } from 'date-fns';
import { CheckCircle, Calendar, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface PaymentSuccessProps {
  serviceName: string;
  providerName: string;
  startTime: Date;
  endTime: Date;
  clientEmail: string;
}

export function PaymentSuccess({
  serviceName,
  providerName,
  startTime,
  endTime,
  clientEmail,
}: PaymentSuccessProps) {
  const formattedDate = format(startTime, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startTime, 'h:mm a');
  const formattedEndTime = format(endTime, 'h:mm a');

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="bg-success/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CheckCircle className="text-success h-12 w-12" />
      </div>

      <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
      <p className="text-muted-foreground mt-2">
        Your booking has been confirmed and payment received.
      </p>

      <Card className="mt-6 text-left">
        <CardContent className="space-y-4 pt-6">
          <div>
            <h3 className="font-semibold">{serviceName}</h3>
            <p className="text-muted-foreground text-sm">with {providerName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span>
                {formattedStartTime} - {formattedEndTime}
              </span>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span>Confirmation sent to {clientEmail}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <p className="text-muted-foreground mt-6 text-sm">
        Need to make changes? Contact the provider directly.
      </p>
    </div>
  );
}
