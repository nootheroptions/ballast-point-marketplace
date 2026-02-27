'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils/format-price';

interface BookingSummaryProps {
  serviceName: string;
  providerName: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  priceCents: number;
  platformFeeCents?: number;
  deliveryMode?: string;
}

export function BookingSummary({
  serviceName,
  providerName,
  startTime,
  endTime,
  timezone,
  priceCents,
  platformFeeCents,
  deliveryMode,
}: BookingSummaryProps) {
  const formattedDate = format(startTime, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startTime, 'h:mm a');
  const formattedEndTime = format(endTime, 'h:mm a');
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Info */}
        <div>
          <h3 className="font-semibold">{serviceName}</h3>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4" />
            <span>{providerName}</span>
          </div>
        </div>

        <Separator />

        {/* Date & Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {formattedStartTime} - {formattedEndTime} ({duration} min)
            </span>
          </div>
          {deliveryMode && (
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm capitalize">{deliveryMode.toLowerCase()}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service Price</span>
            <span className="font-medium">{formatPrice(priceCents)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(priceCents)}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">Timezone: {timezone}</p>
      </CardContent>
    </Card>
  );
}
