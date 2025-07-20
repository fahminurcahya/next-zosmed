// src/lib/services/plan-management.service.ts

import { db } from "../db";


export interface PlanFeatureConfig {
    key: string;
    included: boolean;
    limit?: number;
    customValue?: string;
}

export const planManagementService = {

    async getActivePlans() {
        const plans = await db.pricingPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
        });

        return plans.map(plan => this.formatPlan(plan));
    },


    async getPlan(identifier: string) {
        const plan = await db.pricingPlan.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { name: identifier }
                ]
            }
        });

        if (!plan) return null;
        return this.formatPlan(plan);
    },


    formatPlan(plan: any) {
        const features = plan.features as any;

        return {
            id: plan.id,
            name: plan.displayName,
            code: plan.name,
            priceInt: plan.price,
            price: this.formatPrice(plan.price, plan.currency),
            period: this.formatPeriod(plan.period),
            color: plan.color,
            bgColor: plan.bgColor,
            borderColor: plan.borderColor,
            popular: plan.popular,
            badge: plan.badge,
            features: features.included || [],
            notIncluded: features.notIncluded || [],
            limits: {
                maxAccounts: plan.maxAccounts,
                maxDMPerMonth: plan.maxDMPerMonth,
                maxAIReplyPerMonth: plan.maxAIReplyPerMonth,
            },
            cta: plan.price === 0 ? "Mulai Gratis" : "Pilih Plan",
        };
    },


    formatPrice(price: number, currency: string) {
        if (price === 0) return "Gratis";

        if (currency === "IDR") {
            return `Rp ${price.toLocaleString("id-ID")}`;
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(price);
    },


    formatPeriod(period: string) {
        const periods: Record<string, string> = {
            MONTHLY: "per bulan",
            QUARTERLY: "per 3 bulan",
            YEARLY: "per tahun",
            LIFETIME: "selamanya",
        };

        return periods[period] || period.toLowerCase();
    },


    async upsertPlan(data: {
        name: string;
        displayName: string;
        description?: string;
        price: number;
        currency?: string;
        period?: string;
        color: string;
        bgColor: string;
        borderColor: string;
        popular?: boolean;
        badge?: string | null;
        maxAccounts: number;
        maxDMPerMonth: number;
        maxAIReplyPerMonth: number;
        features: {
            included: string[];
            notIncluded: string[];
        };
        isActive?: boolean;
        sortOrder?: number;
    }) {
        return db.pricingPlan.upsert({
            where: { name: data.name },
            update: {
                displayName: data.displayName,
                description: data.description,
                price: data.price,
                currency: data.currency || "IDR",
                period: data.period as any || "MONTHLY",
                color: data.color,
                bgColor: data.bgColor,
                borderColor: data.borderColor,
                popular: data.popular || false,
                badge: data.badge,
                maxAccounts: data.maxAccounts,
                maxDMPerMonth: data.maxDMPerMonth,
                maxAIReplyPerMonth: data.maxAIReplyPerMonth,
                features: data.features,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder || 0,
            },
            create: {
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                price: data.price,
                currency: data.currency || "IDR",
                period: data.period as any || "MONTHLY",
                color: data.color,
                bgColor: data.bgColor,
                borderColor: data.borderColor,
                popular: data.popular || false,
                badge: data.badge,
                maxAccounts: data.maxAccounts,
                maxDMPerMonth: data.maxDMPerMonth,
                maxAIReplyPerMonth: data.maxAIReplyPerMonth,
                features: data.features,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder || 0,
            },
        });
    },

};