interface StepIndicatorProps {
    steps: Array<{
        title: string
        description: string
        icon: React.ReactNode
    }>
    currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1
                const isActive = stepNumber === currentStep
                const isCompleted = stepNumber < currentStep
                const isUpcoming = stepNumber > currentStep

                return (
                    <div key={stepNumber} className="flex items-center">
                        {/* Step Circle */}
                        <div className="flex items-center">
                            <div
                                className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted
                                        ? 'bg-green-500 text-white'
                                        : isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }
                  `}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    stepNumber
                                )}
                            </div>

                            {/* Step Info */}
                            <div className="ml-3 hidden md:block">
                                <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {step.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`
                    hidden md:block w-16 h-0.5 ml-4
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}