import type { BusinessCategory, BusinessSize } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { businessInfoValidationSchema } from "@/schema/onboarding.schema";
import { z } from "zod";
import { mapBusinessCategoryFromPrisma, mapBusinessCategoryToPrisma, mapBusinessSizeFromPrisma, mapBusinessSizeToPrisma } from "@/server/helper/user";


export const onboardingRouter = createTRPCRouter({
    // Get current business information
    getBusinessInfo: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                const userId = ctx.session.user.id;

                const user = await ctx.db.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        businessName: true,
                        businessCategory: true,
                        businessSize: true,
                        location: true,
                        goals: true,
                        onboardingStep: true,
                        hasOnboarding: true,
                        agreements: true,
                        onboardingCompletedAt: true,
                        createdAt: true,
                        updatedAt: true,
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
                        businessInfo: {
                            businessName: user.businessName || '',
                            businessCategory: user.businessCategory ? mapBusinessCategoryFromPrisma(user.businessCategory) : '',
                            businessSize: user.businessSize ? mapBusinessSizeFromPrisma(user.businessSize) : '',
                            location: user.location || '',
                            goals: user.goals || '',
                            agreements: user.agreements || false,
                        },
                        onboardingStatus: {
                            currentStep: user.onboardingStep,
                            isCompleted: user.hasOnboarding,
                            completedAt: user.onboardingCompletedAt,
                        },
                        timestamps: {
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                        },
                    },
                };

            } catch (error) {
                console.error('Error getting business info:', error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal mengambil informasi bisnis.",
                });
            }
        }),

    // Save business information
    saveBusinessInfo: protectedProcedure
        .input(businessInfoValidationSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.session.user.id;

                // Check if user exists
                const existingUser = await ctx.db.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        onboardingStep: true,
                        hasOnboarding: true,
                        businessName: true
                    },
                });

                if (!existingUser) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User tidak ditemukan.",
                    });
                }

                // Map frontend enums to Prisma enums
                const businessCategory = mapBusinessCategoryToPrisma(input.businessCategory);
                const businessSize = mapBusinessSizeToPrisma(input.businessSize);

                // Update user with business information
                const updatedUser = await ctx.db.user.update({
                    where: { id: userId },
                    data: {
                        businessName: input.businessName.trim(),
                        businessCategory,
                        businessSize,
                        location: input.location.trim(),
                        goals: input.goals.trim(),
                        agreements: input.agreements,
                        onboardingStep: 'INSTAGRAM_CONNECTION', // Move to next step
                        updatedAt: new Date(),
                    },
                    select: {
                        id: true,
                        businessName: true,
                        businessCategory: true,
                        businessSize: true,
                        location: true,
                        goals: true,
                        agreements: true,
                        onboardingStep: true,
                        hasOnboarding: true,
                        updatedAt: true,
                    },
                });

                return {
                    success: true,
                    message: "Informasi bisnis berhasil disimpan",
                    data: {
                        user: {
                            id: updatedUser.id,
                            businessName: updatedUser.businessName,
                            businessCategory: updatedUser.businessCategory ? mapBusinessCategoryFromPrisma(updatedUser.businessCategory) : '',
                            businessSize: updatedUser.businessSize ? mapBusinessSizeFromPrisma(updatedUser.businessSize) : '',
                            location: updatedUser.location,
                            goals: updatedUser.goals,
                            onboardingStep: updatedUser.onboardingStep,
                            agreements: updatedUser.agreements,
                            hasOnboarding: updatedUser.hasOnboarding,
                            updatedAt: updatedUser.updatedAt,
                        },
                        nextStep: 'INSTAGRAM_CONNECTION',
                    },
                };

            } catch (error) {
                console.error('Error saving business info:', error);

                // Handle validation errors
                if (error instanceof z.ZodError) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Data tidak valid",
                        cause: error,
                    });
                }

                // Handle known TRPC errors
                if (error instanceof TRPCError) {
                    throw error;
                }

                // Handle database constraint errors
                if (error instanceof Error) {
                    if (error.message.includes('Unique constraint')) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "Data bisnis sudah ada",
                        });
                    }

                    if (error.message.includes('Foreign key constraint')) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Data referensi tidak valid",
                        });
                    }
                }

                // Generic error
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal menyimpan informasi bisnis. Silakan coba lagi.",
                });
            }
        }),

    getOnboardingProgress: protectedProcedure.query(async ({ ctx }) => {
        try {
            const userId = ctx.session.user.id;

            const user = await ctx.db.user.findUnique({
                where: { id: userId },
                select: {
                    hasOnboarding: true,
                    onboardingStep: true,
                    onboardingCompletedAt: true,
                    businessName: true,
                    businessCategory: true,
                    businessSize: true,
                    agreements: true,
                    subscription: {
                        select: {
                            id: true,
                            status: true,
                        }
                    },
                    integration: {
                        select: {
                            id: true,
                            type: true,
                        }
                    }
                }
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User tidak ditemukan.",
                });
            }

            // Tentukan progress berdasarkan data User dan relasi
            const businessInfoCompleted = !!(
                user.businessName &&
                user.businessCategory &&
                user.businessSize &&
                user.agreements
            );

            const instagramConnected = user.integration.some(
                integration => integration.type === 'INSTAGRAM'
            );

            const progress = {
                currentStep: user.onboardingStep,
                hasOnboarding: user.hasOnboarding,
                businessInfoCompleted,
                instagramConnected,
                isCompleted: user.hasOnboarding,
                completedAt: user.onboardingCompletedAt
            };

            return {
                success: true,
                data: progress
            };

        } catch (error) {
            console.error("Error getting onboarding progress:", error);

            if (error instanceof TRPCError) {
                throw error;
            }

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Gagal mengambil progress onboarding.",
            });
        }
    }),

    createFreeSubscription: protectedProcedure
        .input(z.object({
            planId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.session.user.id;

                // Check if plan exists and is free
                const plan = await ctx.db.pricingPlan.findUnique({
                    where: { id: input.planId }
                });

                if (!plan) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Plan tidak ditemukan.",
                    });
                }

                if (plan.price > 0) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Hanya bisa membuat subscription gratis untuk plan gratis.",
                    });
                }

                // Check if user already has subscription
                const existingSubscription = await ctx.db.subscription.findUnique({
                    where: { userId }
                });

                if (existingSubscription) {
                    // Update existing subscription
                    const updatedSubscription = await ctx.db.subscription.update({
                        where: { userId },
                        data: {
                            pricingPlanId: plan.id,
                            status: 'ACTIVE',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: null, // Free plan doesn't expire
                            updatedAt: new Date(),
                        }
                    });

                    return {
                        success: true,
                        subscription: updatedSubscription,
                        message: "Subscription gratis berhasil dibuat"
                    };
                } else {
                    // Create new subscription
                    const newSubscription = await ctx.db.subscription.create({
                        data: {
                            userId,
                            pricingPlanId: plan.id,
                            status: 'ACTIVE',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: null, // Free plan doesn't expire
                        }
                    });

                    return {
                        success: true,
                        subscription: newSubscription,
                        message: "Subscription gratis berhasil dibuat"
                    };
                }

            } catch (error) {
                console.error("Error creating free subscription:", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal membuat subscription gratis.",
                });
            }
        }),

    completeInstagramConnection: protectedProcedure
        .input(z.object({
            hasConnection: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.session.user.id;

                const existingUser = await ctx.db.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        onboardingStep: true,
                        hasOnboarding: true,
                    },
                });

                if (!existingUser) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User tidak ditemukan.",
                    });
                }

                // Update onboarding to completed
                const updateData: any = {
                    onboardingStep: 'COMPLETED',
                    hasOnboarding: true,
                    agreements: true,
                    onboardingCompletedAt: new Date(),
                    updatedAt: new Date(),
                };

                const updatedUser = await ctx.db.user.update({
                    where: { id: userId },
                    data: updateData,
                    select: {
                        id: true,
                        onboardingStep: true,
                        hasOnboarding: true,
                        onboardingCompletedAt: true,
                        updatedAt: true,
                    },
                });

                // Create completion notification
                await ctx.db.notification.create({
                    data: {
                        userId,
                        content: input.hasConnection
                            ? 'Onboarding completed successfully with Instagram connection!'
                            : 'Onboarding completed! You can connect Instagram anytime from the dashboard.',
                    },
                });

                return {
                    success: true,
                    isCompleted: true,
                    hasConnection: input.hasConnection,
                    message: "Onboarding berhasil diselesaikan!",
                    data: {
                        onboardingStep: updatedUser.onboardingStep,
                        hasOnboarding: updatedUser.hasOnboarding,
                        completedAt: updatedUser.onboardingCompletedAt,
                        updatedAt: updatedUser.updatedAt,
                    }
                };

            } catch (error) {
                console.error("Error completing Instagram connection:", error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal menyelesaikan onboarding.",
                });
            }
        }),
});