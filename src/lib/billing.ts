// src/lib/utils/billing.ts

import type {
    PricingPlan,
    Subscription,
    Payment,
    PricingPeriod,
    PaymentStatus,
    DiscountCode,
} from "@prisma/client";
import type {
    FormattedPlan,
    FormattedSubscription,
    FormattedPayment,
    PlanFeatures,
    PlanLimits,
    PlanVisualConfig,
    SubscriptionWithPlan,
    PaymentWithPlan,
} from "@/types/billing.type";
import { addMonths, differenceInDays, format } from "date-fns";
import { id } from "date-fns/locale";

// Type guards
export function isPricingPlan(value: unknown): value is PricingPlan {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "price" in value
    );
}

export function isValidPlanFeatures(features: unknown): features is PlanFeatures {
    return (
        typeof features === "object" &&
        features !== null &&
        "included" in features &&
        "notIncluded" in features &&
        Array.isArray((features as any).included) &&
        Array.isArray((features as any).notIncluded)
    );
}

// Formatters
export function formatPlan(plan: PricingPlan): FormattedPlan {
    const features = typeof plan.features === "string"
        ? JSON.parse(plan.features)
        : plan.features;

    if (!isValidPlanFeatures(features)) {
        throw new Error(`Invalid features format for plan ${plan.id}`);
    }

    const limits: PlanLimits = {
        maxAccounts: plan.maxAccounts,
        maxDMPerMonth: plan.maxDMPerMonth,
        maxAIReplyPerMonth: plan.maxAIReplyPerMonth,
    };

    const visual: PlanVisualConfig = {
        color: plan.color,
        bgColor: plan.bgColor,
        borderColor: plan.borderColor,
        badge: plan.badge || undefined,
        popular: plan.popular,
    };

    return {
        id: plan.id,
        name: plan.displayName,
        code: plan.name,
        displayName: plan.displayName,
        description: plan.description || undefined,
        price: formatPrice(plan.price, plan.currency),
        priceNumber: plan.price,
        period: formatPeriod(plan.period),
        features,
        limits,
        visual,
        cta: plan.price === 0 ? "Mulai Gratis" : "Pilih Plan",
    };
}

export function formatPrice(price: number, currency: string): string {
    if (price === 0) return "Gratis";

    switch (currency) {
        case "IDR":
            return `Rp ${price.toLocaleString("id-ID")}`;
        case "USD":
            return `$${price.toLocaleString("en-US")}`;
        case "EUR":
            return `€${price.toLocaleString("de-DE")}`;
        default:
            return `${currency} ${price.toLocaleString()}`;
    }
}

export function formatPeriod(period: PricingPeriod): string {
    const periodMap: Record<PricingPeriod, string> = {
        MONTHLY: "per bulan",
        QUARTERLY: "per 3 bulan",
        YEARLY: "per tahun",
        LIFETIME: "selamanya",
    };

    return periodMap[period] || period.toLowerCase();
}

export function formatSubscription(
    subscription: SubscriptionWithPlan
): FormattedSubscription {


    return {
        id: subscription.id,
        userId: subscription.userId || "",
        plan: subscription.plan,
        planDisplayName: subscription.pricingPlan?.displayName || subscription.plan,
        status: subscription.status,
        isActive: subscription.status === "ACTIVE",
        price: subscription.pricingPlan?.price || 0,
        maxAccounts: subscription.maxAccounts,
        maxDMPerMonth: subscription.maxDMPerMonth,
        maxAIReplyPerMonth: subscription.maxAIReplyPerMonth || 0,
        currentDMCount: subscription.currentDMCount,
        currentAICount: subscription.currentAICount,
        daysRemaining: subscription.daysRemaining,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        hasAIReply: subscription.hasAIReply,
        dmResetDate: subscription.dmResetDate,
    };
}

export function formatPayment(payment: PaymentWithPlan): FormattedPayment {
    return {
        id: payment.id,
        externalId: payment.externalId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        planName: payment.plan?.displayName || "Unknown Plan",
        discountCode: payment.discountCode || undefined,
        discountAmount: payment.discountAmount || undefined,
        paymentMethod: payment.paymentMethod || undefined,
        paymentChannel: payment.paymentChannel || undefined,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt || undefined,
        invoiceUrl: payment.xenditInvoiceUrl || undefined,
    };
}

// Calculators
export function calculateProration(
    currentPlan: { price: number; endDate: Date },
    newPlan: { price: number },
    upgradeDate: Date = new Date()
): number {
    const daysRemaining = differenceInDays(currentPlan.endDate, upgradeDate);
    if (daysRemaining <= 0) return 0;

    const dailyRate = currentPlan.price / 30; // Assuming 30 days per month
    const unusedValue = dailyRate * daysRemaining;

    return Math.round(unusedValue);
}

