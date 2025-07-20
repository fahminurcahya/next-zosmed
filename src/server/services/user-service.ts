// Get FREE pricing plan
import { TRPCError } from "@trpc/server";
import { db } from "../db";


export class UserService {
    async createDefaultPlan(userId: string) {
        const freePlan = await db.pricingPlan.findFirst({
            where: {
                name: 'FREE',
                isActive: true
            }
        });

        if (!freePlan) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Free plan not found. Please contact support.",
            });
        }

        // Create subscription with FREE plan
        const subscription = await db.subscription.create({
            data: {
                userId,
                plan: 'FREE',
                pricingPlanId: freePlan.id,
                status: 'ACTIVE',
                maxAccounts: freePlan.maxAccounts,
                maxDMPerMonth: freePlan.maxDMPerMonth,
                maxAIReplyPerMonth: freePlan.maxAIReplyPerMonth,
                hasAIReply: freePlan.maxAIReplyPerMonth > 0,
                currentPeriodStart: new Date(),
                // Free plan doesn't expire
                currentPeriodEnd: null,
                dmResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
            include: {
                pricingPlan: true
            }
        });

        // Create welcome notification
        await db.notification.create({
            data: {
                userId,
                content: `Selamat datang! Akun FREE Anda telah aktif dengan ${freePlan.maxAccounts} akun Instagram dan ${freePlan.maxDMPerMonth} DM per bulan.`
            }
        });

        return subscription;
    }
}



