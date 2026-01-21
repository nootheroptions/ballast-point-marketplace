'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingHeader } from './OnboardingHeader';
import { IntroStep } from './IntroStep';
import { Step1Form } from './Step1Form';
import { Step2Form } from './Step2Form';
import { saveOnboardingProgress, completeOnboarding } from '@/actions/onboarding';
import { type OnboardingProgressResponse } from '@/lib/validations/onboarding';

interface OnboardingFlowProps {
  initialData: OnboardingProgressResponse | null;
}

export function OnboardingFlow({ initialData }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialData?.currentStep ?? 0);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');

  // Validation state
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);

  const handleClose = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleSaveAndExit = useCallback(async () => {
    setIsLoading(true);
    try {
      await saveOnboardingProgress({
        currentStep,
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
      });
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, name, slug, description, router]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev: number) => Math.max(0, prev - 1));
  }, []);

  const handleContinue = useCallback(async () => {
    if (currentStep === 0) {
      // Moving from intro to step 1
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      // Moving from step 1 to step 2 - save progress
      setIsLoading(true);
      try {
        await saveOnboardingProgress({
          currentStep: 2,
          name,
          slug,
          description: description || undefined,
        });
        setCurrentStep(2);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (currentStep === 2) {
      // Complete onboarding
      setIsLoading(true);
      try {
        const result = await completeOnboarding({
          name,
          slug,
          description,
        });

        if (result.success) {
          router.push('/');
          router.refresh();
        } else {
          // Handle error - could add toast notification here
          console.error(result.error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentStep, name, slug, description, router]);

  const handleStep1Change = useCallback((data: { name: string; slug: string }) => {
    setName(data.name);
    setSlug(data.slug);
  }, []);

  const getContinueLabel = () => {
    if (currentStep === 2) return 'Finish';
    return 'Continue';
  };

  const isContinueDisabled = () => {
    if (currentStep === 1) return !step1Valid;
    if (currentStep === 2) return !step2Valid;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader
        currentStep={currentStep}
        showBack={currentStep > 0}
        onBack={handleBack}
        onClose={currentStep === 0 ? handleClose : undefined}
        onSaveAndExit={currentStep > 0 ? handleSaveAndExit : undefined}
        onContinue={handleContinue}
        continueLabel={getContinueLabel()}
        continueDisabled={isContinueDisabled()}
        isLoading={isLoading}
      />

      <div className="flex-1">
        {currentStep === 0 && <IntroStep />}
        {currentStep === 1 && (
          <Step1Form
            name={name}
            slug={slug}
            onChange={handleStep1Change}
            onValidChange={setStep1Valid}
          />
        )}
        {currentStep === 2 && (
          <Step2Form
            description={description}
            onChange={setDescription}
            onValidChange={setStep2Valid}
          />
        )}
      </div>
    </div>
  );
}
