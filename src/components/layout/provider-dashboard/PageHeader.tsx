'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePageHeaderSave } from './PageHeaderContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const saveContext = usePageHeaderSave();

  const showSaveButton = saveContext?.onSave != null;

  return (
    <div className="bg-background sticky top-14 z-10 -mx-6 -mt-6 mb-2 px-6 pt-6 pb-6 lg:top-16 lg:-mx-8 lg:-mt-4 lg:px-8 lg:pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showSaveButton && saveContext && (
            <Button
              onClick={() => saveContext.onSave?.()}
              disabled={saveContext.isSaving || saveContext.isDisabled}
            >
              {saveContext.isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saveContext.isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
