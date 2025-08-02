import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { mapBusinessCategoryFromPrisma, mapBusinessCategoryToPrisma, mapBusinessSizeFromPrisma, mapBusinessSizeToPrisma } from "@/server/helper/user";
import { updateBusinessInfoSchema, updateProfileSchema } from "@/schema/user";
import { auth } from "@/server/auth";
import { UserService } from "@/server/services/user-service";
import { headers } from "next/headers";

const userService = new UserService();


export const userRouter = createTRPCRouter({
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
                        phone: true,
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
                            phone: user.phone || '',
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

    changePassword: protectedProcedure
        .input(z.object({
            currentPassword: z.string().min(1, "Current password is required"),
            newPassword: z.string()
                .min(8, "Password baru minimal 8 karakter")
                .max(100, "Password maksimal 100 karakter")
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka"),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            try {
                const body = {
                    newPassword: input.newPassword,
                    currentPassword: input.currentPassword,
                }
                const isValid = await auth.api.changePassword(
                    {
                        headers: await headers(),
                        body: body,
                    }
                );

                if (!isValid) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "Password saat ini tidak sesuai",
                    });
                }

                // Create notification
                await ctx.db.notification.create({
                    data: {
                        userId,
                        content: "Password berhasil diubah",
                        channel: 'email'
                    },
                });

                return {
                    success: true,
                    message: "Password berhasil diubah",
                };
            } catch (error: any) {
                if (error.code === "UNAUTHORIZED") {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal mengubah password",
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
                        phone: input.phoneNumber,
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
