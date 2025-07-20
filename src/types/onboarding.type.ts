import { z } from 'zod';

export type BusinessCategory =
    | 'fb'
    | 'fashion'
    | 'education'
    | 'health'
    | 'technology'
    | 'retail'
    | 'other';

export type BusinessSize =
    | 'solo'
    | 'small'
    | 'medium'
    | 'large';

export type PlanId =
    | 'free'
    | 'starter'
    | 'pro';

export type OnboardingStep =
    | 'BUSINESS_INFO'
    | 'INSTAGRAM_CONNECTION'
    | 'COMPLETED';

export type SubscriptionStatus =
    | 'active'
    | 'inactive'
    | 'canceled'
    | 'past_due';

export interface BusinessInfoFormData {
    businessName: string;
    businessCategory: BusinessCategory | '';
    businessSize: BusinessSize | '';
    location: string;
    goals: string;
    agreements: boolean;
}


export interface FormErrors {
    [key: string]: string;
}

export interface BusinessCategoryOption {
    value: BusinessCategory;
    label: string;
    description: string;
    icon: string;
    color?: string;
}

export const BUSINESS_CATEGORY_OPTIONS: BusinessCategoryOption[] = [
    {
        value: 'fb',
        label: 'F&B (Food & Beverage)',
        description: 'Restoran, kafe, catering, makanan & minuman',
        icon: '🍽️',
        color: 'from-orange-500 to-red-500'
    },
    {
        value: 'fashion',
        label: 'Fashion & Apparel',
        description: 'Pakaian, aksesoris, sepatu, tas, fashion',
        icon: '👕',
        color: 'from-pink-500 to-purple-500'
    },
    {
        value: 'education',
        label: 'Education & Training',
        description: 'Kursus, pelatihan, sekolah, universitas, edukasi',
        icon: '📚',
        color: 'from-blue-500 to-indigo-500'
    },
    {
        value: 'health',
        label: 'Health & Wellness',
        description: 'Kesehatan, kecantikan, olahraga, spa, wellness',
        icon: '🏥',
        color: 'from-green-500 to-teal-500'
    },
    {
        value: 'technology',
        label: 'Technology & Digital',
        description: 'IT, software, aplikasi, layanan digital, tech',
        icon: '💻',
        color: 'from-cyan-500 to-blue-500'
    },
    {
        value: 'retail',
        label: 'Retail & E-commerce',
        description: 'Toko online, marketplace, penjualan produk',
        icon: '🛍️',
        color: 'from-yellow-500 to-orange-500'
    },
    {
        value: 'other',
        label: 'Lainnya',
        description: 'Bisnis atau industri lainnya',
        icon: '🏢',
        color: 'from-gray-500 to-slate-500'
    },
];

export interface GoalsOption {
    value: string;
    label: string;
    description: string;
    icon: string;
    category?: string;
}

export const GOALS_OPTIONS: GoalsOption[] = [
    {
        value: 'increase_sales',
        label: 'Meningkatkan Penjualan',
        description: 'Mengotomasi respon untuk meningkatkan konversi penjualan',
        icon: '📈',
        category: 'sales'
    },
    {
        value: 'build_community',
        label: 'Membangun Komunitas',
        description: 'Membangun engagement dan hubungan dengan followers',
        icon: '👥',
        category: 'community'
    },
    {
        value: 'brand_awareness',
        label: 'Meningkatkan Brand Awareness',
        description: 'Memperluas jangkauan dan kesadaran merek',
        icon: '🎯',
        category: 'marketing'
    },
    {
        value: 'customer_service',
        label: 'Meningkatkan Customer Service',
        description: 'Memberikan respon cepat dan layanan pelanggan yang baik',
        icon: '💬',
        category: 'service'
    },
    {
        value: 'lead_generation',
        label: 'Generate Leads',
        description: 'Mengumpulkan data calon pelanggan potensial',
        icon: '🎣',
        category: 'sales'
    },
    {
        value: 'engagement',
        label: 'Meningkatkan Engagement',
        description: 'Meningkatkan interaksi dan partisipasi followers',
        icon: '❤️',
        category: 'community'
    },
    {
        value: 'automation',
        label: 'Mengotomasi Proses Bisnis',
        description: 'Menghemat waktu dengan otomasi komunikasi',
        icon: '⚡',
        category: 'efficiency'
    },
];

export interface BusinessSizeOption {
    value: BusinessSize;
    label: string;
    description: string;
    employeeRange: string;
    icon: string;
    color?: string;
}

export const BUSINESS_SIZE_OPTIONS: BusinessSizeOption[] = [
    {
        value: 'solo',
        label: 'Solo/Personal',
        description: 'Bisnis individual, freelancer, atau personal brand',
        employeeRange: '1 orang',
        icon: '👤',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        value: 'small',
        label: 'Small Business',
        description: 'Bisnis kecil dengan tim kecil',
        employeeRange: '2-10 karyawan',
        icon: '👥',
        color: 'from-green-500 to-emerald-500'
    },
    {
        value: 'medium',
        label: 'Medium Business',
        description: 'Bisnis menengah dengan tim yang berkembang',
        employeeRange: '11-50 karyawan',
        icon: '🏢',
        color: 'from-orange-500 to-amber-500'
    },
    {
        value: 'large',
        label: 'Large Enterprise',
        description: 'Perusahaan besar dengan banyak karyawan',
        employeeRange: '50+ karyawan',
        icon: '🏭',
        color: 'from-purple-500 to-violet-500'
    },
];
