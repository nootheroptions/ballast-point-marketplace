'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AU_JURISDICTIONS, getAuJurisdictionInfo } from '@/lib/locations';
import { getProviderLicensing, updateProviderLicenses } from '@/actions/provider-licences';

interface LicensingFormProps {
  onLicensesChange?: (licensedJurisdictions: string[]) => void;
}

export function LicensingForm({ onLicensesChange }: LicensingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Set<string>>(new Set());
  const [initialJurisdictions, setInitialJurisdictions] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadLicensing() {
      try {
        const result = await getProviderLicensing();
        if (!result?.success) {
          setErrorMessage(result.error || 'Failed to load licensing data');
          return;
        }

        if (result?.data) {
          const jurisdictions = new Set(
            result.data.licenses.filter((l) => l.country === 'AU').map((l) => l.jurisdiction)
          );
          setSelectedJurisdictions(jurisdictions);
          setInitialJurisdictions(new Set(jurisdictions));
          onLicensesChange?.([...jurisdictions]);
        }
      } catch (error) {
        setErrorMessage('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLicensing();
  }, [onLicensesChange]);

  const isDirty =
    selectedJurisdictions.size !== initialJurisdictions.size ||
    [...selectedJurisdictions].some((j) => !initialJurisdictions.has(j));

  function handleJurisdictionChange(jurisdiction: string, checked: boolean) {
    setSelectedJurisdictions((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(jurisdiction);
      } else {
        next.delete(jurisdiction);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedJurisdictions.size === 0) {
      setErrorMessage('Please select at least one jurisdiction');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateProviderLicenses({
        country: 'AU',
        jurisdictions: [...selectedJurisdictions],
      });

      if (!result?.success) {
        setErrorMessage(result.error || 'Failed to update licenses');
        return;
      }

      setSuccessMessage('Licenses updated successfully');
      setInitialJurisdictions(new Set(selectedJurisdictions));
      onLicensesChange?.([...selectedJurisdictions]);
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
        <div className="grid grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted h-10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Licensing</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Where are you licensed or eligible to provide architectural services?
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Note: We currently only service Australia
        </p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AU_JURISDICTIONS.map((jurisdiction) => {
          const info = getAuJurisdictionInfo(jurisdiction.code);
          return (
            <div
              key={jurisdiction.code}
              className="border-input hover:bg-accent flex items-center space-x-3 rounded-lg border p-4 transition-colors"
            >
              <Checkbox
                id={`jurisdiction-${jurisdiction.code}`}
                checked={selectedJurisdictions.has(jurisdiction.code)}
                onCheckedChange={(checked) =>
                  handleJurisdictionChange(jurisdiction.code, checked === true)
                }
              />
              <Label
                htmlFor={`jurisdiction-${jurisdiction.code}`}
                className="flex-1 cursor-pointer font-normal"
              >
                {info?.label || jurisdiction.label}
                <span className="text-muted-foreground ml-2 text-sm">
                  ({jurisdiction.shortLabel})
                </span>
              </Label>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-sm">
        You can only offer services in states where you are licensed or eligible to practice.
      </p>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
