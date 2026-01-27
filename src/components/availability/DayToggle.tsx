'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Copy } from 'lucide-react';
import { TimeRangeInput } from './TimeRangeInput';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface DayToggleProps {
  dayName: string;
  dayOfWeek: number;
  enabled: boolean;
  timeRanges: TimeRange[];
  onToggle: (enabled: boolean) => void;
  onTimeRangeChange: (index: number, field: 'startTime' | 'endTime', value: string) => void;
  onAddTimeRange: () => void;
  onDeleteTimeRange: (index: number) => void;
  onCopyTimeRange: () => void;
}

export function DayToggle({
  dayName,
  enabled,
  timeRanges,
  onToggle,
  onTimeRangeChange,
  onAddTimeRange,
  onDeleteTimeRange,
  onCopyTimeRange,
}: DayToggleProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Day Header with Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`day-${dayName}`} className="text-base font-semibold">
            {dayName}
          </Label>
          <div className="flex items-center gap-2">
            {enabled && timeRanges.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onCopyTimeRange}
                      className="h-9 w-9"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to other days</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to other days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Switch id={`day-${dayName}`} checked={enabled} onCheckedChange={onToggle} />
          </div>
        </div>

        {/* Time Ranges */}
        {enabled && (
          <div className="space-y-3">
            {timeRanges.map((range, index) => (
              <TimeRangeInput
                key={index}
                startTime={range.startTime}
                endTime={range.endTime}
                onStartTimeChange={(value) => onTimeRangeChange(index, 'startTime', value)}
                onEndTimeChange={(value) => onTimeRangeChange(index, 'endTime', value)}
                onDelete={() => onDeleteTimeRange(index)}
              />
            ))}

            {/* Add Time Range Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddTimeRange}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add time range
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!enabled && <p className="text-muted-foreground text-sm">Unavailable</p>}
      </div>
    </Card>
  );
}
