import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';

interface OnboardingHeaderProps {
  currentStep: number;
  showBack?: boolean;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  onContinue?: () => void;
  onClose?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  isLoading?: boolean;
}

export function OnboardingHeader({
  currentStep,
  showBack = false,
  onBack,
  onSaveAndExit,
  onContinue,
  onClose,
  continueLabel = 'Continue',
  continueDisabled = false,
  isLoading = false,
}: OnboardingHeaderProps) {
  return (
    <div className="bg-background sticky top-0 z-10">
      <ProgressBar currentStep={currentStep} />
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              disabled={isLoading}
              className="rounded-full"
            >
              <ArrowLeft className="size-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 0 && onClose && (
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Close
            </Button>
          )}

          {currentStep > 0 && onSaveAndExit && (
            <Button variant="secondary" onClick={onSaveAndExit} disabled={isLoading}>
              Save and exit
            </Button>
          )}

          {onContinue && (
            <Button onClick={onContinue} disabled={continueDisabled || isLoading}>
              {continueLabel}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
