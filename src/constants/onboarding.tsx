import type { AutomationTemplateOption, BusinessCategory, BusinessSize } from "@/app/(protected)/types/onboarding.type";

const BUSINESS_CATEGORY_OPTIONS: Array<{ value: BusinessCategory; label: string }> = [
    { value: 'fb', label: 'F&B (Food & Beverage)' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'education', label: 'Education & Training' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'technology', label: 'Technology & Digital' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'other', label: 'Lainnya' },
];

const BUSINESS_SIZE_OPTIONS: Array<{ value: BusinessSize; label: string; description: string }> = [
    { value: 'solo', label: 'Solo/Personal', description: 'Hanya Anda sendiri' },
    { value: 'small', label: 'Small Business', description: '2-10 karyawan' },
    { value: 'medium', label: 'Medium Business', description: '11-50 karyawan' },
    { value: 'large', label: 'Large Enterprise', description: '50+ karyawan' },
];

const GOALS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'increase_sales', label: 'Meningkatkan penjualan' },
    { value: 'build_community', label: 'Membangun komunitas' },
    { value: 'brand_awareness', label: 'Meningkatkan brand awareness' },
    { value: 'customer_service', label: 'Meningkatkan customer service' },
    { value: 'lead_generation', label: 'Generate leads lebih banyak' },
    { value: 'engagement', label: 'Meningkatkan engagement' },
    { value: 'automation', label: 'Mengotomasi proses bisnis' },
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