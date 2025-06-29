// server/api/routers/subscription.ts
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const subscriptionRouter = createTRPCRouter({
    // Get current user's subscription plan
    getCurrentPlan: protectedProcedure.query(async ({ ctx }) => {
        const subscription = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id },
        });

        if (!subscription) {
            // Create default free subscription if not exists
            const newSubscription = await ctx.db.subscription.create({
                data: {
                    userId: ctx.session.user.id,
                    plan: 'FREE',
                    dmResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            return newSubscription;
        }

        // Check if DM reset is needed
        if (new Date() >= subscription.dmResetDate) {
            const updatedSubscription = await ctx.db.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentDMCount: 0,
                    dmResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            return updatedSubscription;
        }

        return subscription;
    }),

    // Get usage statistics
    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
        const subscription = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id },
        });

        if (!subscription) {
            return {
                dmUsed: 0,
                dmLimit: 100,
                dmPercentage: 0,
                daysUntilReset: 30,
            };
        }

        const daysUntilReset = Math.ceil(
            (subscription.dmResetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        return {
            dmUsed: subscription.currentDMCount,
            dmLimit: subscription.maxDMPerMonth,
            dmPercentage: (subscription.currentDMCount / subscription.maxDMPerMonth) * 100,
            daysUntilReset,
        };
    }),

    // Upgrade plan (placeholder for payment integration)
    upgradePlan: protectedProcedure
        .input(z.object({
            plan: z.enum(['STARTER', 'PRO']),
        }))
        .mutation(async ({ ctx, input }) => {
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id },
            });

            if (!subscription) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Subscription not found',
                });
            }

            // TODO: Integrate with payment provider (Xendit/Midtrans)
            // For now, just update the plan
            const planConfig = {
                STARTER: {
                    maxAccounts: 3,
                    maxDMPerMonth: 2000,
                    hasAIReply: true,
                    hasAISalesPredictor: false,
                },
                PRO: {
                    maxAccounts: 10,
                    maxDMPerMonth: 10000,
                    hasAIReply: true,
                    hasAISalesPredictor: true,
                },
            };

            const config = planConfig[input.plan];

            const updated = await ctx.db.subscription.update({
                where: { id: subscription.id },
                data: {
                    plan: input.plan,
                    ...config,
                    status: 'ACTIVE',
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            return {
                success: true,
                subscription: updated,
            };
        }),
});