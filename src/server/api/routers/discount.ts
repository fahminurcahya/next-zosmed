// src/server/api/routers/discount.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { discountService } from "@/server/services/discount-service";
import { db } from "@/server/db";

export const discountRouter = createTRPCRouter({
    validate: publicProcedure
        .input(
            z.object({
                code: z.string().min(1),
                plan: z.enum(["FREE", "STARTER", "PRO"]),
                amount: z.number().positive(),
            })
        )
        .query(async ({ input }) => {
            try {
                const discount = await discountService.validateCode(
                    input.code,
                    input.plan,
                    input.amount
                );

                const calculation = discountService.calculateDiscount(
                    discount,
                    input.amount
                );

                return {
                    valid: true,
                    discount: {
                        code: discount.code,
                        description: discount.description,
                        type: discount.type,
                        value: discount.value,
                    },
                    calculation,
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    return {
                        valid: false,
                        error: error.message,
                    };
                }
                throw error;
            }
        }),

    applyDiscount: protectedProcedure
        .input(
            z.object({
                code: z.string().min(1),
                plan: z.enum(["FREE", "STARTER", "PRO"]),
                amount: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const result = await discountService.applyDiscount(
                input.code,
                ctx.session.user.id,
                input.plan,
                input.amount
            );

            return {
                success: true,
                ...result,
            };
        }),

    // Get user's available discounts
    getUserDiscounts: protectedProcedure.query(async ({ ctx }) => {
        return discountService.getUserDiscounts(ctx.session.user.id);
    }),

    // Admin: Create manual discount
    create: protectedProcedure
        .input(
            z.object({
                code: z.string().min(4).max(20),
                type: z.enum(["PERCENTAGE", "FIXED"]),
                value: z.number().positive(),
                description: z.string().optional(),
                validDays: z.number().optional().default(30),
                maxUses: z.number().optional(),
                applicablePlans: z.array(z.enum(["FREE", "STARTER", "PRO"])).optional(),
                minPurchaseAmount: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check admin role
            // if (ctx.session.user.role !== "ADMIN") {
            //   throw new TRPCError({ code: "FORBIDDEN" });
            // }

            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + input.validDays);

            const discount = await db.discountCode.create({
                data: {
                    code: input.code.toUpperCase(),
                    type: input.type,
                    value: input.value,
                    description: input.description,
                    validUntil,
                    maxUses: input.maxUses,
                    applicablePlans: input.applicablePlans || [],
                    minPurchaseAmount: input.minPurchaseAmount,
                },
            });

            return discount;
        }),

    // Admin: List all discounts
    list: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                offset: z.number().default(0),
                includeInactive: z.boolean().default(false),
            })
        )
        .query(async ({ ctx, input }) => {
            const where = input.includeInactive ? {} : { isActive: true };

            const [discounts, total] = await Promise.all([
                db.discountCode.findMany({
                    where,
                    include: {
                        _count: {
                            select: { usages: true },
                        },
                        waitinglist: {
                            select: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: input.limit,
                    skip: input.offset,
                }),
                db.discountCode.count({ where }),
            ]);

            return {
                discounts,
                total,
                hasMore: input.offset + input.limit < total,
            };
        }),

    // Admin: Toggle discount status
    toggleStatus: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const discount = await db.discountCode.findUnique({
                where: { id: input.id },
            });

            if (!discount) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Discount not found",
                });
            }

            return db.discountCode.update({
                where: { id: input.id },
                data: { isActive: !discount.isActive },
            });
        }),
});