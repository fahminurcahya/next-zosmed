// src/server/api/routers/payment-channel.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PaymentChannelType, PaymentCategory } from "@prisma/client";
import { createTRPCRouter, protectedAdminProcedure, protectedProcedure } from "../trpc";

// Validation schemas
const createPaymentChannelSchema = z.object({
    channelCode: z.string().min(1, "Channel code is required").toUpperCase(),
    channelName: z.string().min(1, "Channel name is required"),
    type: z.nativeEnum(PaymentChannelType),
    category: z.nativeEnum(PaymentCategory),
    isActive: z.boolean().default(true),
    isOneTimeEnabled: z.boolean().default(true),
    isRecurringEnabled: z.boolean().default(false),
    logo: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    sortOrder: z.number().min(0).default(0),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
    processingFee: z.number().min(0).optional(),
    percentageFee: z.number().min(0).max(100).optional(),
    allowedForPlans: z.array(z.string()).default([]),
    description: z.string().optional(),
    customerMessage: z.string().optional(),
    xenditChannelCode: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

const updatePaymentChannelSchema = createPaymentChannelSchema.partial().extend({
    id: z.string().cuid(),
});

const getPaymentChannelsSchema = z.object({
    includeInactive: z.boolean().default(false),
    type: z.nativeEnum(PaymentChannelType).optional(),
    category: z.nativeEnum(PaymentCategory).optional(),
    forOneTime: z.boolean().optional(),
    forRecurring: z.boolean().optional(),
    forPlan: z.enum(["FREE", "STARTER", "PRO"]).optional(),
});

export const paymentChannelRouter = createTRPCRouter({
    // Admin procedures
    create: protectedAdminProcedure
        .input(createPaymentChannelSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                // Check if channel code already exists
                const existingChannel = await ctx.db.paymentChannel.findUnique({
                    where: { channelCode: input.channelCode },
                });

                if (existingChannel) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Channel code already exists",
                    });
                }

                const channel = await ctx.db.paymentChannel.create({
                    data: input,
                });

                return {
                    success: true,
                    data: channel,
                    message: "Payment channel created successfully",
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create payment channel",
                });
            }
        }),

    update: protectedAdminProcedure
        .input(updatePaymentChannelSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const { id, ...updateData } = input;

                // Check if channel exists
                const existingChannel = await ctx.db.paymentChannel.findUnique({
                    where: { id },
                });

                if (!existingChannel) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Payment channel not found",
                    });
                }

                // Check if channelCode conflicts (if being updated)
                if (updateData.channelCode && updateData.channelCode !== existingChannel.channelCode) {
                    const conflictChannel = await ctx.db.paymentChannel.findUnique({
                        where: { channelCode: updateData.channelCode },
                    });

                    if (conflictChannel) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: "Channel code already exists",
                        });
                    }
                }

                const updatedChannel = await ctx.db.paymentChannel.update({
                    where: { id },
                    data: updateData,
                });

                return {
                    success: true,
                    data: updatedChannel,
                    message: "Payment channel updated successfully",
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update payment channel",
                });
            }
        }),

    delete: protectedAdminProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const existingChannel = await ctx.db.paymentChannel.findUnique({
                    where: { id: input.id },
                });

                if (!existingChannel) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Payment channel not found",
                    });
                }

                await ctx.db.paymentChannel.delete({
                    where: { id: input.id },
                });

                return {
                    success: true,
                    message: "Payment channel deleted successfully",
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete payment channel",
                });
            }
        }),

    toggleStatus: protectedAdminProcedure
        .input(z.object({
            id: z.string().cuid(),
            isActive: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const updatedChannel = await ctx.db.paymentChannel.update({
                    where: { id: input.id },
                    data: { isActive: input.isActive },
                });

                return {
                    success: true,
                    data: updatedChannel,
                    message: `Payment channel ${input.isActive ? 'activated' : 'deactivated'} successfully`,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to toggle payment channel status",
                });
            }
        }),

    updateSortOrder: protectedAdminProcedure
        .input(z.object({
            channels: z.array(z.object({
                id: z.string().cuid(),
                sortOrder: z.number().min(0),
            })),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                // Update all channels in a transaction
                await ctx.db.$transaction(
                    input.channels.map(({ id, sortOrder }) =>
                        ctx.db.paymentChannel.update({
                            where: { id },
                            data: { sortOrder },
                        })
                    )
                );

                return {
                    success: true,
                    message: "Channel order updated successfully",
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update channel order",
                });
            }
        }),

    // Admin list (all channels)
    listAdmin: protectedAdminProcedure
        .input(getPaymentChannelsSchema)
        .query(async ({ ctx, input }) => {
            try {
                const where: any = {};

                if (!input.includeInactive) {
                    where.isActive = true;
                }

                if (input.type) {
                    where.type = input.type;
                }

                if (input.category) {
                    where.category = input.category;
                }

                if (input.forOneTime !== undefined) {
                    where.isOneTimeEnabled = input.forOneTime;
                }

                if (input.forRecurring !== undefined) {
                    where.isRecurringEnabled = input.forRecurring;
                }

                if (input.forPlan) {
                    where.OR = [
                        { allowedForPlans: { has: input.forPlan } },
                        { allowedForPlans: { isEmpty: true } }, // Empty array means all plans
                    ];
                }

                const channels = await ctx.db.paymentChannel.findMany({
                    where,
                    orderBy: [
                        { sortOrder: 'asc' },
                        { channelName: 'asc' },
                    ],
                });

                return {
                    success: true,
                    data: channels,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch payment channels",
                });
            }
        }),

    getById: protectedAdminProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ ctx, input }) => {
            try {
                const channel = await ctx.db.paymentChannel.findUnique({
                    where: { id: input.id },
                });

                if (!channel) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Payment channel not found",
                    });
                }

                return {
                    success: true,
                    data: channel,
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch payment channel",
                });
            }
        }),

    // Public procedures (for users during checkout)
    listForUser: protectedProcedure
        .input(z.object({
            planName: z.enum(["FREE", "STARTER", "PRO"]).optional(),
            isRecurring: z.boolean().default(false),
            amount: z.number().positive().optional(),
        }))
        .query(async ({ ctx, input }) => {
            try {
                const where: any = {
                    isActive: true,
                };

                // Filter by payment type (one-time or recurring)
                if (input.isRecurring) {
                    where.isRecurringEnabled = true;
                } else {
                    where.isOneTimeEnabled = true;
                }

                // Filter by plan restrictions
                if (input.planName) {
                    where.OR = [
                        { allowedForPlans: { has: input.planName } },
                        { allowedForPlans: { isEmpty: true } }, // Empty array means all plans
                    ];
                }

                // Filter by amount limits
                if (input.amount) {
                    where.AND = [
                        {
                            OR: [
                                { minAmount: null },
                                { minAmount: { lte: input.amount } },
                            ],
                        },
                        {
                            OR: [
                                { maxAmount: null },
                                { maxAmount: { gte: input.amount } },
                            ],
                        },
                    ];
                }

                const channels = await ctx.db.paymentChannel.findMany({
                    where,
                    select: {
                        id: true,
                        channelCode: true,
                        channelName: true,
                        type: true,
                        category: true,
                        logo: true,
                        backgroundColor: true,
                        textColor: true,
                        sortOrder: true,
                        processingFee: true,
                        percentageFee: true,
                        customerMessage: true,
                        isRecurringEnabled: true,
                        isOneTimeEnabled: true,
                        xenditChannelCode: true,
                    },
                    orderBy: [
                        { sortOrder: 'asc' },
                        { channelName: 'asc' },
                    ],
                });

                return {
                    success: true,
                    data: channels,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch available payment channels",
                });
            }
        }),

    // Seed default channels
    seedDefaults: protectedAdminProcedure
        .mutation(async ({ ctx }) => {
            try {
                const defaultChannels = [
                    {
                        channelCode: "BCA",
                        channelName: "BCA Virtual Account",
                        type: PaymentChannelType.VIRTUAL_ACCOUNT,
                        category: PaymentCategory.BANK_TRANSFER,
                        logo: "/icons/bca.svg",
                        backgroundColor: "#0066cc",
                        textColor: "#ffffff",
                        sortOrder: 1,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: true,
                        xenditChannelCode: "BCA",
                    },
                    {
                        channelCode: "BNI",
                        channelName: "BNI Virtual Account",
                        type: PaymentChannelType.VIRTUAL_ACCOUNT,
                        category: PaymentCategory.BANK_TRANSFER,
                        logo: "/icons/bni.svg",
                        backgroundColor: "#f97316",
                        textColor: "#ffffff",
                        sortOrder: 2,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: true,
                        xenditChannelCode: "BNI",
                    },
                    {
                        channelCode: "BRI",
                        channelName: "BRI Virtual Account",
                        type: PaymentChannelType.VIRTUAL_ACCOUNT,
                        category: PaymentCategory.BANK_TRANSFER,
                        logo: "/icons/bri.svg",
                        backgroundColor: "#1e40af",
                        textColor: "#ffffff",
                        sortOrder: 3,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: true,
                        xenditChannelCode: "BRI",
                    },
                    {
                        channelCode: "MANDIRI",
                        channelName: "Mandiri Virtual Account",
                        type: PaymentChannelType.VIRTUAL_ACCOUNT,
                        category: PaymentCategory.BANK_TRANSFER,
                        logo: "/icons/mandiri.svg",
                        backgroundColor: "#eab308",
                        textColor: "#ffffff",
                        sortOrder: 4,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: true,
                        xenditChannelCode: "MANDIRI",
                    },
                    {
                        channelCode: "OVO",
                        channelName: "OVO",
                        type: PaymentChannelType.EWALLET,
                        category: PaymentCategory.DIGITAL_WALLET,
                        logo: "/icons/ovo.svg",
                        backgroundColor: "#4c1d95",
                        textColor: "#ffffff",
                        sortOrder: 5,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: false,
                        xenditChannelCode: "ID_OVO",
                    },
                    {
                        channelCode: "DANA",
                        channelName: "DANA",
                        type: PaymentChannelType.EWALLET,
                        category: PaymentCategory.DIGITAL_WALLET,
                        logo: "/icons/dana.svg",
                        backgroundColor: "#0ea5e9",
                        textColor: "#ffffff",
                        sortOrder: 6,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: false,
                        xenditChannelCode: "ID_DANA",
                    },
                    {
                        channelCode: "LINKAJA",
                        channelName: "LinkAja",
                        type: PaymentChannelType.EWALLET,
                        category: PaymentCategory.DIGITAL_WALLET,
                        logo: "/icons/linkaja.svg",
                        backgroundColor: "#dc2626",
                        textColor: "#ffffff",
                        sortOrder: 7,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: false,
                        xenditChannelCode: "ID_LINKAJA",
                    },
                    {
                        channelCode: "QRIS",
                        channelName: "QRIS",
                        type: PaymentChannelType.QR_CODE,
                        category: PaymentCategory.QR_PAYMENT,
                        logo: "/icons/qris.svg",
                        backgroundColor: "#ef4444",
                        textColor: "#ffffff",
                        sortOrder: 8,
                        isOneTimeEnabled: true,
                        isRecurringEnabled: false,
                        xenditChannelCode: "ID_QRIS",
                    },
                ];

                const created = [];
                for (const channelData of defaultChannels) {
                    try {
                        const existing = await ctx.db.paymentChannel.findUnique({
                            where: { channelCode: channelData.channelCode },
                        });

                        if (!existing) {
                            const channel = await ctx.db.paymentChannel.create({
                                data: channelData,
                            });
                            created.push(channel);
                        }
                    } catch (error) {
                        // Skip if already exists or other errors
                        console.error(`Failed to create channel ${channelData.channelCode}:`, error);
                    }
                }

                return {
                    success: true,
                    data: created,
                    message: `Successfully seeded ${created.length} payment channels`,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to seed payment channels",
                });
            }
        }),
});