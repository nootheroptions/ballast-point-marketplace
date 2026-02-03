'use client';

import { TemplateKey } from '@prisma/client';
import { getAllTemplates } from '@/lib/marketplace/templates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TemplateSelectorProps {
  value: TemplateKey | undefined;
  onChange: (value: TemplateKey) => void;
  disabled?: boolean;
}

export function TemplateSelector({ value, onChange, disabled }: TemplateSelectorProps) {
  const templates = getAllTemplates();

  return (
    <div className="space-y-2">
      <Label htmlFor="template">
        Service Template <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as TemplateKey)}
        disabled={disabled}
      >
        <SelectTrigger id="template">
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.key} value={template.key}>
              <div>
                <div className="font-medium">{template.label}</div>
                <div className="text-muted-foreground text-xs">{template.purpose}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        The template defines the structure, deliverables, and scope of your service
      </p>
    </div>
  );
}
