'use client';

import { TemplateFieldDefinition } from '@/lib/marketplace/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TemplateFieldRendererProps {
  field: TemplateFieldDefinition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  error?: string;
}

/**
 * Generic component that renders a form field based on a template field definition
 * This eliminates the need for template-specific field components
 */
export function TemplateFieldRenderer({
  field,
  value,
  onChange,
  error,
}: TemplateFieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select value={value?.toString() ?? ''} onValueChange={onChange}>
            <SelectTrigger id={field.key}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const checked = Array.isArray(value) && value.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.key}-${option.value}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const current = Array.isArray(value) ? value : [];
                      const updated = isChecked
                        ? [...current, option.value]
                        : current.filter((v) => v !== option.value);
                      onChange(updated);
                    }}
                  />
                  <Label htmlFor={`${field.key}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case 'number':
        return (
          <Input
            id={field.key}
            type="number"
            min="0"
            value={value ?? field.defaultValue ?? ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.helpText && <p className="text-muted-foreground text-sm">{field.helpText}</p>}
            </div>
            <Switch
              id={field.key}
              checked={value ?? field.defaultValue ?? false}
              onCheckedChange={onChange}
            />
          </div>
        );

      case 'text':
        return (
          <Input
            id={field.key}
            type="text"
            value={value ?? field.defaultValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  // Boolean fields render their own label
  if (field.type === 'boolean') {
    return (
      <div className="space-y-2">
        {renderField()}
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {renderField()}
      {field.helpText && <p className="text-muted-foreground text-sm">{field.helpText}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
