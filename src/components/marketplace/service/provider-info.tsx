import Image from 'next/image';
import Link from 'next/link';
import { Building2, MapPin, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PublicProvider } from '@/lib/types/public';

interface ProviderInfoProps {
  provider: PublicProvider;
}

export function ProviderInfo({ provider }: ProviderInfoProps) {
  const primaryImageUrl = provider.imageUrls[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>About the Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          {primaryImageUrl ? (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={primaryImageUrl}
                alt={`${provider.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-muted flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border">
              <Building2 className="text-muted-foreground h-8 w-8" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold">{provider.name}</h3>
            {provider.description && (
              <p className="text-muted-foreground mt-1 text-sm">{provider.description}</p>
            )}
          </div>
        </div>

        {/* Placeholder for future provider details */}
        <div className="space-y-3 border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Serving Australia-wide</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Award className="h-4 w-4" />
            <span>Verified provider</span>
          </div>
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/providers/${provider.slug}`}>View full profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