export function calculateDiscountAmount(
    amount: number,
    discount: Pick<DiscountCode, "type" | "value">
): number {
    if (discount.type === "PERCENTAGE") {
        return Math.round((amount * discount.value) / 100);
    } else {
        return Math.min(discount.value, amount);
    }
}

export function calculateNextBillingDate(
    period: PricingPeriod,
    fromDate: Date = new Date()
): Date {
    switch (period) {
        case "MONTHLY":
            return addMonths(fromDate, 1);
        case "QUARTERLY":
            return addMonths(fromDate, 3);
        case "YEARLY":
            return addMonths(fromDate, 12);
        case "LIFETIME":
            return new Date("2099-12-31"); // Far future date
        default:
            return addMonths(fromDate, 1);
    }
}

// Validators
export function canUpgradeToPlan(
    currentPlan: { price: number; name: string },
    newPlan: { price: number; name: string }
): { canUpgrade: boolean; reason?: string } {
    if (currentPlan.name === newPlan.name) {
        return { canUpgrade: false, reason: "Already on this plan" };
    }

    if (newPlan.price <= currentPlan.price) {
        return { canUpgrade: false, reason: "Can only upgrade to higher plans" };
    }

    return { canUpgrade: true };
}

export function isPaymentSuccessful(status: PaymentStatus): boolean {
    return status === "SUCCESS";
}

export function isPaymentPending(status: PaymentStatus): boolean {
    return status === "PENDING";
}

export function isPaymentFailed(status: PaymentStatus): boolean {
    return status === "FAILED" || status === "EXPIRED";
}

// Status helpers
export function getPaymentStatusConfig(status: PaymentStatus): {
    label: string;
    variant: "default" | "success" | "warning" | "destructive";
    icon: string;
} {
    const config: Record<PaymentStatus, { label: string; variant: any; icon: string }> = {
        PENDING: { label: "Pending", variant: "warning", icon: "Clock" },
        SUCCESS: { label: "Paid", variant: "success", icon: "CheckCircle" },
        FAILED: { label: "Failed", variant: "destructive", icon: "XCircle" },
        EXPIRED: { label: "Expired", variant: "default", icon: "Clock" },
        REFUNDED: { label: "Refunded", variant: "default", icon: "RefreshCw" },
        ABANDONED: { label: "Abandoned", variant: "default", icon: "XCircle" },
    };

    return config[status] || config.PENDING;
}

// Date formatters
export function formatPaymentDate(date: Date): string {
    return format(date, "dd MMM yyyy", { locale: id });
}

export function formatInvoiceExpiry(date: Date): string {
    return format(date, "dd MMM yyyy, HH:mm", { locale: id });
}

export function formatBillingPeriod(start: Date, end: Date): string {
    return `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
}

// Usage helpers
export function calculateUsagePercentage(used: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
}

export function formatUsageDisplay(used: number, limit: number): string {
    const percentage = calculateUsagePercentage(used, limit);
    return `${used.toLocaleString()} / ${limit.toLocaleString()} (${percentage}%)`;
}

export function isUsageNearLimit(used: number, limit: number, threshold = 80): boolean {
    return calculateUsagePercentage(used, limit) >= threshold;
}

// Plan comparison helpers
// export function comparePlans(
//     plans: FormattedPlan[]
// ): Array<{ feature: string; availability: Record<string, boolean> }> {
//     const allFeatures = new Set<string>();

//     plans.forEach(plan => {
//         plan.features.included.forEach(f => allFeatures.add(f));
//         plan.features.notIncluded.forEach(f => allFeatures.add(f));
//     });

//     return Array.from(allFeatures).map(feature => {
//         const availability: Record<string, boolean> = {};

//         plans.forEach(plan => {
//             availability[plan.id] = plan.features.included.includes(feature);
//         });

//         return { feature, availability };
//     });
// }

export function comparePlans(
    plans: FormattedPlan[]
): Array<{ feature: string; availability: Record<string, boolean> }> {
    const allFeatures = new Set<string>();

    // Gabungkan semua fitur (included dan notIncluded)
    for (const plan of plans) {
        plan.features.included.forEach(f => allFeatures.add(f));
        plan.features.notIncluded.forEach(f => allFeatures.add(f));
    }

    // Buat list fitur dengan mapping ketersediaan pada tiap plan
    return Array.from(allFeatures).map(feature => {
        const availability: Record<string, boolean> = {};

        for (const plan of plans) {
            availability[plan.id] = plan.features.included.includes(feature);
        }

        return { feature, availability };
    });
}


// Export all types
export type * from "@/types/billing.type";