import { cn } from '@/lib/utils/shadcn';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressBar({ currentStep, totalSteps = 3 }: ProgressBarProps) {
  return (
    <div className="flex w-full gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            index <= currentStep ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}
