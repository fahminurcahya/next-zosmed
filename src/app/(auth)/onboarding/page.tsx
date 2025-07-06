'use client'
import React, { useState, useEffect, useCallback } from 'react';
import {
    User, Mail, Lock, ArrowRight, CheckCircle, Instagram, Bot, Target,
    Sparkles, Shield, Play, Rocket, Users, MessageCircle, Zap, Clock,
    ChevronRight, X, AlertCircle, Crown, Gift, Star, Phone, Loader2
} from 'lucide-react';
import { z } from 'zod';

// ===== TYPES =====
interface User {
    id: string;
    name: string;
    email: string;
    businessType: BusinessType;
    createdAt: Date;
    updatedAt: Date;
}

interface InstagramAccount {
    id: string;
    username: string;
    followers: string;
    avatar: string;
    userId: string;
    isConnected: boolean;
    connectedAt: Date;
}

interface Subscription {
    id: string;
    userId: string;
    planId: PlanId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
}

interface AutomationTemplate {
    id: string;
    userId: string;
    templateType: TemplateType;
    message: string;
    isActive: boolean;
    createdAt: Date;
}

type BusinessType =
    | 'fashion'
    | 'food'
    | 'beauty'
    | 'services'
    | 'digital'
    | 'education'
    | 'other';

type PlanId = 'starter' | 'professional' | 'enterprise';

type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

type TemplateType = 'general' | 'ecommerce' | 'service';

interface OnboardingFormData {
    name: string;
    email: string;
    password: string;
    businessType: BusinessType | '';
}

interface PlanOption {
    id: PlanId;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    color: string;
    recommended: boolean;
}

interface AutomationTemplateOption {
    id: TemplateType;
    name: string;
    description: string;
    message: string;
}

interface OnboardingState {
    currentStep: number;
    formData: OnboardingFormData;
    selectedPlan: PlanId | null;
    connectedAccounts: InstagramAccount[];
    automationData: {
        template: TemplateType | '';
        message: string;
    };
}

interface FormErrors {
    [key: string]: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface OnboardingCompleteResponse {
    user: User;
    subscription: Subscription;
    instagramAccount: InstagramAccount;
    automation: AutomationTemplate;
}

// ===== VALIDATION SCHEMAS =====
const userValidationSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama terlalu panjang'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter').max(50, 'Password terlalu panjang'),
    businessType: z.enum(['fashion', 'food', 'beauty', 'services', 'digital', 'education', 'other'], {
        errorMap: () => ({ message: 'Jenis bisnis wajib dipilih' }),
    }),
});

const automationValidationSchema = z.object({
    templateType: z.enum(['general', 'ecommerce', 'service'], {
        errorMap: () => ({ message: 'Template wajib dipilih' }),
    }),
    message: z.string().min(1, 'Pesan wajib diisi').max(500, 'Pesan terlalu panjang'),
});

type UserValidationInput = z.infer<typeof userValidationSchema>;
type AutomationValidationInput = z.infer<typeof automationValidationSchema>;

// ===== CONSTANTS =====
const BUSINESS_TYPE_OPTIONS: Array<{ value: BusinessType; label: string }> = [
    { value: 'fashion', label: 'Fashion & Lifestyle' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'beauty', label: 'Beauty & Skincare' },
    { value: 'services', label: 'Jasa & Konsultasi' },
    { value: 'digital', label: 'Digital Products' },
    { value: 'education', label: 'Education & Training' },
    { value: 'other', label: 'Lainnya' },
];

const PLAN_OPTIONS: PlanOption[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 'Gratis',
        period: 'selamanya',
        description: 'Perfect untuk mulai',
        features: [
            '1 akun Instagram',
            '100 auto-reply per bulan',
            'Template dasar',
            'Email support'
        ],
        color: 'from-gray-500 to-gray-600',
        recommended: false
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 'Rp 299.000',
        period: 'per bulan',
        description: 'Untuk bisnis yang berkembang',
        features: [
            '5 akun Instagram',
            'Unlimited auto-reply',
            'AI smart response',
            'Advanced analytics',
            'Priority support'
        ],
        color: 'from-blue-500 to-cyan-500',
        recommended: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: 'hubungi kami',
        description: 'Solusi enterprise',
        features: [
            'Unlimited akun',
            'Custom features',
            'Dedicated support',
            'White-label option'
        ],
        color: 'from-purple-500 to-pink-500',
        recommended: false
    }
];

