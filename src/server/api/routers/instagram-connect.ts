import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { InstagramAuthService } from "@/server/services/instagram-auth";
import { TRPCError } from "@trpc/server";
import { INTEGRATION_TYPE, SUBSCRIPTION_PLAN } from "@prisma/client";

export const instagramConnectRouter = createTRPCRouter({
    // Get OAuth URL
    getConnectUrl: protectedProcedure.mutation(async ({ ctx }) => {
        const authUrl = InstagramAuthService.getAuthorizationUrl(ctx.session.user.id);
        return { url: authUrl };
    }),

    // Handle OAuth callback
    handleCallback: protectedProcedure
        .input(
            z.object({
                code: z.string(),
                state: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Validate state
            if (!InstagramAuthService.validateState(input.state, userId)) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid or expired authorization state",
                });
            }

            // Exchange code for token
            const tokenData = await InstagramAuthService.exchangeCodeForToken(input.code);

            // Get long-lived token
            const longLivedToken = await InstagramAuthService.getLongLivedToken(
                tokenData.access_token
            );

            // Get user profile
            const profile = await InstagramAuthService.getUserProfile(
                longLivedToken.access_token
            );

            // Check subscription limits
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId },
            });

            if (!subscription) {
                // Create default subscription if not exists
                await ctx.db.subscription.create({
                    data: {
                        userId,
                        plan: SUBSCRIPTION_PLAN.FREE,
                        dmResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    },
                });
            }

            // Check active integrations count
            const activeIntegrationsCount = await ctx.db.integration.count({
                where: {
                    userId,
                },
            });

            const maxAccounts = subscription?.maxAccounts || 1;

            // Check if trying to connect same account
            const existingIntegration = await ctx.db.integration.findFirst({
                where: {
                    userId,
                    accountId: profile.id,
                },
            });

            if (existingIntegration) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "This Instagram account is already connected",
                });
            }

            // Check if exceeding limit (only if not reactivating existing)
            if (!existingIntegration && activeIntegrationsCount >= maxAccounts) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `You can only connect ${maxAccounts} account${maxAccounts > 1 ? 's' : ''} on your current plan`,
                });
            }

            // Calculate expiry (60 days for long-lived token)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 60);

            // Save or update integration
            const integration = await ctx.db.integration.upsert({
                where: {
                    userId_accountId: {
                        userId,
                        accountId: profile.id,
                    },
                },
                update: {
                    accessToken: longLivedToken.access_token,
                    refreshToken: tokenData.refresh_token || null,
                    expiresAt,
                    accountUsername: profile.username,
                    lastSyncAt: new Date(),
                    scope: tokenData.scope || null,
                },
                create: {
                    userId,
                    type: INTEGRATION_TYPE.INSTAGRAM,
                    accountId: profile.id,
                    accountUsername: profile.username,
                    accessToken: longLivedToken.access_token,
                    refreshToken: tokenData.refresh_token || null,
                    tokenType: longLivedToken.token_type || "bearer",
                    scope: tokenData.scope || null,
                    expiresAt,
                    lastSyncAt: new Date(),
                },
            });

            // TODO : NOTIF success connect instagram
            // Create notification for successful connection
            await ctx.db.notification.create({
                data: {
                    userId,
                    content: `Successfully connected Instagram account @${profile.username}`,
                    channel: 'email'
                },
            });

            return {
                success: true,
                integrationId: integration.id,
                username: profile.username,
                mediaCount: profile.media_count,
                followersCount: profile.followers_count,
            };
        }),

    // Get connected accounts with enhanced info
    getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const [accounts, subscription] = await Promise.all([
            ctx.db.integration.findMany({
                where: {
                    userId,
                    type: INTEGRATION_TYPE.INSTAGRAM,
                },
                select: {
                    id: true,
                    accountUsername: true,
                    accountId: true,
                    lastSyncAt: true,
                    createdAt: true,
                    expiresAt: true,
                    _count: {
                        select: {
                            workflows: true,
                            comments: {
                                where: {
                                    createdAt: {
                                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                                    },
                                },
                            },
                            messages: {
                                where: {
                                    createdAt: {
                                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            ctx.db.subscription.findUnique({
                where: { userId },
            }),
        ]);

        // Add computed fields
        return {
            accounts: accounts.map((account) => ({
                ...account,
                isExpired: account.expiresAt ? account.expiresAt < new Date() : false,
                daysUntilExpiry: account.expiresAt
                    ? Math.floor(
                        (account.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    : null,
                monthlyComments: account._count.comments,
                monthlyMessages: account._count.messages,
                activeWorkflows: account._count.workflows,
            })),
            limits: {
                maxAccounts: subscription?.maxAccounts || 1,
                currentAccounts: accounts.length,
                canAddMore: (subscription?.maxAccounts || 1) > accounts.length,
            },
        };
    }),

    // Disconnect account (hard delete)
    disconnectAccount: protectedProcedure
        .input(z.object({
            accountId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const account = await ctx.db.integration.findFirst({
                where: {
                    id: input.accountId,
                    userId: ctx.session.user.id,
                },
                include: {
                    _count: {
                        select: {
                            workflows: true,
                            comments: true,
                            messages: true,
                        },
                    },
                },
            });

            if (!account) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Account not found",
                });
            }

            // Revoke Instagram token before deletion
            try {
                await InstagramAuthService.revokeInstagramToken(account.accessToken);
            } catch (error) {
                console.error('Failed to revoke Instagram token:', error);
                // Continue with deletion even if revoke fails
            }

            // Hard delete - cascades will handle related data
            await ctx.db.integration.delete({
                where: { id: input.accountId },
            });

            // Create notification
            await ctx.db.notification.create({
                data: {
                    userId: ctx.session.user.id,
                    content: `Instagram account @${account.accountUsername} has been disconnected and all related data deleted`,
                    channel: 'email'
                },
            });

            return {
                success: true,
                deletedWorkflows: account._count.workflows,
                deletedComments: account._count.comments,
                deletedMessages: account._count.messages,
            };
        }),

    // Refresh token
    refreshToken: protectedProcedure
        .input(z.object({ accountId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const account = await ctx.db.integration.findFirst({
                where: {
                    id: input.accountId,
                    userId: ctx.session.user.id,
                },
            });

            if (!account) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Account not found",
                });
            }

            try {
                // Refresh the token
                const newToken = await InstagramAuthService.refreshLongLivedToken(
                    account.accessToken
                );

                // Update in database
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 60);

                await ctx.db.integration.update({
                    where: { id: account.id },
                    data: {
                        accessToken: newToken.access_token,
                        expiresAt,
                        lastSyncAt: new Date(),
                    },
                });

                return { success: true, expiresAt };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to refresh token. Please reconnect the account.",
                });
            }
        }),

    // Export account data
    exportAccountData: protectedProcedure
        .input(z.object({ accountId: z.string() }))
        .query(async ({ ctx, input }) => {
            const account = await ctx.db.integration.findFirst({
                where: {
                    id: input.accountId,
                    userId: ctx.session.user.id,
                },
                include: {
                    workflows: {
                        include: {
                            executions: {
                                include: {
                                    phases: {
                                        include: {
                                            logs: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    comments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1000, // Limit for performance
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1000, // Limit for performance
                    },
                },
            });

            if (!account) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Account not found",
                });
            }

            // Remove sensitive data
            const sanitizedData = {
                ...account,
                accessToken: undefined,
                refreshToken: undefined,
            };

            return {
                exportDate: new Date(),
                data: sanitizedData,
            };
        }),

    // Get account health status
    getAccountHealth: protectedProcedure
        .input(z.object({ accountId: z.string() }))
        .query(async ({ ctx, input }) => {
            const account = await ctx.db.integration.findFirst({
                where: {
                    id: input.accountId,
                    userId: ctx.session.user.id,
                },
                include: {
                    _count: {
                        select: {
                            workflows: true,
                            comments: {
                                where: {
                                    createdAt: {
                                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                                    },
                                },
                            },
                            messages: {
                                where: {
                                    createdAt: {
                                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!account) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Account not found",
                });
            }

            const now = new Date();
            const health = {
                status: 'healthy' as 'healthy' | 'warning' | 'error',
                issues: [] as string[],
            };

            // Check token expiry
            if (account.expiresAt && account.expiresAt < now) {
                health.status = 'error';
                health.issues.push('Token expired');
            } else if (account.expiresAt && (account.expiresAt.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000) {
                health.status = 'warning';
                health.issues.push('Token expiring soon');
            }

            // Check last sync
            if (account.lastSyncAt) {
                const hoursSinceSync = (now.getTime() - account.lastSyncAt.getTime()) / (1000 * 60 * 60);
                if (hoursSinceSync > 24) {
                    health.status = health.status === 'error' ? 'error' : 'warning';
                    health.issues.push('No activity in 24 hours');
                }
            }

            return {
                health,
                stats: {
                    activeWorkflows: account._count.workflows,
                    last24HourComments: account._count.comments,
                    last24HourMessages: account._count.messages,
                    tokenExpiresIn: account.expiresAt
                        ? Math.floor((account.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        : null,
                    lastSyncAgo: account.lastSyncAt
                        ? Math.floor((now.getTime() - account.lastSyncAt.getTime()) / (1000 * 60 * 60))
                        : null,
                },
            };
        }),
});