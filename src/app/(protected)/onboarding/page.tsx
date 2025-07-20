'use client'
import { api } from "@/trpc/react";
import { Building2, CheckCircle, Crown, Instagram } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BusinessInfoForm from "./_components/business-info-form";
import { StepIndicator } from "./_components/step-indicator";
import { AnimatePresence, motion } from 'framer-motion'
import OnboardingLayout from "./onboarding-layout";
import type { BusinessCategory, BusinessInfoFormData, BusinessSize } from "@/types/onboarding.type";
import InstagramConnectionStep from "./_components/instagram-connection-step";
import OnboardingSuccessStep from "./_components/onboarding-success-step";


// Step definitions
const ONBOARDING_STEPS = [
    {
        title: 'Info Bisnis',
        description: 'Ceritakan tentang bisnis Anda',
        icon: <Building2 className="w-5 h-5" />
    },
    {
        title: 'Hubungkan Instagram',
        description: 'Sambungkan akun Instagram',
        icon: <Instagram className="w-5 h-5" />
    },
    {
        title: 'Selesai',
        description: 'Setup berhasil!',
        icon: <CheckCircle className="w-5 h-5" />
    }
]

const OnboardingPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current step from URL or default to 1
    const initialStep = parseInt(searchParams.get('step') || '1', ONBOARDING_STEPS.length)
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isCheckingProgress, setIsCheckingProgress] = useState(true)


    // tRPC queries and mutations
    const { data: businessInfoData, isLoading: isLoadingBusinessInfo } =
        api.onboarding.getBusinessInfo.useQuery()

    // Query untuk mengecek progress onboarding
    const { data: onboardingProgress, isLoading: isLoadingProgress } =
        api.onboarding.getOnboardingProgress.useQuery()

    const saveBusinessInfoMutation = api.onboarding.saveBusinessInfo.useMutation({
        onSuccess: () => {
            handleNextStep()
        },
        onError: (error) => {
            console.error('Error saving business info:', error)
        }
    })

    // Function to determine the correct step based on progress
    const determineCorrectStep = (progress: any) => {
        if (!progress) return 1
        if (progress.isCompleted) return 3
        switch (progress.currentStep) {
            case 'BUSINESS_INFO':
                return 1
            case 'INSTAGRAM_CONNECTION':
                return 2
            case 'COMPLETED':
                return 3
            default:
                return 1
        }
    }
    // Effect untuk redirect berdasarkan progress
    useEffect(() => {
        if (!isLoadingProgress && onboardingProgress) {
            const correctStep = determineCorrectStep(onboardingProgress.data)
            const urlStep = parseInt(searchParams.get('step') || '1')

            // Jika user mencoba mengakses step yang lebih rendah dari progress mereka
            if (urlStep < correctStep || urlStep > ONBOARDING_STEPS.length) {
                router.replace(`/onboarding?step=${correctStep}`)
                setCurrentStep(correctStep)
            } else {
                setCurrentStep(urlStep)
            }

            setIsCheckingProgress(false)
        }
    }, [onboardingProgress, isLoadingProgress, searchParams, router])


    // Handle step navigation
    const handleNextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length) {
            setIsTransitioning(true)
            setTimeout(() => {
                setCurrentStep(prev => prev + 1)
                router.push(`/onboarding?step=${currentStep + 1}`, { scroll: false })
                setIsTransitioning(false)
            }, 200)
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setIsTransitioning(true)
            setTimeout(() => {
                setCurrentStep(prev => prev - 1)
                router.push(`/onboarding?step=${currentStep - 1}`, { scroll: false })
                setIsTransitioning(false)
            }, 200)
        }
    }

    // Handle business info save
    const handleSaveBusinessInfo = async (data: BusinessInfoFormData) => {
        await saveBusinessInfoMutation.mutateAsync({
            ...data,
            businessCategory: data.businessCategory as BusinessCategory,
            businessSize: data.businessSize as BusinessSize,
        });
    }

    if (isCheckingProgress || isLoadingBusinessInfo || isLoadingProgress) {
        return (
            <OnboardingLayout
                currentStep={currentStep}
                totalSteps={ONBOARDING_STEPS.length}
            >
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {isCheckingProgress ? 'Memeriksa progress onboarding...' : 'Memuat data onboarding...'}
                        </p>
                    </div>
                </div>
            </OnboardingLayout>
        )
    }

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <StepIndicator
                            steps={ONBOARDING_STEPS}
                            currentStep={currentStep}
                        />
                        <BusinessInfoForm
                            onSave={handleSaveBusinessInfo}
                            initialData={
                                businessInfoData?.data?.businessInfo
                                    ? {
                                        ...businessInfoData.data.businessInfo,
                                        businessCategory: businessInfoData.data.businessInfo.businessCategory as BusinessCategory | '',
                                        businessSize: businessInfoData.data.businessInfo.businessSize as BusinessSize | '',
                                    }
                                    : undefined
                            }
                            isLoading={saveBusinessInfoMutation.isPending}
                        />
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <StepIndicator
                            steps={ONBOARDING_STEPS}
                            currentStep={currentStep}
                        />
                        <InstagramConnectionStep onNext={handleNextStep} />
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <StepIndicator
                            steps={ONBOARDING_STEPS}
                            currentStep={currentStep}
                        />
                        <OnboardingSuccessStep />
                    </div>
                )

            default:
                return <div>Step tidak ditemukan</div>
        }
    }


    return (
        <OnboardingLayout
            currentStep={currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            onPrevious={handlePreviousStep}
            title={ONBOARDING_STEPS[currentStep - 1]?.title || "Setup Akun"}
        >
            <AnimatePresence mode="wait">
                {!isTransitioning && (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </OnboardingLayout>
    );
}



export default OnboardingPage;