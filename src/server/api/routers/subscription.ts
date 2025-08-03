import { createTRPCRouter, protectedAdminProcedure, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { SubscriptionNotificationService } from "@/server/services/subscription-notification-service";
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

    // Morning cron job: Process notifications only
    processMorningNotifications: publicProcedure
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

            const result = await SubscriptionNotificationService.processMorningNotifications();

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to process morning notifications"
                });
            }

            return result;
        }),

    // Evening cron job: Process status updates only
    processEveningStatusUpdates: publicProcedure
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

            const result = await SubscriptionNotificationService.processEveningStatusUpdates();

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to process evening status updates"
                });
            }

            return result;
        }),

    //Process notifications for current user
    processMyNotifications: protectedProcedure.mutation(async ({ ctx }) => {
        const result = await SubscriptionNotificationService.processUserSubscription(ctx.session.user.id);

        if (!result.success) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: result.error || "Failed to process user notifications"
            });
        }

        return result;
    }),

    // Process notifications for specific user (admin only)
    processUserNotifications: protectedAdminProcedure
        .input(z.object({
            userId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {

            const result = await SubscriptionNotificationService.processUserSubscription(input.userId);

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to process user notifications"
                });
            }

            return result;
        }),


    // Get subscription status and expiry info
    getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
        return await SubscriptionNotificationService.getUserExpiryInfo(ctx.session.user.id);
    }),

    // Get subscription status for specific user (admin only)
    getUserSubscriptionStatus: protectedProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            // Check if user has admin role
            if (ctx.session.user.role !== 'admin') {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin access required"
                });
            }

            return await SubscriptionNotificationService.getUserExpiryInfo(input.userId);
        }),
});