import { PaymentChannelType, PaymentCategory } from "@prisma/client";

export interface PaymentChannelData {
    id: string;
    channelCode: string;
    channelName: string;
    type: PaymentChannelType;
    category: PaymentCategory;
    isActive: boolean;
    isOneTimeEnabled: boolean;
    isRecurringEnabled: boolean;
    logo?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    sortOrder: number;
    minAmount?: number | null;
    maxAmount?: number | null;
    processingFee?: number | null;
    percentageFee?: number | null;
    allowedForPlans: string[];
    description?: string | null;
    customerMessage?: string | null;
    xenditChannelCode?: string | null;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentChannelFormData {
    channelCode: string;
    channelName: string;
    type: PaymentChannelType;
    category: PaymentCategory;
    isActive: boolean;
    isOneTimeEnabled: boolean;
    isRecurringEnabled: boolean;
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    sortOrder: number;
    minAmount?: number;
    maxAmount?: number;
    processingFee?: number;
    percentageFee?: number;
    allowedForPlans: string[];
    description?: string;
    customerMessage?: string;
    xenditChannelCode?: string;
    metadata?: Record<string, any>;
}

export interface PaymentChannelUserView {
    id: string;
    channelCode: string;
    channelName: string;
    type: PaymentChannelType;
    category: PaymentCategory;
    logo?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    sortOrder: number;
    processingFee?: number | null;
    percentageFee?: number | null;
    customerMessage?: string | null;
    xenditChannelCode?: string | null;
}

export interface PaymentChannelFilters {
    includeInactive?: boolean;
    type?: PaymentChannelType;
    category?: PaymentCategory;
    forOneTime?: boolean;
    forRecurring?: boolean;
    forPlan?: "FREE" | "STARTER" | "PRO";
}

export interface PaymentChannelSortOrder {
    id: string;
    sortOrder: number;
}

// Constants for UI
export const PAYMENT_CHANNEL_TYPES = {
    VIRTUAL_ACCOUNT: {
        label: "Virtual Account",
        color: "bg-blue-100 text-blue-800",
        icon: "🏦",
    },
    EWALLET: {
        label: "E-Wallet",
        color: "bg-purple-100 text-purple-800",
        icon: "📱",
    },
    QR_CODE: {
        label: "QR Code",
        color: "bg-green-100 text-green-800",
        icon: "📱",
    },
    CREDIT_CARD: {
        label: "Credit Card",
        color: "bg-yellow-100 text-yellow-800",
        icon: "💳",
    },
    BANK_TRANSFER: {
        label: "Bank Transfer",
        color: "bg-gray-100 text-gray-800",
        icon: "🏛️",
    },
    DIRECT_DEBIT: {
        label: "Direct Debit",
        color: "bg-red-100 text-red-800",
        icon: "🔄",
    },
} as const;

export const PAYMENT_CATEGORIES = {
    BANK_TRANSFER: {
        label: "Bank Transfer",
        color: "bg-blue-100 text-blue-800",
    },
    DIGITAL_WALLET: {
        label: "Digital Wallet",
        color: "bg-purple-100 text-purple-800",
    },
    CARD_PAYMENT: {
        label: "Card Payment",
        color: "bg-yellow-100 text-yellow-800",
    },
    QR_PAYMENT: {
        label: "QR Payment",
        color: "bg-green-100 text-green-800",
    },
} as const;

export const SUBSCRIPTION_PLANS = [
    { value: "FREE", label: "Free Plan" },
    { value: "STARTER", label: "Starter Plan" },
    { value: "PRO", label: "Pro Plan" },
] as const;

// Helper functions
export const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

export const getChannelTypeInfo = (type: PaymentChannelType) => {
    return PAYMENT_CHANNEL_TYPES[type] || {
        label: type,
        color: "bg-gray-100 text-gray-800",
        icon: "❓",
    };
};

export const getCategoryInfo = (category: PaymentCategory) => {
    return PAYMENT_CATEGORIES[category] || {
        label: category,
        color: "bg-gray-100 text-gray-800",
    };
};

export const calculateTotalFee = (
    amount: number,
    processingFee?: number | null,
    percentageFee?: number | null
): number => {
    let totalFee = 0;

    if (processingFee) {
        totalFee += processingFee;
    }

    if (percentageFee) {
        totalFee += (amount * percentageFee) / 100;
    }

    return totalFee;
};