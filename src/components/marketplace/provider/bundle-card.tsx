import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PublicBundleWithServices } from '@/lib/types/public';
import { formatPrice } from '@/lib/utils/format-price';
import { Package } from 'lucide-react';

interface BundleCardProps {
  bundle: PublicBundleWithServices;
}

export function BundleCard({ bundle }: BundleCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Placeholder Image */}
      <div className="bg-primary/10 relative h-48 w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="text-primary/40 h-16 w-16" />
        </div>
        {/* Bundle Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary">Bundle</Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{bundle.name}</CardTitle>
          <Badge variant="secondary" className="flex-shrink-0">
            {formatPrice(bundle.calculatedPriceCents)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {/* Bundle Description and Positioning */}
        <div className="mb-4 flex-1 space-y-2">
          {bundle.positioning && (
            <p className="text-primary text-sm font-medium">{bundle.positioning}</p>
          )}
          {bundle.description && (
            <p className="text-muted-foreground line-clamp-3 text-sm">{bundle.description}</p>
          )}
        </div>

        {/* Services in Bundle */}
        <div className="text-muted-foreground mt-auto space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Includes {bundle.services.length} services:</p>
          <ul className="space-y-1">
            {bundle.services.slice(0, 3).map((bs) => (
              <li key={bs.service.id} className="text-xs">
                • {bs.service.name}
              </li>
            ))}
            {bundle.services.length > 3 && (
              <li className="text-xs italic">
                + {bundle.services.length - 3} more service
                {bundle.services.length - 3 !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