const AUTOMATION_TEMPLATES: AutomationTemplateOption[] = [
    {
        id: 'general',
        name: 'General Business',
        description: 'Template umum untuk berbagai jenis bisnis',
        message: 'Halo! Terima kasih sudah berkomentar. Saya akan kirim info lebih detail via DM ya! 😊'
    },
    {
        id: 'ecommerce',
        name: 'E-commerce',
        description: 'Khusus untuk toko online dan penjualan produk',
        message: 'Hi! Thanks for your interest! Saya kirim katalog lengkap dan promo spesial via DM ya! 🛍️'
    },
    {
        id: 'service',
        name: 'Jasa & Konsultasi',
        description: 'Untuk bisnis jasa dan konsultasi',
        message: 'Halo! Terima kasih sudah tertarik dengan layanan kami. Let me send you more details via DM! 💼'
    }
];

// ===== CUSTOM HOOKS =====
const useOnboardingState = () => {
    const [state, setState] = useState<OnboardingState>({
        currentStep: 1,
        formData: {
            name: '',
            email: '',
            password: '',
            businessType: ''
        },
        selectedPlan: null,
        connectedAccounts: [],
        automationData: {
            template: '',
            message: ''
        }
    });

    const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...updates }
        }));
    }, []);

    const updateSelectedPlan = useCallback((planId: PlanId) => {
        setState(prev => ({
            ...prev,
            selectedPlan: planId
        }));
    }, []);

    const updateAutomationData = useCallback((updates: Partial<{ template: TemplateType; message: string }>) => {
        setState(prev => ({
            ...prev,
            automationData: { ...prev.automationData, ...updates }
        }));
    }, []);

    const setConnectedAccounts = useCallback((accounts: InstagramAccount[]) => {
        setState(prev => ({
            ...prev,
            connectedAccounts: accounts
        }));
    }, []);

    const nextStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.min(prev.currentStep + 1, 5)
        }));
    }, []);

    const prevStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 1)
        }));
    }, []);

    return {
        state,
        updateFormData,
        updateSelectedPlan,
        updateAutomationData,
        setConnectedAccounts,
        nextStep,
        prevStep
    };
};

// ===== COMPONENTS =====

// Motion Div Component with proper typing
interface MotionDivProps {
    children: React.ReactNode;
    className?: string;
    initial?: { opacity?: number; y?: number; scale?: number };
    animate?: { opacity?: number; y?: number; scale?: number };
    transition?: { duration?: number; delay?: number };
    onClick?: () => void;
}

const MotionDiv: React.FC<MotionDivProps> = ({
    children,
    className = "",
    initial = {},
    animate = {},
    transition = {},
    onClick
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), transition.delay || 0);
        return () => clearTimeout(timer);
    }, [transition.delay]);

    const style: React.CSSProperties = {
        transform: isVisible ? `translateY(${animate.y || 0}px)` : `translateY(${initial.y || 20}px)`,
        opacity: isVisible ? (animate.opacity ?? 1) : (initial.opacity ?? 0),
        transition: `all ${transition.duration || 0.6}s ease-out`
    };

    return (
        <div className={className} style={style} onClick={onClick}>
            {children}
        </div>
    );
};

// Progress Bar Component
interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
            </div>
        </div>
    );
};

// Step 1: Welcome & Signup
interface WelcomeStepProps {
    onNext: () => void;
    formData: OnboardingFormData;
    updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, formData, updateFormData }) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate form data
            const validatedData = userValidationSchema.parse(formData);

            // Here you would typically call your tRPC mutation
            // const result = await createUserMutation.mutateAsync(validatedData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onNext();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: FormErrors = {};
                error.errors.forEach(err => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0].toString()] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                console.error('Failed to create user:', error);
                setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof OnboardingFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const value = e.target.value;
        updateFormData({ [field]: value });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <MotionDiv
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang di Zosmed!</h1>
                <p className="text-gray-600">Mari mulai otomasi Instagram Anda dalam beberapa langkah mudah</p>
            </MotionDiv>

            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Masukkan nama lengkap"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="nama@email.com"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Minimal 8 karakter"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jenis Bisnis <span className="text-red-500">*</span>
                        </label>
                        <select
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.businessType ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.businessType}
                            onChange={handleInputChange('businessType')}
                            disabled={isSubmitting}
                        >
                            <option value="">Pilih jenis bisnis</option>
                            {BUSINESS_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
                    </div>

                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            className="mt-1 mr-2"
                            required
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-600">
                            Saya setuju dengan <a href="/terms" className="text-blue-600 hover:underline">Syarat & Ketentuan</a> dan <a href="/privacy" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Membuat Akun...
                            </>
                        ) : (
                            <>
                                Buat Akun
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </MotionDiv>
        </div>
    );
};

