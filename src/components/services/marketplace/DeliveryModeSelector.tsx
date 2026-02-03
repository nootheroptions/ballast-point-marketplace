'use client';

import { DeliveryMode } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DeliveryModeSelectorProps {
  value: DeliveryMode | undefined;
  onChange: (value: DeliveryMode) => void;
}

export function DeliveryModeSelector({ value, onChange }: DeliveryModeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="deliveryMode">
        Delivery Mode <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={(val) => onChange(val as DeliveryMode)}>
        <SelectTrigger id="deliveryMode">
          <SelectValue placeholder="Select delivery mode..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DeliveryMode.REMOTE}>
            <div>
              <div className="font-medium">Remote</div>
              <div className="text-muted-foreground text-xs">Service delivered remotely</div>
            </div>
          </SelectItem>
          <SelectItem value={DeliveryMode.ON_SITE}>
            <div>
              <div className="font-medium">On-site</div>
              <div className="text-muted-foreground text-xs">Requires on-site visit</div>
            </div>
          </SelectItem>
          <SelectItem value={DeliveryMode.BOTH}>
            <div>
              <div className="font-medium">Both</div>
              <div className="text-muted-foreground text-xs">Can be delivered either way</div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
