// Get FREE pricing plan
import { TRPCError } from "@trpc/server";
import { db } from "../db";


export class UserService {
    async createDefaultPlan(userId: string) {
        return await db.$transaction(async (tx) => {
            const freePlan = await tx.pricingPlan.findFirst({
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

            await tx.subscription.create({
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
                    currentPeriodEnd: null,
                },
                include: { pricingPlan: true }
            });

            await tx.notification.create({
                data: {
                    userId,
                    content: `Selamat datang! Akun FREE Anda telah aktif dengan ${freePlan.maxAccounts} akun Instagram dan ${freePlan.maxDMPerMonth} DM per bulan.`,
                    channel: 'email'
                }
            });
        });
    }

    async changeToFreePlan(userId: string) {
        return await db.$transaction(async (tx) => {
            const freePlan = await tx.pricingPlan.findFirst({
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

            await tx.subscription.upsert({
                where: { userId: userId },
                create: {
                    userId,
                    plan: 'FREE',
                    pricingPlanId: freePlan.id,
                    status: 'ACTIVE',
                    maxAccounts: freePlan.maxAccounts,
                    maxDMPerMonth: freePlan.maxDMPerMonth,
                    currentDMCount: freePlan.maxDMPerMonth,
                    maxAIReplyPerMonth: freePlan.maxAIReplyPerMonth,
                    currentAICount: freePlan.maxAIReplyPerMonth,
                    hasAIReply: freePlan.maxAIReplyPerMonth > 0,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: null,
                },
                update: {
                    userId,
                    plan: 'FREE',
                    pricingPlanId: freePlan.id,
                    status: 'ACTIVE',
                    maxAccounts: freePlan.maxAccounts,
                    maxDMPerMonth: freePlan.maxDMPerMonth,
                    currentDMCount: freePlan.maxDMPerMonth,
                    maxAIReplyPerMonth: freePlan.maxAIReplyPerMonth,
                    currentAICount: freePlan.maxAIReplyPerMonth,
                    hasAIReply: freePlan.maxAIReplyPerMonth > 0,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: null,
                },
                include: { pricingPlan: true }
            });
        });
    }
}



