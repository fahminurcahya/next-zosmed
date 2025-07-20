import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { addMonths } from "date-fns";
import { db } from "../db";
import { generateDiscountCode } from "../helper/common";

export const discountService = {

    async generateWaitinglistDiscount(waitinglistId: string) {
        const waitinglist = await db.waitinglist.findUnique({
            where: { id: waitinglistId },
            include: { discountCode: true },
        });

        if (!waitinglist) {
            throw new Error("Waitinglist entry not found");
        }

        // Return existing code if already generated
        if (waitinglist.discountCode) {
            return waitinglist.discountCode;
        }

        // Generate unique code
        const code = generateDiscountCode(waitinglist.email);

        // Create discount code (50% off for 3 months)
        const discountCode = await db.discountCode.create({
            data: {
                code,
                type: "PERCENTAGE",
                value: 50, // 50% off
                description: "Early Bird - 50% off for 3 months",
                validUntil: addMonths(new Date(), 1), // Valid for 1 month to register
                maxUses: 1, // Single use
                applicablePlans: ["STARTER", "PRO"], // Not for FREE plan
                waitinglistId: waitinglistId,
            },
        });

        return discountCode;
    },

    /**
     * Validate discount code
     */
    async validateCode(code: string, plan: string, amount: number) {
        console.log("ini dis")

        const discount = await db.discountCode.findUnique({
            where: { code: code.toUpperCase() },
            include: { usages: true },
        });

        if (!discount) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Kode diskon tidak valid",
            });
        }

        // Check if active
        if (!discount.isActive) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Kode diskon tidak aktif",
            });
        }

        // Check validity period
        const now = new Date();
        if (discount.validFrom > now) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Kode diskon belum berlaku",
            });
        }

        if (discount.validUntil && discount.validUntil < now) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Kode diskon sudah kadaluarsa",
            });
        }

        // Check usage limit
        if (discount.maxUses && discount.currentUses >= discount.maxUses) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Kode diskon sudah mencapai batas penggunaan",
            });
        }

        // Check applicable plans
        if (
            discount.applicablePlans.length > 0 &&
            !discount.applicablePlans.includes(plan)
        ) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Kode diskon tidak berlaku untuk plan ${plan}`,
            });
        }

        // Check minimum purchase
        if (discount.minPurchaseAmount && amount < discount.minPurchaseAmount) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Minimum pembelian Rp ${discount.minPurchaseAmount.toLocaleString("id-ID")}`,
            });
        }

        return discount;
    },

    /**
     * Apply discount code
     */
    async applyDiscount(
        code: string,
        userId: string,
        plan: string,
        amount: number
    ) {
        // Validate code first
        const discount = await this.validateCode(code, plan, amount);

        // Check if user already used this discount
        const existingUsage = await db.discountUsage.findUnique({
            where: {
                discountId_userId: {
                    discountId: discount.id,
                    userId: userId,
                },
            },
        });

        if (existingUsage) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Anda sudah menggunakan kode diskon ini",
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === "PERCENTAGE") {
            discountAmount = (amount * discount.value) / 100;
        } else {
            discountAmount = Math.min(discount.value, amount);
        }

        const finalAmount = amount - discountAmount;

        // Create usage record and update counter in transaction
        const [usage] = await db.$transaction([
            db.discountUsage.create({
                data: {
                    discountId: discount.id,
                    userId: userId,
                    orderAmount: amount,
                    discountAmount: discountAmount,
                },
            }),
            db.discountCode.update({
                where: { id: discount.id },
                data: { currentUses: { increment: 1 } },
            }),
        ]);

        return {
            discount,
            discountAmount,
            finalAmount,
            usage,
        };
    },

    /**
     * Calculate discount preview (without applying)
     */
    calculateDiscount(discount: any, amount: number) {
        let discountAmount = 0;

        if (discount.type === "PERCENTAGE") {
            discountAmount = (amount * discount.value) / 100;
        } else {
            discountAmount = Math.min(discount.value, amount);
        }

        return {
            originalAmount: amount,
            discountAmount,
            finalAmount: amount - discountAmount,
            discountPercentage: (discountAmount / amount) * 100,
        };
    },

    /**
     * Get user's available discounts
     */
    async getUserDiscounts(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                discountUsage: {
                    include: {
                        discount: true,
                    },
                },
            },
        });

        if (!user) return [];

        // Get used discount IDs
        const usedDiscountIds = user.discountUsage.map((u) => u.discountId);

        // Find available discounts
        const availableDiscounts = await db.discountCode.findMany({
            where: {
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [
                    { validUntil: null },
                    { validUntil: { gte: new Date() } },
                ],
                AND: [
                    {
                        OR: [
                            { maxUses: null },
                            { currentUses: { lt: db.discountCode.fields.maxUses } },
                        ],
                    },
                    {
                        id: { notIn: usedDiscountIds },
                    },
                ],
            },
        });

        return availableDiscounts;
    },
};