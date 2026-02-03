'use client';

import { TemplateKey } from '@prisma/client';
import { getCoveragePackagesForTemplate, buildCoveragePackageKey } from '@/lib/marketplace';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CoveragePackageSelectorProps {
  templateKey: TemplateKey | undefined;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function CoveragePackageSelector({
  templateKey,
  value,
  onChange,
}: CoveragePackageSelectorProps) {
  if (!templateKey) {
    return (
      <div className="space-y-2">
        <Label>Coverage Package</Label>
        <p className="text-muted-foreground text-sm">Select a template first</p>
      </div>
    );
  }

  const packages = getCoveragePackagesForTemplate(templateKey);

  return (
    <div className="space-y-2">
      <Label htmlFor="coverage">
        Coverage Package <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="coverage">
          <SelectValue placeholder="Select coverage package..." />
        </SelectTrigger>
        <SelectContent>
          {packages.map((pkg) => (
            <SelectItem key={pkg.key} value={buildCoveragePackageKey(templateKey, pkg.key)}>
              <div>
                <div className="font-medium">{pkg.label}</div>
                <div className="text-muted-foreground text-xs">{pkg.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        Coverage package defines the scope and eligibility for this service
      </p>
    </div>
  );
}
