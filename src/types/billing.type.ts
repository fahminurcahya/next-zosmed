
import type {
    PricingPlan,
    Payment,
    Subscription,
    DiscountCode,
    PaymentStatus,
    SubscriptionStatus,
    SUBSCRIPTION_PLAN,
    PricingPeriod,
    DiscountType
} from "@prisma/client";

// Plan Types
export interface PlanFeatures {
    included: string[];
    notIncluded: string[];
}

export interface PlanLimits {
    maxAccounts: number;
    maxDMPerMonth: number;
    maxAIReplyPerMonth: number;
}

export interface PlanVisualConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    badge?: string;
    popular: boolean;
}

export interface FormattedPlan {
    id: string;
    name: string;
    code: string;
    displayName: string;
    description?: string;
    price: string;
    priceNumber: number;
    period: string;
    features: PlanFeatures;
    limits: PlanLimits;
    visual: PlanVisualConfig;
    cta: string;
    isCurrentPlan?: boolean;
    priceIncrease?: number;
}

export interface PlanComparison {
    plans: FormattedPlan[];
    features: {
        key: string;
        name: string;
        category: string;
        plans: Record<string, boolean | string>;
    }[];
}

// Subscription Types
export interface SubscriptionWithPlan extends Subscription {
    pricingPlan?: PricingPlan | null;
    user?: {
        integration?: Array<{ id: string }>;
    } | null;
    daysRemaining: number | null
}

export interface FormattedSubscription {
    id: string;
    userId: string;
    plan: string;
    planId: string;
    planDisplayName: string;
    status: SubscriptionStatus;
    isActive: boolean;
    price: number;
    maxAccounts: number;
    maxDMPerMonth: number;
    maxAIReplyPerMonth: number;
    currentDMCount: number;
    currentAICount: number;
    daysRemaining: number | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    hasAIReply: boolean;
    dmResetDate: Date;
    isShowRenewal: boolean;
}

// Payment Types
export interface PaymentWithPlan extends Payment {
    plan?: PricingPlan | null;
}

export interface FormattedPayment {
    id: string;
    externalId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    planName: string;
    discountCode?: string;
    discountAmount?: number;
    paymentMethod?: string;
    paymentChannel?: string;
    createdAt: Date;
    paidAt?: Date;
    invoiceUrl?: string;
}

export interface PaymentMethod {
    type: "CARD" | "EWALLET" | "VIRTUAL_ACCOUNT" | "QR_CODE";
    name: string;
    logo?: string;
    enabled: boolean;
}

// Discount Types
export interface DiscountValidation {
    valid: boolean;
    discount?: {
        code: string;
        description?: string;
        type: DiscountType;
        value: number;
    };
    calculation?: {
        originalAmount: number;
        discountAmount: number;
        finalAmount: number;
        discountPercentage: number;
    };
    error?: string;
}

export interface DiscountApplication {
    discount: DiscountCode;
    discountAmount: number;
    finalAmount: number;
    usage: {
        id: string;
        discountId: string;
        userId: string;
        orderAmount: number;
        discountAmount: number;
        appliedAt: Date;
    };
}

// Invoice Types
export interface CreateInvoiceParams {
    userId: string;
    planId: string;
    amount: number;
    discountCode?: string;
    discountAmount?: number;
    description: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
}

export interface CreateInvoiceResponse {
    invoiceId: string;
    invoiceUrl: string;
    externalId: string;
    amount: number;
    expiryDate: string;
}

// Webhook Types
export interface XenditInvoiceWebhook {
    id: string;
    external_id: string;
    user_id: string;
    status: "PAID" | "EXPIRED" | "PENDING";
    merchant_name: string;
    amount: number;
    paid_amount?: number;
    paid_at?: string;
    payer_email?: string;
    description: string;
    payment_method?: string;
    payment_channel?: string;
    currency: string;
    created: string;
    updated: string;
}

export interface XenditRecurringWebhook {
    id: string;
    reference_id: string;
    customer_id: string;
    recurring_action: string;
    currency: string;
    amount: number;
    status: string;
    failure_code?: string;
    created: string;
    updated: string;
    metadata?: Record<string, any>;
}

// Form Types
export interface PlanFormData {
    name: string;
    displayName: string;
    description?: string;
    price: number;
    currency: string;
    period: PricingPeriod;
    color: string;
    bgColor: string;
    borderColor: string;
    popular: boolean;
    badge?: string;
    maxAccounts: number;
    maxDMPerMonth: number;
    maxAIReplyPerMonth: number;
    features: PlanFeatures;
    isActive: boolean;
    sortOrder: number;
}

export interface UpgradeFormData {
    planId: string;
    discountCode?: string;
}

export interface CancelSubscriptionData {
    reason?: string;
    feedback?: string;
}

// API Response Types
export interface BillingStatsResponse {
    totalRevenue: number;
    activeSubscriptions: number;
    churnRate: number;
    averageRevenuePerUser: number;
    topPlans: Array<{
        planName: string;
        count: number;
        revenue: number;
    }>;
}

export interface UsageStatsResponse {
    accountsUsed: number;
    accountsLimit: number;
    dmSent: number;
    dmLimit: number;
    aiRepliesUsed: number;
    aiRepliesLimit: number;
    resetDate: Date;
}

// Utility Types
export type PlanUpgradeEligibility = {
    canUpgrade: boolean;
    availablePlans: FormattedPlan[];
    currentPlan?: FormattedPlan;
    reason?: string;
};

export type PaymentHistoryFilter = {
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
};

export type SubscriptionAction =
    | { type: "UPGRADE"; planId: string; discountCode?: string }
    | { type: "CANCEL"; reason?: string; feedback?: string }
    | { type: "RESUME" }
    | { type: "RENEWAL"; planId: string }
    | { type: "CHANGE_PAYMENT_METHOD"; methodId: string };