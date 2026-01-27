'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getAllTimezones, getCommonTimezones } from '@/lib/utils/timezone';
import { useMemo } from 'react';

interface TimezoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * If true (default), shows all available IANA timezones.
   * If false, shows only common timezones.
   */
  showAllTimezones?: boolean;
}

export function TimezoneSelector({
  value,
  onChange,
  showAllTimezones = true,
}: TimezoneSelectorProps) {
  const timezones = useMemo(
    () => (showAllTimezones ? getAllTimezones() : getCommonTimezones()),
    [showAllTimezones]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone">Timezone</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="timezone" className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
