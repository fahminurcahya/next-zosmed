import { createTRPCRouter, protectedAdminProcedure, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { QuotaResetService } from "@/server/services/quota-reset-service";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const quotaResetRouter = createTRPCRouter({
    // Process billing cycle resets (daily cron job)
    processBillingCycleResets: publicProcedure
        .input(z.object({
            cronSecret: z.string().optional()
        }))
        .mutation(async ({ input }) => {
            // Verify cron secret if provided
            if (input.cronSecret && input.cronSecret !== process.env.CRON_SECRET) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid cron secret"
                });
            }

            const result = await QuotaResetService.processBillingCycleResets();

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to process billing cycle resets"
                });
            }

            return result;
        }),

    // Reset quota for current user (self-service or after payment)
    resetMyQuota: protectedProcedure
        .input(z.object({
            reason: z.enum(['manual', 'upgrade']).default('manual')
        }))
        .mutation(async ({ ctx, input }) => {
            const result = await QuotaResetService.resetUserQuota(ctx.session.user.id, input.reason);

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to reset user quota"
                });
            }

            return result;
        }),

    // Reset quota for specific user (admin only)
    resetUserQuota: protectedAdminProcedure
        .input(z.object({
            userId: z.string(),
            reason: z.enum(['manual', 'upgrade']).default('manual')
        }))
        .mutation(async ({ ctx, input }) => {

            const result = await QuotaResetService.resetUserQuota(input.userId, input.reason);

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to reset user quota"
                });
            }

            return result;
        }),

    // Get upcoming quota resets (admin)
    getUpcomingResets: protectedProcedure
        .input(z.object({
            days: z.number().min(1).max(30).default(3)
        }))
        .query(async ({ ctx, input }) => {
            // Check if user has admin role
            if (ctx.session.user.role !== 'admin') {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                });
            }

            return await QuotaResetService.getUpcomingResets(input.days);
        }),

    // Get quota usage statistics (admin)
    getQuotaUsageStats: protectedProcedure.query(async ({ ctx }) => {
        // Check if user has admin role
        if (ctx.session.user.role !== 'admin') {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Admin access required"
            });
        }

        return await QuotaResetService.getQuotaUsageStats();
    }),

    // Get current user's quota info
    getMyQuotaInfo: protectedProcedure.query(async ({ ctx }) => {
        const subscription = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id }
        });

        if (!subscription) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Subscription not found"
            });
        }

        const daysUntilReset = subscription.dmResetDate
            ? Math.ceil((subscription.dmResetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

        return {
            currentDMCount: subscription.currentDMCount,
            maxDMPerMonth: subscription.maxDMPerMonth,
            currentAICount: subscription.currentAICount,
            maxAIReplyPerMonth: subscription.maxAIReplyPerMonth,
            dmResetDate: subscription.dmResetDate,
            daysUntilReset,
            plan: subscription.plan,
            status: subscription.status,
            usage: {
                dmPercentage: (subscription.currentDMCount / subscription.maxDMPerMonth) * 100,
                aiPercentage: (subscription.currentAICount / subscription.maxAIReplyPerMonth) * 100
            }
        };
    }),

    // Check if user can perform action (based on quota)
    checkQuotaAvailability: protectedProcedure
        .input(z.object({
            action: z.enum(['dm', 'ai_reply']),
            amount: z.number().min(1).default(1)
        }))
        .query(async ({ ctx, input }) => {
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id }
            });

            if (!subscription) {
                return {
                    available: false,
                    reason: 'No subscription found',
                    remaining: 0
                };
            }

            if (input.action === 'dm') {
                const remaining = subscription.maxDMPerMonth - subscription.currentDMCount;
                return {
                    available: remaining >= input.amount,
                    reason: remaining < input.amount ? 'DM quota exceeded' : null,
                    remaining,
                    total: subscription.maxDMPerMonth,
                    used: subscription.currentDMCount
                };
            } else {
                const remaining = subscription.maxAIReplyPerMonth - subscription.currentAICount;
                return {
                    available: remaining >= input.amount,
                    reason: remaining < input.amount ? 'AI reply quota exceeded' : null,
                    remaining,
                    total: subscription.maxAIReplyPerMonth,
                    used: subscription.currentAICount
                };
            }
        }),

    // Increment quota usage (when action is performed)
    incrementQuotaUsage: protectedProcedure
        .input(z.object({
            action: z.enum(['dm', 'ai_reply']),
            amount: z.number().min(1).default(1)
        }))
        .mutation(async ({ ctx, input }) => {
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id }
            });

            if (!subscription) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Subscription not found"
                });
            }

            // Check if quota is available
            let newCount, maxLimit, currentCount;

            if (input.action === 'dm') {
                currentCount = subscription.currentDMCount;
                maxLimit = subscription.maxDMPerMonth;
                newCount = currentCount + input.amount;

                if (newCount > maxLimit) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: `DM quota exceeded. Used: ${currentCount}/${maxLimit}`
                    });
                }

                await ctx.db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        currentDMCount: newCount,
                        updatedAt: new Date()
                    }
                });

            } else { // ai_reply
                currentCount = subscription.currentAICount;
                maxLimit = subscription.maxAIReplyPerMonth;
                newCount = currentCount + input.amount;

                if (newCount > maxLimit) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: `AI reply quota exceeded. Used: ${currentCount}/${maxLimit}`
                    });
                }

                await ctx.db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        currentAICount: newCount,
                        updatedAt: new Date()
                    }
                });
            }

            return {
                success: true,
                newCount,
                remaining: maxLimit - newCount,
                action: input.action,
                amount: input.amount
            };
        })
});

// Export type for use in other files
export type QuotaResetRouter = typeof quotaResetRouter;