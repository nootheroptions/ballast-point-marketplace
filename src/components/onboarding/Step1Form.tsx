'use client';

import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkSlugAvailability } from '@/actions/onboarding';
import { step1Schema } from '@/lib/validations/onboarding';

interface Step1FormProps {
  name: string;
  slug: string;
  onChange: (data: { name: string; slug: string }) => void;
  onValidChange: (valid: boolean) => void;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function Step1Form({ name, slug, onChange, onValidChange }: Step1FormProps) {
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<{
    slug: string;
    available: boolean;
    checking: boolean;
  } | null>(null);

  // Compute validation errors using useMemo (no setState in render)
  const errors = useMemo(() => {
    const result = step1Schema.safeParse({ name, slug });
    if (!result.success) {
      const fieldErrors: { name?: string; slug?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'name') fieldErrors.name = issue.message;
        if (issue.path[0] === 'slug') fieldErrors.slug = issue.message;
      });
      return fieldErrors;
    }
    return {};
  }, [name, slug]);

  const isFormValid = Object.keys(errors).length === 0;

  // Derive slug availability and checking state from check result
  const slugAvailable =
    slugCheckResult?.slug === slug && !slugCheckResult.checking ? slugCheckResult.available : null;
  const checkingSlug =
    slug.length >= 2 && (slugCheckResult?.slug !== slug || slugCheckResult?.checking === true);

  // Auto-generate slug from name if slug hasn't been manually edited
  useEffect(() => {
    if (!slugTouched && name) {
      onChange({ name, slug: generateSlug(name) });
    }
  }, [name, slugTouched, onChange]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setSlugCheckResult({ slug, available: false, checking: true });
      const result = await checkSlugAvailability({ slug });
      if (result.success && result.data) {
        setSlugCheckResult({
          slug,
          available: result.data.available,
          checking: false,
        });
      } else {
        setSlugCheckResult({ slug, available: false, checking: false });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [slug]);

  // Notify parent of validation changes
  useEffect(() => {
    const isAvailable = slugAvailable !== false;
    onValidChange(isFormValid && isAvailable && !checkingSlug);
  }, [isFormValid, slugAvailable, checkingSlug, onValidChange]);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Business essentials</h1>
      <p className="text-muted-foreground mt-2">
        Add your business name and choose a URL for your profile page.
      </p>

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Business name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onChange({ name: e.target.value, slug })}
            placeholder="e.g. Acme Architecture"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Profile URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">ballastpoint.com/</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                onChange({ name, slug: e.target.value.toLowerCase() });
              }}
              placeholder="your-business"
              className="flex-1"
              aria-invalid={!!errors.slug || slugAvailable === false}
            />
          </div>
          {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
          {!errors.slug && checkingSlug && (
            <p className="text-muted-foreground text-sm">Checking availability...</p>
          )}
          {!errors.slug && !checkingSlug && slugAvailable === false && (
            <p className="text-destructive text-sm">
              This URL is already taken. Please choose another.
            </p>
          )}
          {!errors.slug && !checkingSlug && slugAvailable === true && (
            <p className="text-sm text-green-600">This URL is available!</p>
          )}
          <p className="text-muted-foreground text-xs">
            Only lowercase letters, numbers, and hyphens are allowed.
          </p>
        </div>
      </div>
    </div>
  );
}
