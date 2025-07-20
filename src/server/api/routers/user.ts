import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { mapBusinessCategoryFromPrisma, mapBusinessCategoryToPrisma, mapBusinessSizeFromPrisma, mapBusinessSizeToPrisma } from "@/server/helper/user";
import { updateBusinessInfoSchema, updateProfileSchema } from "@/schema/user";

export const userRouter = createTRPCRouter({
    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
        try {
            const profile = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id! },
                include: {
                    notification: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        select: {
                            id: true,
                            isSeen: true,
                        },
                        where: {
                            isSeen: false,
                        },
                    },
                    subscription: true,
                    integration: {
                        select: {
                            id: true,
                            accessToken: true,
                            expiresAt: true,
                            accountUsername: true,
                        },
                    },
                },
            })
            if (profile) return { status: 200, data: profile };
            return { status: 404 };
        } catch {
            return { status: 500 };
        }
    }),

    createDefaultSubscription: protectedProcedure
        .mutation(async ({ ctx }) => {
            try {
                const userId = ctx.session.user.id;

                // Check if user already has subscription
                const existingSubscription = await ctx.db.subscription.findUnique({
                    where: { userId }
                });

                if (existingSubscription) {
                    return {
                        success: true,
                        message: "User already has subscription",
                        subscription: existingSubscription
                    };
                }

                // Get FREE pricing plan
                const freePlan = await ctx.db.pricingPlan.findFirst({
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
                const subscription = await ctx.db.subscription.create({
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
                await ctx.db.notification.create({
                    data: {
                        userId,
                        content: `Selamat datang! Akun FREE Anda telah aktif dengan ${freePlan.maxAccounts} akun Instagram dan ${freePlan.maxDMPerMonth} DM per bulan.`
                    }
                });

                return {
                    success: true,
                    message: "Default free subscription created successfully",
                    subscription
                };

            } catch (error) {
                console.error("Error creating default subscription:", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create default subscription",
                });
            }
        }),

    getProfile: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                const userId = ctx.session.user.id;

                const user = await ctx.db.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        businessName: true,
                        businessCategory: true,
                        businessSize: true,
                        location: true,
                        goals: true,
                        createdAt: true,
                        updatedAt: true,
                        subscription: {
                            select: {
                                id: true,
                                status: true,
                                pricingPlan: {
                                    select: {
                                        name: true,
                                        price: true,
                                    }
                                }
                            }
                        },
                        integration: {
                            select: {
                                type: true,
                            }
                        }
                    },
                });

                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User tidak ditemukan.",
                    });
                }

                return {
                    success: true,
                    data: {
                        profile: {
                            id: user.id,
                            name: user.name || '',
                            email: user.email || '',
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                        },
                        businessInfo: {
                            businessName: user.businessName || '',
                            businessCategory: user.businessCategory ? mapBusinessCategoryFromPrisma(user.businessCategory) : '',
                            businessSize: user.businessSize ? mapBusinessSizeFromPrisma(user.businessSize) : '',
                            location: user.location || '',
                            goals: user.goals || '',
                        },
                        subscription: user.subscription ? {
                            status: user.subscription.status,
                            planName: user.subscription.pricingPlan?.name || 'Free',
                            planPrice: user.subscription.pricingPlan?.price || 0,
                        } : null,
                        integrations: user.integration.map(int => ({
                            type: int.type,
                        })),
                    },
                };

            } catch (error) {
                console.error('Error getting profile:', error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal mengambil profile.",
                });
            }
        }),

    // Update profile information
    updateProfile: protectedProcedure
        .input(updateProfileSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.session.user.id;

                // Check if email is already taken by another user
                if (input.email !== ctx.session.user.email) {
                    const existingUser = await ctx.db.user.findUnique({
                        where: { email: input.email },
                        select: { id: true },
                    });

                    if (existingUser && existingUser.id !== userId) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "Email sudah digunakan oleh user lain.",
                        });
                    }
                }

                const updatedUser = await ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        name: input.name.trim(),
                        email: input.email.toLowerCase().trim(),
                        updatedAt: new Date(),
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        updatedAt: true,
                    },
                });

                return {
                    success: true,
                    message: "Profile berhasil diperbarui",
                    data: updatedUser,
                };

            } catch (error) {
                console.error('Error updating profile:', error);

                if (error instanceof z.ZodError) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Data tidak valid",
                        cause: error,
                    });
                }

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal memperbarui profile.",
                });
            }
        }),

    // Update business information
    updateBusinessInfo: protectedProcedure
        .input(updateBusinessInfoSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.session.user.id;

                const businessCategory = mapBusinessCategoryToPrisma(input.businessCategory);
                const businessSize = mapBusinessSizeToPrisma(input.businessSize);

                const updatedUser = await ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        businessName: input.businessName.trim(),
                        businessCategory,
                        businessSize,
                        location: input.location.trim(),
                        goals: input.goals.trim(),
                        updatedAt: new Date(),
                    },
                    select: {
                        id: true,
                        businessName: true,
                        businessCategory: true,
                        businessSize: true,
                        location: true,
                        goals: true,
                        updatedAt: true,
                    },
                });

                return {
                    success: true,
                    message: "Informasi bisnis berhasil diperbarui",
                    data: {
                        businessName: updatedUser.businessName,
                        businessCategory: updatedUser.businessCategory ? mapBusinessCategoryFromPrisma(updatedUser.businessCategory) : '',
                        businessSize: updatedUser.businessSize ? mapBusinessSizeFromPrisma(updatedUser.businessSize) : '',
                        location: updatedUser.location,
                        goals: updatedUser.goals,
                        updatedAt: updatedUser.updatedAt,
                    },
                };

            } catch (error) {
                console.error('Error updating business info:', error);

                if (error instanceof z.ZodError) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Data tidak valid",
                        cause: error,
                    });
                }

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal memperbarui informasi bisnis.",
                });
            }
        }),
});
