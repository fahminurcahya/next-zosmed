'use client'
import { validateBusinessInfo } from "@/lib/onboarding"
import { BUSINESS_CATEGORY_OPTIONS, BUSINESS_SIZE_OPTIONS, GOALS_OPTIONS, type BusinessCategory, type BusinessInfoFormData, type BusinessSize, type FormErrors } from "@/types/onboarding.type"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import {
    Building2,
    MapPin,
    Target,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Rocket
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



interface BusinessInfoFormProps {
    onSave?: (data: BusinessInfoFormData) => Promise<void>
    initialData?: Partial<BusinessInfoFormData>
    isLoading?: boolean
}

const BusinessInfoForm = ({
    onSave,
    initialData,
    isLoading = false
}: BusinessInfoFormProps) => {
    const router = useRouter()

    const [formData, setFormData] = useState<BusinessInfoFormData>({
        businessName: initialData?.businessName || '',
        businessCategory: initialData?.businessCategory || '',
        businessSize: initialData?.businessSize || '',
        location: initialData?.location || '',
        goals: initialData?.goals || '',
        agreements: initialData?.agreements || false
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const validateField = (field: keyof BusinessInfoFormData, value: string) => {
        const tempData = { ...formData, [field]: value }
        const validation = validateBusinessInfo(tempData)

        if (validation.errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validation.errors[field] as string }))
        } else {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // Handle input changes
    const handleInputChange = (field: keyof BusinessInfoFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.value
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        try {
            // Validate form
            const validation = validateBusinessInfo(formData)

            if (!validation.isValid) {
                setErrors(validation.errors)
                setIsSubmitting(false)
                return
            }

            // Save data if onSave provided
            if (onSave) {
                await onSave(formData)
            }

            // Show success state
            setShowSuccess(true)

        } catch (error) {
            console.error('Error saving business info:', error)
            setErrors({
                general: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }))
        }
    }, [initialData])


    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Ceritakan Tentang Bisnis Anda
                </h1>
                <p className="text-gray-600">
                    Informasi ini akan membantu kami memberikan pengalaman yang lebih personal
                </p>
            </motion.div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Informasi Bisnis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* General Error */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>{errors.general}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>Informasi bisnis berhasil disimpan!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Business Name & Category */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">
                                        Nama Bisnis/Brand
                                    </Label>
                                    <Input
                                        id="businessName"
                                        type="text"
                                        placeholder="Contoh: Toko Hijab"
                                        value={formData.businessName}
                                        onChange={handleInputChange('businessName')}
                                        onBlur={() => validateField('businessName', formData.businessName)}
                                        disabled={isSubmitting || isLoading}
                                    />
                                    {errors.businessName && (
                                        <p className="text-sm text-red-500">{errors.businessName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessCategory">
                                        Kategori Bisnis
                                    </Label>
                                    <Select
                                        value={formData.businessCategory}
                                        onValueChange={(value) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                businessCategory: value as BusinessCategory | ''
                                            }))
                                        }
                                        disabled={isSubmitting || isLoading}
                                    >
                                        <SelectTrigger id="businessCategory" className="w-full">
                                            <SelectValue placeholder="Pilih kategori bisnis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUSINESS_CATEGORY_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.icon} {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.businessCategory && (
                                        <p className="text-sm text-red-500">{errors.businessCategory}</p>
                                    )}
                                </div>
                            </div>

                            {/* Business Size & Location */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessSize" >
                                        Ukuran Bisnis
                                    </Label>
                                    <Select
                                        value={formData.businessSize}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, businessSize: value as BusinessSize | '' }))}
                                        disabled={isSubmitting || isLoading}
                                    >
                                        <SelectTrigger id="businessSize" className="w-full">
                                            <SelectValue placeholder="Pilih ukuran bisnis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUSINESS_SIZE_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.icon} {option.label} ({option.employeeRange})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.businessSize && (
                                        <p className="text-sm text-red-500">{errors.businessSize}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Lokasi
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Contoh: Jakarta, DKI Jakarta"
                                        value={formData.location}
                                        onChange={handleInputChange('location')}
                                        onBlur={() => validateField('location', formData.location)}
                                        disabled={isSubmitting || isLoading}
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-500">{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* Goals */}
                            <div className="space-y-2">
                                <Label htmlFor="goals">
                                    <Target className="w-4 h-4 inline mr-1" />
                                    Tujuan Utama Menggunakan Zosmed
                                </Label>
                                <Select
                                    value={formData.goals}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, goals: value }))}
                                    disabled={isSubmitting || isLoading}
                                >
                                    <SelectTrigger id="goals" className="w-full">
                                        <SelectValue placeholder="Pilih tujuan utama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GOALS_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.goals && (
                                    <p className="text-sm text-red-500">{errors.goals}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                    Pilih tujuan utama untuk membantu kami menyesuaikan fitur yang sesuai
                                </p>
                            </div>

                            {/* Terms Agreement */}
                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1"
                                    disabled={isSubmitting || isLoading}
                                    checked={formData.agreements}
                                    onChange={e =>
                                        setFormData(prev => ({
                                            ...prev,
                                            agreements: e.target.checked
                                        }))
                                    }
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    Saya setuju dengan{' '}
                                    <a href="/legal/tos" className="text-blue-600 hover:underline" target="_blank">
                                        Syarat & Ketentuan
                                    </a>{' '}
                                    dan{' '}
                                    <a href="/legal/privacy" className="text-blue-600 hover:underline" target="_blank">
                                        Kebijakan Privasi
                                    </a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        Lanjutkan ke Pemilihan Paket
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default BusinessInfoForm;