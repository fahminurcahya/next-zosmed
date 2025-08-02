import { db } from "@/server/db";
import type { PaymentCategory, PaymentChannelType } from "@prisma/client";

interface CreatePaymentChannelData {
    channelCode: string;
    channelName: string;
    type: PaymentChannelType;
    category: PaymentCategory;
    isActive?: boolean;
    isOneTimeEnabled?: boolean;
    isRecurringEnabled?: boolean;
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    sortOrder?: number;
    minAmount?: number;
    maxAmount?: number;
    processingFee?: number;
    percentageFee?: number;
    allowedForPlans?: string[];
    description?: string;
    customerMessage?: string;
    xenditChannelCode?: string;
    metadata?: any;
}

interface PaymentChannelFilters {
    isActive?: boolean;
    isOneTimeEnabled?: boolean;
    isRecurringEnabled?: boolean;
    type?: PaymentChannelType;
    category?: PaymentCategory;
    allowedForPlan?: string;
}



export const paymentChannelsService = {
    /**
     * Get all payment channels
     */
    async getAllChannels(filters?: PaymentChannelFilters) {
        const whereClause: any = {};

        if (filters?.isActive !== undefined) {
            whereClause.isActive = filters.isActive;
        }

        if (filters?.isOneTimeEnabled !== undefined) {
            whereClause.isOneTimeEnabled = filters.isOneTimeEnabled;
        }

        if (filters?.isRecurringEnabled !== undefined) {
            whereClause.isRecurringEnabled = filters.isRecurringEnabled;
        }

        if (filters?.type) {
            whereClause.type = filters.type;
        }

        if (filters?.category) {
            whereClause.category = filters.category;
        }

        // Filter by plan if specified
        if (filters?.allowedForPlan) {
            whereClause.OR = [
                { allowedForPlans: { has: filters.allowedForPlan } },
                { allowedForPlans: { isEmpty: true } }, // Empty array means all plans
            ];
        }

        const channels = await db.paymentChannel.findMany({
            where: whereClause,
            orderBy: [
                { sortOrder: "asc" },
                { channelName: "asc" }
            ]
        });

        return channels;
    },

    /**
     * Get active channels for user payment selection
     */
    async getAvailableChannels(params: {
        paymentType: "one_time" | "recurring";
        userPlan?: string;
        amount?: number;
    }) {
        const { paymentType, userPlan, amount } = params;

        const whereClause: any = {
            isActive: true,
            ...(paymentType === "one_time"
                ? { isOneTimeEnabled: true }
                : { isRecurringEnabled: true }
            )
        };

        // Filter by amount if specified
        if (amount) {
            whereClause.AND = [
                {
                    OR: [
                        { minAmount: null },
                        { minAmount: { lte: amount } }
                    ]
                },
                {
                    OR: [
                        { maxAmount: null },
                        { maxAmount: { gte: amount } }
                    ]
                }
            ];
        }

        const channels = await db.paymentChannel.findMany({
            where: whereClause,
            orderBy: [
                { sortOrder: "asc" },
                { channelName: "asc" }
            ]
        });

        // Filter by plan if specified
        if (userPlan) {
            return channels.filter(channel =>
                channel.allowedForPlans.length === 0 ||
                channel.allowedForPlans.includes(userPlan)
            );
        }

        return channels;
    },

    /**
     * Create new payment channel
     */
    async createChannel(data: CreatePaymentChannelData) {
        // Check if channel code already exists
        const existingChannel = await db.paymentChannel.findUnique({
            where: { channelCode: data.channelCode }
        });

        if (existingChannel) {
            throw new Error("Channel code already exists");
        }

        const channel = await db.paymentChannel.create({
            data: {
                ...data,
                allowedForPlans: data.allowedForPlans || [],
                metadata: data.metadata || {}
            }
        });

        return channel;
    },

    /**
     * Update payment channel
     */
    async updateChannel(channelId: string, data: Partial<CreatePaymentChannelData>) {
        const existingChannel = await db.paymentChannel.findUnique({
            where: { id: channelId }
        });

        if (!existingChannel) {
            throw new Error("Payment channel not found");
        }

        // Check if channel code conflicts with another channel
        if (data.channelCode && data.channelCode !== existingChannel.channelCode) {
            const conflictingChannel = await db.paymentChannel.findUnique({
                where: { channelCode: data.channelCode }
            });

            if (conflictingChannel) {
                throw new Error("Channel code already exists");
            }
        }

        const updatedChannel = await db.paymentChannel.update({
            where: { id: channelId },
            data: {
                ...data,
                allowedForPlans: data.allowedForPlans !== undefined
                    ? data.allowedForPlans
                    : existingChannel.allowedForPlans,
                metadata: data.metadata !== undefined
                    ? data.metadata
                    : existingChannel.metadata
            }
        });

        return updatedChannel;
    },

    /**
     * Toggle channel active status
     */
    async toggleChannelStatus(channelId: string, isActive: boolean) {
        const channel = await db.paymentChannel.findUnique({
            where: { id: channelId }
        });

        if (!channel) {
            throw new Error("Payment channel not found");
        }

        const updatedChannel = await db.paymentChannel.update({
            where: { id: channelId },
            data: { isActive }
        });

        return updatedChannel;
    },

    /**
     * Delete payment channel
     */
    async deleteChannel(channelId: string) {
        const channel = await db.paymentChannel.findUnique({
            where: { id: channelId }
        });

        if (!channel) {
            throw new Error("Payment channel not found");
        }

        // Check if channel is being used in any active payments
        const activePayments = await db.payment.count({
            where: {
                paymentChannel: channel.channelCode,
                status: {
                    in: ["PENDING", "SUCCESS"]
                }
            }
        });

        if (activePayments > 0) {
            throw new Error("Cannot delete channel with active payments. Please deactivate instead.");
        }

        await db.paymentChannel.delete({
            where: { id: channelId }
        });

        return { success: true };
    },

    /**
     * Get payment channel by code
     */
    async getChannelByCode(channelCode: string) {
        const channel = await db.paymentChannel.findUnique({
            where: {
                channelCode,
                isActive: true
            }
        });

        return channel;
    },

    /**
     * Update channel sort orders
     */
    async updateSortOrders(updates: Array<{ id: string; sortOrder: number }>) {
        const updatePromises = updates.map(update =>
            db.paymentChannel.update({
                where: { id: update.id },
                data: { sortOrder: update.sortOrder }
            })
        );

        await Promise.all(updatePromises);
        return { success: true };
    },

    /**
     * Calculate payment fees for channel
     */
    calculateChannelFees(channel: any, amount: number) {
        let processingFee = channel.processingFee || 0;
        let percentageFee = 0;

        if (channel.percentageFee && channel.percentageFee > 0) {
            percentageFee = amount * (channel.percentageFee / 100);
        }

        const totalFee = processingFee + percentageFee;
        const totalAmount = amount + totalFee;

        return {
            processingFee,
            percentageFee,
            totalFee,
            totalAmount,
            originalAmount: amount
        };
    },

    /**
     * Get channels grouped by category
     */
    async getChannelsGroupedByCategory(filters?: PaymentChannelFilters) {
        const channels = await this.getAllChannels(filters);

        const grouped = channels.reduce((acc, channel) => {
            const category = channel.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(channel);
            return acc;
        }, {} as Record<string, any[]>);

        return grouped;
    },

    /**
     * Get channels for Xendit integration
     */
    async getXenditEnabledChannels() {
        const channels = await db.paymentChannel.findMany({
            where: {
                isActive: true,
                xenditChannelCode: { not: null }
            },
            orderBy: [
                { sortOrder: "asc" },
                { channelName: "asc" }
            ]
        });

        return channels.map(channel => ({
            ...channel,
            xenditCode: channel.xenditChannelCode
        }));
    }
};

// Helper functions for integration with existing Xendit service
export const mapChannelToXenditMethod = (channel: any) => {
    return {
        channelCode: channel.xenditChannelCode || channel.channelCode,
        channelName: channel.channelName,
        type: channel.type,
        category: channel.category,
        isEnabled: channel.isActive,
        fees: {
            processing: channel.processingFee,
            percentage: channel.percentageFee
        },
        limits: {
            min: channel.minAmount,
            max: channel.maxAmount
        }
    };
};

export const filterChannelsForUser = (channels: any[], userPlan: string, paymentType: "one_time" | "recurring") => {
    return channels.filter(channel => {
        // Check if payment type is enabled
        if (paymentType === "one_time" && !channel.isOneTimeEnabled) return false;
        if (paymentType === "recurring" && !channel.isRecurringEnabled) return false;

        // Check if plan is allowed
        if (channel.allowedForPlans.length > 0 && !channel.allowedForPlans.includes(userPlan)) {
            return false;
        }

        return channel.isActive;
    });
};