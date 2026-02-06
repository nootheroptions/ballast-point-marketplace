'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  AU_JURISDICTIONS,
  NSW_REGIONS,
  AU_LOCALITIES,
  type AustralianJurisdiction,
} from '@/lib/locations';
import { getProviderLicensing } from '@/actions/provider-licences';
import {
  getProviderServiceAreas,
  updateProviderServiceAreas,
} from '@/actions/provider-service-areas';

function getLocalityKey(jurisdiction: string, localityName: string): string {
  return `${jurisdiction}-${localityName}`;
}

function parseLocalityKey(key: string): { jurisdiction: string; localityName: string } {
  const parts = key.split('-');
  const jurisdiction = parts[0];
  const localityName = parts.slice(1).join('-');
  return { jurisdiction, localityName };
}

interface ServiceAreasFormProps {
  onTabChange?: (tab: 'basic-info' | 'licensing' | 'service-areas') => void;
}

export function ServiceAreasForm({ onTabChange }: ServiceAreasFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [licensedJurisdictions, setLicensedJurisdictions] = useState<Set<string>>(new Set());
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<Set<string>>(new Set());
  const [initialServiceAreas, setInitialServiceAreas] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      // Load all required data in parallel
      const [licensingResult, serviceAreasResult] = await Promise.all([
        getProviderLicensing(),
        getProviderServiceAreas(),
      ]);

      // Check for errors in licensing result
      if (!licensingResult.success || !licensingResult.data) {
        setErrorMessage(licensingResult.error || 'Failed to load licensing data');
        return;
      }

      // Check for errors in service areas result
      if (!serviceAreasResult.success || !serviceAreasResult.data) {
        setErrorMessage(serviceAreasResult.error || 'Failed to load service areas data');
        return;
      }

      // Process licensing data
      const licenses = new Set(
        licensingResult.data.licenses.filter((l) => l.country === 'AU').map((l) => l.jurisdiction)
      );
      setLicensedJurisdictions(licenses);

      // Process service areas data (localities)
      const serviceAreas = new Set(
        serviceAreasResult.data.serviceAreas
          .filter((a) => a.country === 'AU')
          .map((a) => {
            // Type assertion needed until database migration is applied
            const area = a as unknown as { jurisdiction: string; localityName: string };
            return getLocalityKey(a.jurisdiction, area.localityName);
          })
      );
      setSelectedServiceAreas(serviceAreas);
      setInitialServiceAreas(new Set(serviceAreas));
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isServiceAreasDirty =
    selectedServiceAreas.size !== initialServiceAreas.size ||
    [...selectedServiceAreas].some((c) => !initialServiceAreas.has(c));

  const isDirty = isServiceAreasDirty;

  function handleLocalityChange(jurisdiction: string, localityName: string, checked: boolean) {
    const key = getLocalityKey(jurisdiction, localityName);
    setSelectedServiceAreas((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function handleRegionSelectAll(
    jurisdiction: string,
    regionName: string,
    localities: string[],
    checked: boolean
  ) {
    // Update selected service areas
    setSelectedServiceAreas((prev) => {
      const next = new Set(prev);
      localities.forEach((localityName) => {
        const key = getLocalityKey(jurisdiction, localityName);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      return next;
    });

    // Auto-expand region when checked
    if (checked) {
      const regionKey = `${jurisdiction}-${regionName}`;
      setExpandedRegions((prev) => {
        const next = new Set(prev);
        next.add(regionKey);
        return next;
      });
    }
  }

  function toggleRegion(jurisdiction: string, regionName: string) {
    const regionKey = `${jurisdiction}-${regionName}`;
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(regionKey)) {
        next.delete(regionKey);
      } else {
        next.add(regionKey);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedServiceAreas.size === 0) {
      setErrorMessage('Please select at least one service area');
      setIsSubmitting(false);
      return;
    }

    try {
      // Update service areas
      const serviceAreas = [...selectedServiceAreas].map((key) => {
        const { jurisdiction, localityName } = parseLocalityKey(key);
        return {
          country: 'AU' as const,
          jurisdiction,
          localityName,
          localityType: 'council', // For AU, it's always "council"
        };
      });
      const areasResult = await updateProviderServiceAreas({ serviceAreas });

      if (!areasResult.success) {
        setErrorMessage(areasResult.error || 'Failed to update service areas');
        return;
      }

      setSuccessMessage('Service areas updated successfully');
      setInitialServiceAreas(new Set(selectedServiceAreas));
      router.refresh();
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-muted h-6 w-48 rounded" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-24 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (licensedJurisdictions.size === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Service Areas</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Where do you actively offer services?
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            You need to add at least one licensed jurisdiction before configuring service areas.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Go to the Licensing tab to add your licensed jurisdictions.
          </p>
          {onTabChange && (
            <Button onClick={() => onTabChange('licensing')} className="mt-4" variant="default">
              Go to Licensing
            </Button>
          )}
        </div>
      </div>
    );
  }

  const licensedList = AU_JURISDICTIONS.filter((j) => licensedJurisdictions.has(j.code));
  const unlicensedList = AU_JURISDICTIONS.filter((j) => !licensedJurisdictions.has(j.code));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Service Areas</h2>
        <p className="text-muted-foreground mt-1 text-sm">Where do you actively offer services?</p>
      </div>

      {errorMessage && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Licensed Jurisdictions - Service Areas */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium">Your Licensed Jurisdictions</h3>
        {licensedList.map((jurisdiction) => {
          // For now, only NSW has regional structure
          if (jurisdiction.code === 'NSW') {
            return (
              <div key={jurisdiction.code} className="rounded-lg border p-4">
                <h4 className="mb-4 font-medium">{jurisdiction.label}</h4>
                <div className="space-y-2">
                  {Object.entries(NSW_REGIONS).map(([regionName, localities]) => {
                    const regionKey = `${jurisdiction.code}-${regionName}`;
                    const isExpanded = expandedRegions.has(regionKey);
                    const allSelected = localities.every((locality) =>
                      selectedServiceAreas.has(getLocalityKey(jurisdiction.code, locality))
                    );
                    const someSelected = localities.some((locality) =>
                      selectedServiceAreas.has(getLocalityKey(jurisdiction.code, locality))
                    );

                    return (
                      <div key={regionName} className="rounded-lg border">
                        {/* Region Header */}
                        <div className="flex items-center gap-2 p-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleRegion(jurisdiction.code, regionName)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <Checkbox
                            id={`region-${jurisdiction.code}-${regionName}`}
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {
                                // Set indeterminate state on the underlying checkbox input
                                const input = el.querySelector('input');
                                if (input) {
                                  input.indeterminate = someSelected && !allSelected;
                                }
                              }
                            }}
                            onCheckedChange={(checked) =>
                              handleRegionSelectAll(
                                jurisdiction.code,
                                regionName,
                                localities,
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`region-${jurisdiction.code}-${regionName}`}
                            className="flex-1 cursor-pointer text-sm font-medium"
                          >
                            {regionName}
                          </Label>
                          <span className="text-muted-foreground text-xs">
                            {
                              localities.filter((l) =>
                                selectedServiceAreas.has(getLocalityKey(jurisdiction.code, l))
                              ).length
                            }
                            /{localities.length}
                          </span>
                        </div>

                        {/* Localities List (Collapsible) */}
                        {isExpanded && (
                          <div className="bg-muted/30 border-t p-3">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {localities.map((localityName) => (
                                <div
                                  key={localityName}
                                  className="hover:bg-accent flex items-center space-x-3 rounded-lg p-2 transition-colors"
                                >
                                  <Checkbox
                                    id={`locality-${jurisdiction.code}-${localityName}`}
                                    checked={selectedServiceAreas.has(
                                      getLocalityKey(jurisdiction.code, localityName)
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleLocalityChange(
                                        jurisdiction.code,
                                        localityName,
                                        checked === true
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`locality-${jurisdiction.code}-${localityName}`}
                                    className="flex-1 cursor-pointer text-sm font-normal"
                                  >
                                    {localityName}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // For other jurisdictions, show flat list (until we add their regional structure)
          const localities = AU_LOCALITIES[jurisdiction.code as AustralianJurisdiction] || [];
          return (
            <div key={jurisdiction.code} className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">{jurisdiction.label}</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {localities.map((localityName) => (
                  <div
                    key={localityName}
                    className="border-input hover:bg-accent flex items-center space-x-3 rounded-lg border p-2 transition-colors"
                  >
                    <Checkbox
                      id={`locality-sa-${jurisdiction.code}-${localityName}`}
                      checked={selectedServiceAreas.has(
                        getLocalityKey(jurisdiction.code, localityName)
                      )}
                      onCheckedChange={(checked) =>
                        handleLocalityChange(jurisdiction.code, localityName, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`locality-sa-${jurisdiction.code}-${localityName}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {localityName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlicensed Jurisdictions - Disabled */}
      {unlicensedList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-muted-foreground text-sm font-medium">
            Unlicensed Jurisdictions (add licensing to enable)
          </h3>
          <TooltipProvider>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {unlicensedList.map((jurisdiction) => (
                <Tooltip key={jurisdiction.code}>
                  <TooltipTrigger asChild>
                    <div className="border-input bg-muted/30 flex cursor-not-allowed items-center space-x-3 rounded-lg border p-3 opacity-50">
                      <Checkbox disabled checked={false} />
                      <span className="text-muted-foreground text-sm">{jurisdiction.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add this jurisdiction to your licensing to enable service areas</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
