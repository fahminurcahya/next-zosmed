'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingLayoutProps {
    children: React.ReactNode
    currentStep: number
    totalSteps: number
    onPrevious?: () => void
    title?: string
}

export default function OnboardingLayout({
    children,
    currentStep,
    totalSteps,
    onPrevious,
    title = "Setup Akun Zosmed"
}: OnboardingLayoutProps) {
    const progress = (currentStep / totalSteps) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Zosmed</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <motion.div
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        {/* Step Info */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Step {currentStep} dari {totalSteps}</span>
                            <span>{Math.round(progress)}% Selesai</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <span>Butuh bantuan?</span>
                            <a href="/support/whatsapp" className="text-blue-600 hover:text-blue-800 transition-colors">
                                WhatsApp
                            </a>
                            <a href="mailto:support@zosmed.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                                Email Support
                            </a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>🔒 Data Anda aman & terenkripsi</span>
                            <span>⚡ Setup dalam 5 menit</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
