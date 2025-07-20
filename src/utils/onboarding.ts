import { type User } from "@prisma/client";

export type OnboardingStep = 'BUSINESS_INFO' | 'INSTAGRAM_CONNECTION' | 'COMPLETED';

export interface OnboardingStatus {
    isCompleted: boolean;
    currentStep: OnboardingStep;
    nextStep?: OnboardingStep;
    completionPercentage: number;
    requiredSteps: OnboardingStep[];
}

export function getOnboardingStatus(user: Partial<User>): OnboardingStatus {
    const requiredSteps: OnboardingStep[] = [
        'BUSINESS_INFO',
        'INSTAGRAM_CONNECTION',
        'COMPLETED'
    ];

    const currentStep = (user.onboardingStep as OnboardingStep) || 'BUSINESS_INFO';
    const isCompleted = currentStep === 'COMPLETED';

    const currentStepIndex = requiredSteps.indexOf(currentStep);
    const nextStep = currentStepIndex < requiredSteps.length - 1
        ? requiredSteps[currentStepIndex + 1]
        : undefined;

    const completionPercentage = isCompleted
        ? 100
        : ((currentStepIndex + 1) / (requiredSteps.length - 1)) * 100;

    return {
        isCompleted,
        currentStep,
        nextStep,
        completionPercentage: Math.round(completionPercentage),
        requiredSteps,
    };
}

export function shouldRedirectToOnboarding(user: Partial<User>, currentPath: string): boolean {
    // Don't redirect if already on onboarding pages
    if (currentPath.startsWith('/onboarding') || currentPath.startsWith('/auth')) {
        return false;
    }

    // Don't redirect API routes or static files
    if (currentPath.startsWith('/api') || currentPath.startsWith('/_next')) {
        return false;
    }

    const status = getOnboardingStatus(user);
    return !status.isCompleted;
}

export function getOnboardingRedirectUrl(user: Partial<User>): string {
    const status = getOnboardingStatus(user);

    switch (status.currentStep) {
        case 'BUSINESS_INFO':
            return '/onboarding?step=1';
        case 'INSTAGRAM_CONNECTION':
            return '/onboarding?step=2';
        case 'COMPLETED':
            return '/dashboard';
        default:
            return '/onboarding';
    }
}