'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeRangeInputProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onDelete: () => void;
}

export function TimeRangeInput({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onDelete,
}: TimeRangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          className="flex-1"
          aria-label="Start time"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          className="flex-1"
          aria-label="End time"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete time range</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete time range</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
