'use client';

import { Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/format-price';

interface BookingCardProps {
  priceCents: number;
  leadTimeDays: number;
  turnaroundDays: number;
  deliveryMode: string;
  selectedAddOnsCost?: number;
}

function formatDeliveryMode(mode: string): string {
  switch (mode) {
    case 'REMOTE':
      return 'Remote';
    case 'ON_SITE':
      return 'On-site';
    case 'BOTH':
      return 'Remote or On-site';
    default:
      return mode;
  }
}

export function BookingCard({
  priceCents,
  leadTimeDays,
  turnaroundDays,
  deliveryMode,
  selectedAddOnsCost = 0,
}: BookingCardProps) {
  const totalPrice = priceCents + selectedAddOnsCost;

  return (
    <Card className="sticky top-8 h-fit max-h-[calc(100vh-4rem)]">
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatPrice(totalPrice)}</span>
            {selectedAddOnsCost > 0 && (
              <span className="text-muted-foreground text-sm line-through">
                {formatPrice(priceCents)}
              </span>
            )}
          </div>
          {selectedAddOnsCost > 0 && (
            <p className="text-muted-foreground text-sm">
              Includes {formatPrice(selectedAddOnsCost)} in add-ons
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lead time</span>
            <span className="font-medium">{leadTimeDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery time</span>
            <span className="font-medium">{turnaroundDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery mode</span>
            <span className="font-medium">{formatDeliveryMode(deliveryMode)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <Badge variant="secondary" className="text-xs">
            Fixed price - no surprises
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" size="lg">
          <Calendar className="mr-2 h-4 w-4" />
          Book now
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          You won&apos;t be charged until you confirm
        </p>
      </CardFooter>
    </Card>
  );
}
