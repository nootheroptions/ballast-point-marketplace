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
    <div className="bg-background sticky top-0 z-10 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
    </div>
  );
}