// Step 2: Choose Plan
interface PlanStepProps {
    onNext: () => void;
    selectedPlan: PlanId | null;
    updateSelectedPlan: (planId: PlanId) => void;
}

const PlanStep: React.FC<PlanStepProps> = ({ onNext, selectedPlan, updateSelectedPlan }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedPlan) return;

        setIsLoading(true);

        try {
            // Here you would call your tRPC mutation
            // await createSubscriptionMutation.mutateAsync({ planId: selectedPlan });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onNext();
        } catch (error) {
            console.error('Failed to create subscription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <MotionDiv
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pilih Paket yang Tepat</h2>
                <p className="text-gray-600">Mulai gratis, upgrade kapan saja. Tidak ada komitmen jangka panjang.</p>
            </MotionDiv>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {PLAN_OPTIONS.map((plan, index) => (
                    <MotionDiv
                        key={plan.id}
                        className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${selectedPlan === plan.id
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300'
                            }`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        onClick={() => { updateSelectedPlan(plan.id); }}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Recommended
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                            <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                            <div className="text-gray-600 text-sm">{plan.period}</div>
                        </div>

                        <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {selectedPlan === plan.id && (
                            <div className="absolute top-4 right-4">
                                <CheckCircle className="w-6 h-6 text-blue-500" />
                            </div>
                        )}
                    </MotionDiv>
                ))}
            </div>

            <div className="text-center">
                <button
                    onClick={handleContinue}
                    disabled={!selectedPlan || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            Lanjutkan
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Step 3: Instagram Connection
interface InstagramStepProps {
    onNext: () => void;
    connectedAccounts: InstagramAccount[];
    setConnectedAccounts: (accounts: InstagramAccount[]) => void;
}

const InstagramStep: React.FC<InstagramStepProps> = ({ onNext, connectedAccounts, setConnectedAccounts }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const handleConnectInstagram = async () => {
        setIsConnecting(true);
        setConnectionError(null);

        try {
            // Here you would call your tRPC mutation
            // const result = await connectInstagramMutation.mutateAsync({ accessToken: 'mock-token' });

            // Simulate Instagram OAuth flow
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockAccount: InstagramAccount = {
                id: '1',
                username: 'mybusiness',
                followers: '12.5K',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                userId: 'user-1',
                isConnected: true,
                connectedAt: new Date()
            };

            setConnectedAccounts([mockAccount]);
        } catch (error) {
            console.error('Failed to connect Instagram:', error);
            setConnectionError('Gagal menghubungkan Instagram. Silakan coba lagi.');
        } finally {
            setIsConnecting(false);
        }
    };

    const benefits = [
        { icon: <Shield className="w-5 h-5" />, text: "100% aman dan compliant dengan Instagram", color: "text-green-600" },
        { icon: <Zap className="w-5 h-5" />, text: "Setup dalam 30 detik", color: "text-blue-600" },
        { icon: <Lock className="w-5 h-5" />, text: "Data terenkripsi dan terlindungi", color: "text-purple-600" }
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <MotionDiv
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Instagram className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Hubungkan Instagram Anda</h2>
                <p className="text-gray-600">Sambungkan akun Instagram Business untuk mulai otomasi</p>
            </MotionDiv>

            {connectedAccounts.length === 0 ? (
                <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {connectionError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {connectionError}
                        </div>
                    )}

                    {/* Benefits */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Mengapa aman?</h3>
                        <div className="space-y-3">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`${benefit.color} mr-3`}>
                                        {benefit.icon}
                                    </div>
                                    <span className="text-gray-700">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connect Button */}
                    <div className="text-center mb-6">
                        <button
                            onClick={handleConnectInstagram}
                            disabled={isConnecting}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Menghubungkan...
                                </>
                            ) : (
                                <>
                                    <Instagram className="w-5 h-5 mr-2" />
                                    Hubungkan Instagram
                                </>
                            )}
                        </button>
                    </div>

                    {/* Demo Option */}
                    <div className="text-center">
                        <button
                            onClick={() => setShowDemo(true)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            Atau lihat demo dulu →
                        </button>
                    </div>
                </MotionDiv>
            ) : (
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Connected Account */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                            <div>
                                <h3 className="font-semibold text-green-900">Instagram Terhubung!</h3>
                                <p className="text-green-700">Akun Anda siap untuk otomasi</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center">
                            <img
                                src={connectedAccounts[0]?.avatar}
                                alt="Profile"
                                className="w-12 h-12 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-semibold text-gray-900">@{connectedAccounts[0]?.username}</div>
                                <div className="text-gray-600 text-sm">{connectedAccounts[0]?.followers} followers</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={onNext}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center mx-auto"
                        >
                            Lanjutkan Setup
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </MotionDiv>
            )}

            {/* Demo Modal */}
            {showDemo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Demo Zosmed</h3>
                            <button
                                onClick={() => setShowDemo(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                            <Play className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Lihat bagaimana Zosmed mengotomasi respon Instagram dalam 2 menit
                        </p>
                        <button
                            onClick={() => setShowDemo(false)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Tutup Demo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Step 4: First Automation Setup
interface AutomationStepProps {
    onNext: () => void;
    automationData: {
        template: TemplateType | '';
        message: string;
    };
    updateAutomationData: (updates: Partial<{ template: TemplateType; message: string }>) => void;
}

const AutomationStep: React.FC<AutomationStepProps> = ({ onNext, automationData, updateAutomationData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const handleTemplateSelect = (template: AutomationTemplateOption) => {
        updateAutomationData({
            template: template.id,
            message: template.message
        });

        // Clear template error when user selects a template
        if (errors.template) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.template;
                return newErrors;
            });
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateAutomationData({ message: e.target.value });

        // Clear message error when user starts typing
        if (errors.message) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.message;
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate automation data
            const validationData = {
                templateType: automationData.template,
                message: automationData.message
            };

            const validatedData = automationValidationSchema.parse(validationData);

            // Here you would call your tRPC mutation
            // await createAutomationMutation.mutateAsync(validatedData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onNext();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: FormErrors = {};
                error.errors.forEach(err => {
                    if (err.path[0]) {
                        const field = err.path[0].toString();
                        fieldErrors[field === 'templateType' ? 'template' : field] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                console.error('Failed to create automation:', error);
                setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <MotionDiv
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Setup Otomasi Pertama</h2>
                <p className="text-gray-600">Pilih template auto-reply yang sesuai dengan bisnis Anda</p>
            </MotionDiv>

            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.general}
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    {AUTOMATION_TEMPLATES.map((template, index) => (
                        <div
                            key={template.id}
                            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${automationData.template === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => handleTemplateSelect(template)}
                        >
                            <div className="flex items-start">
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-1 transition-all ${automationData.template === template.id
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                    }`}>
                                    {automationData.template === template.id && (
                                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                                        "{template.message}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {errors.template && <p className="text-red-500 text-sm mb-4">{errors.template}</p>}

                {automationData.template && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customize pesan Anda (opsional)
                        </label>
                        <textarea
                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                            rows={3}
                            value={automationData.message}
                            onChange={handleMessageChange}
                            placeholder="Tulis pesan auto-reply Anda..."
                            disabled={isSubmitting}
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}

                        <div className="mt-2 text-xs text-gray-500">
                            {automationData.message.length}/500 karakter
                        </div>
                    </MotionDiv>
                )}

                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!automationData.template || isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan Otomasi...
                            </>
                        ) : (
                            <>
                                Setup Otomasi
                                <Sparkles className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </div>
            </MotionDiv>
        </div>
    );
};

// Step 5: Success & Next Steps
interface SuccessStepProps {
    formData: OnboardingFormData;
    selectedPlan: PlanId | null;
    connectedAccounts: InstagramAccount[];
}

const SuccessStep: React.FC<SuccessStepProps> = ({ formData, selectedPlan, connectedAccounts }) => {
    const nextSteps = [
        {
            icon: <Instagram className="w-5 h-5" />,
            title: "Post di Instagram",
            description: "Buat post dan lihat otomasi bekerja",
            action: "Buat Post",
            onClick: () => console.log('Navigate to create post')
        },
        {
            icon: <Target className="w-5 h-5" />,
            title: "Lihat Analytics",
            description: "Monitor performa auto-reply Anda",
            action: "Lihat Dashboard",
            onClick: () => console.log('Navigate to analytics')
        },
        {
            icon: <Users className="w-5 h-5" />,
            title: "Invite Tim",
            description: "Tambahkan anggota tim untuk kolaborasi",
            action: "Invite Tim",
            onClick: () => console.log('Navigate to team invitation')
        }
    ];

    const handleGetStarted = () => {
        // Navigate to main dashboard
        console.log('Navigate to main dashboard');
    };

    const handleSupportAction = (action: string) => {
        console.log(`Support action: ${action}`);
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <MotionDiv
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Selamat!</h2>
                <p className="text-xl text-gray-600 mb-4">Akun Zosmed Anda sudah siap!</p>
                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <p className="text-blue-800">
                        <strong>@{connectedAccounts[0]?.username}</strong> sekarang terhubung dengan otomasi {selectedPlan} plan
                    </p>
                </div>
            </MotionDiv>

            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
            >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Langkah Selanjutnya</h3>
                <div className="space-y-4">
                    {nextSteps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4">
                                    {step.icon}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                                    <p className="text-gray-600 text-sm">{step.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={step.onClick}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                                {step.action}
                            </button>
                        </div>
                    ))}
                </div>
            </MotionDiv>

            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4"
            >
                <button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 text-lg"
                >
                    Mulai Menggunakan Zosmed
                </button>

                <div className="flex justify-center space-x-4 text-sm">
                    <button
                        onClick={() => handleSupportAction('guide')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        📖 Panduan Lengkap
                    </button>
                    <button
                        onClick={() => handleSupportAction('support')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        💬 Hubungi Support
                    </button>
                    <button
                        onClick={() => handleSupportAction('video')}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        🎥 Video Tutorial
                    </button>
                </div>
            </MotionDiv>

            {/* Welcome Gift */}
            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6"
            >
                <div className="flex items-center justify-center mb-3">
                    <Gift className="w-6 h-6 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-900">Welcome Gift! 🎁</h4>
                </div>
                <p className="text-yellow-800 text-sm mb-3">
                    Sebagai pengguna baru, Anda mendapat:
                </p>
                <div className="space-y-2 text-yellow-800 text-sm">
                    <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 mr-2" />
                        <span>500 bonus auto-reply credits</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <Crown className="w-4 h-4 mr-2" />
                        <span>1 bulan gratis premium templates</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>Priority support selama 30 hari</span>
                    </div>
                </div>
            </MotionDiv>
        </div>
    );
};

// Main Onboarding Component
const ZosmedOnboarding: React.FC = () => {
    const {
        state,
        updateFormData,
        updateSelectedPlan,
        updateAutomationData,
        setConnectedAccounts,
        nextStep,
        prevStep
    } = useOnboardingState();

    const totalSteps = 5;

    const renderCurrentStep = (): React.ReactNode => {
        switch (state.currentStep) {
            case 1:
                return (
                    <WelcomeStep
                        onNext={nextStep}
                        formData={state.formData}
                        updateFormData={updateFormData}
                    />
                );
            case 2:
                return (
                    <PlanStep
                        onNext={nextStep}
                        selectedPlan={state.selectedPlan}
                        updateSelectedPlan={updateSelectedPlan}
                    />
                );
            case 3:
                return (
                    <InstagramStep
                        onNext={nextStep}
                        connectedAccounts={state.connectedAccounts}
                        setConnectedAccounts={setConnectedAccounts}
                    />
                );
            case 4:
                return (
                    <AutomationStep
                        onNext={nextStep}
                        automationData={state.automationData}
                        updateAutomationData={updateAutomationData}
                    />
                );
            case 5:
                return (
                    <SuccessStep
                        formData={state.formData}
                        selectedPlan={state.selectedPlan}
                        connectedAccounts={state.connectedAccounts}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Zosmed</span>
                        </div>

                        {state.currentStep > 1 && state.currentStep < 5 && (
                            <button
                                onClick={prevStep}
                                className="text-gray-600 hover:text-gray-800 text-sm flex items-center transition-colors"
                            >
                                ← Kembali
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Bar */}
                    {state.currentStep < 5 && (
                        <ProgressBar currentStep={state.currentStep} totalSteps={totalSteps} />
                    )}

                    {/* Current Step */}
                    {renderCurrentStep()}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-6">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <span>Butuh bantuan?</span>
                            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Live Chat</a>
                            <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">WhatsApp Support</a>
                            <a href="mailto:support@zosmed.com" className="text-blue-600 hover:text-blue-800 transition-colors">Email: support@zosmed.com</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span>🔒 Data Anda aman & terenkripsi</span>
                            <span>⚡ Setup dalam 5 menit</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ZosmedOnboarding;