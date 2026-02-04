'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDisabled?: boolean;
}

export function FormHeader({ title, onClose, onSave, isSaving, isDisabled }: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isSaving}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
        <Button onClick={onSave} disabled={isSaving || isDisabled}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
