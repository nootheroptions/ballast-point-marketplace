'use client';

import { useState } from 'react';
import { BundleWithServices } from '@/lib/repositories/bundle.repo';
import { BundleActions } from './BundleActions';
import { ServiceItem } from './ServiceItem';
import { Badge } from '@/components/ui/badge';

interface BundleListProps {
  bundles: (BundleWithServices & { calculatedPriceCents: number })[];
  isFiltered?: boolean;
}

export function BundleList({ bundles, isFiltered = false }: BundleListProps) {
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles((prev) => {
      const next = new Set(prev);
      if (next.has(bundleId)) {
        next.delete(bundleId);
      } else {
        next.add(bundleId);
      }
      return next;
    });
  };

  if (bundles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {bundles.map((bundle) => {
        const isExpanded = expandedBundles.has(bundle.id);

        return (
          <div key={bundle.id} className="space-y-3">
            <div
              className="border-l-primary bg-card cursor-pointer rounded-lg border border-l-4 p-6 transition-shadow hover:shadow-md"
              onClick={() => toggleBundle(bundle.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{bundle.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {bundle.services.length} services
                    </Badge>
                  </div>
                  {bundle.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {bundle.description}
                    </p>
                  )}

                  {/* Services in bundle */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {bundle.services.map((bs) => (
                      <Badge key={bs.id} variant="outline" className="text-xs">
                        {bs.service.name}
                      </Badge>
                    ))}
                  </div>

                  {/* View details link */}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBundle(bundle.id);
                    }}
                  >
                    {isExpanded ? 'Hide details' : `View ${bundle.services.length} services →`}
                  </button>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <BundleActions bundle={bundle} />
                </div>
              </div>
            </div>

            {/* Expanded services view */}
            {isExpanded && (
              <div className="ml-8 space-y-3">
                {bundle.services.map((bs) => (
                  <ServiceItem key={bs.id} service={bs.service} nested editOnly />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
