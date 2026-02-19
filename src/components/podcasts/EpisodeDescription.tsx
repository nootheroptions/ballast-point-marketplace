'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/shadcn';

const MAX_PREVIEW_LENGTH = 420;

interface EpisodeDescriptionProps {
  description: string;
  descriptionHtml: string | null;
}

function buildDescriptionPreview(description: string): { preview: string; hasOverflow: boolean } {
  if (description.length <= MAX_PREVIEW_LENGTH) {
    return {
      preview: description,
      hasOverflow: false,
    };
  }

  return {
    preview: `${description.slice(0, MAX_PREVIEW_LENGTH - 3)}...`,
    hasOverflow: true,
  };
}

export function EpisodeDescription({ description, descriptionHtml }: EpisodeDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const trimmedDescription = description.trim();
  const { preview, hasOverflow } = useMemo(
    () => buildDescriptionPreview(trimmedDescription),
    [trimmedDescription]
  );

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">About this episode</h2>
      <div className="relative">
        {descriptionHtml ? (
          <div
            className={cn(
              'text-muted-foreground [&_a]:text-foreground [&_blockquote]:border-border/60 [&_code]:bg-muted [&_pre]:bg-muted [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:px-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p:last-child]:mb-0 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6',
              hasOverflow && !isExpanded ? 'max-h-56 overflow-hidden' : ''
            )}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : (
          <p className="text-muted-foreground text-base leading-7 whitespace-pre-line">
            {hasOverflow && !isExpanded ? preview : trimmedDescription}
          </p>
        )}
        {descriptionHtml && hasOverflow && !isExpanded && (
          <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
        )}
      </div>
      {hasOverflow && (
        <button
          type="button"
          className="focus-visible:ring-ring/50 flex items-center justify-start gap-1.5 rounded-sm p-0 text-left text-sm font-semibold hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
        >
          {isExpanded ? 'Hide full description' : 'Show full description'}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
