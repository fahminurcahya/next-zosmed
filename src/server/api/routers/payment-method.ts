import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { xenditPaymentMethodService } from "@/server/services/xendit-payment-method-service";
import { xenditService } from "@/server/services/xendit-service";
import { TRPCError } from "@trpc/server";

export const paymentMethodRouter = createTRPCRouter({
    // List user's payment methods
    list: protectedProcedure
        .query(async ({ ctx }) => {
            const paymentMethods = await xenditPaymentMethodService.getUserPaymentMethods(
                ctx.session.user.id
            );

            return {
                paymentMethods,
                hasActive: paymentMethods.some(pm => pm.status === 'ACTIVE'),
                defaultMethod: paymentMethods.find(pm => pm.isDefault)
            };
        }),

    // Add new payment method
    add: protectedProcedure
        .input(z.object({
            type: z.enum(['CARD', 'EWALLET', 'DIRECT_DEBIT']),
            channelCode: z.string().optional(),
            setAsDefault: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            // Get or create Xendit customer
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id }
            });

            if (!user?.email) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User email is required"
                });
            }

            const customer = await xenditService.createOrGetCustomer({
                referenceId: user.id,
                givenNames: user.name || "Customer",
                email: user.email
            });

            // Create payment method
            const result = await xenditPaymentMethodService.createRecurringPaymentMethod({
                userId: user.id,
                customerId: customer!.id,
                type: input.type,
                channelCode: input.channelCode
            });

            // Set as default if requested
            if (input.setAsDefault && result.paymentMethodId) {
                await xenditPaymentMethodService.setDefaultPaymentMethod(
                    user.id,
                    result.paymentMethodId
                );
            }

            return result;
        }),

    // Set default payment method
    setDefault: protectedProcedure
        .input(z.object({
            paymentMethodId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const updated = await xenditPaymentMethodService.setDefaultPaymentMethod(
                ctx.session.user.id,
                input.paymentMethodId
            );

            return {
                success: true,
                paymentMethod: updated
            };
        }),

    // Remove payment method
    remove: protectedProcedure
        .input(z.object({
            paymentMethodId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            await xenditPaymentMethodService.removePaymentMethod(
                ctx.session.user.id,
                input.paymentMethodId
            );

            return { success: true };
        }),

    // Get payment method by ID
    getById: protectedProcedure
        .input(z.object({
            paymentMethodId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const paymentMethod = await ctx.db.paymentMethod.findFirst({
                where: {
                    xenditPaymentMethodId: input.paymentMethodId,
                    userId: ctx.session.user.id
                }
            });

            if (!paymentMethod) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Payment method not found"
                });
            }

            try {
                const xenditData = await xenditPaymentMethodService.getPaymentMethod(
                    input.paymentMethodId
                );
                return {
                    ...paymentMethod,
                    xenditData
                };
            } catch (error) {
                return paymentMethod;
            }
        }),

    // Check if user has active payment methods
    hasActiveMethod: protectedProcedure
        .query(async ({ ctx }) => {
            const activeMethod = await ctx.db.paymentMethod.findFirst({
                where: {
                    userId: ctx.session.user.id,
                    status: 'ACTIVE'
                }
            });

            return {
                hasActive: !!activeMethod,
                defaultMethodId: activeMethod?.isDefault ? activeMethod.xenditPaymentMethodId : null
            };
        }),

    // Get available payment channels
    getAvailableChannels: protectedProcedure
        .query(async () => {
            return {
                card: {
                    type: 'CARD',
                    name: 'Credit/Debit Card',
                    channels: [
                        { code: 'CARD', name: 'All Cards', logo: '💳' }
                    ]
                },
                ewallet: {
                    type: 'EWALLET',
                    name: 'E-Wallet',
                    channels: [
                        { code: 'OVO', name: 'OVO', logo: '🟣' },
                        { code: 'DANA', name: 'DANA', logo: '🔵' },
                        { code: 'SHOPEEPAY', name: 'ShopeePay', logo: '🟠' },
                        { code: 'LINKAJA', name: 'LinkAja', logo: '🔴' },
                    ]
                },
                directDebit: {
                    type: 'DIRECT_DEBIT',
                    name: 'Bank Transfer',
                    channels: [
                        { code: 'BCA_ONEKLIK', name: 'BCA OneKlik', logo: '🏦' },
                        { code: 'BRI', name: 'BRI Direct Debit', logo: '🏦' },
                        { code: 'MANDIRI', name: 'Mandiri Direct Debit', logo: '🏦' },
                        { code: 'BNI', name: 'BNI Direct Debit', logo: '🏦' }
                    ]
                }
            };
        }),

    // Update payment method for recurring
    updateRecurringPaymentMethod: protectedProcedure
        .input(z.object({
            paymentMethodId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // Find active recurring plan
            const recurringPlan = await ctx.db.recurringPlan.findFirst({
                where: {
                    userId: ctx.session.user.id,
                    status: 'ACTIVE'
                }
            });

            if (!recurringPlan) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No active recurring plan found"
                });
            }

            // Verify payment method belongs to user and is active
            const paymentMethod = await ctx.db.paymentMethod.findFirst({
                where: {
                    xenditPaymentMethodId: input.paymentMethodId,
                    userId: ctx.session.user.id,
                    status: 'ACTIVE'
                }
            });

            if (!paymentMethod) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid or inactive payment method"
                });
            }

            // Update recurring plan
            await ctx.db.recurringPlan.update({
                where: { id: recurringPlan.id },
                data: {
                    paymentMethodId: input.paymentMethodId,
                    updatedAt: new Date()
                }
            });

            // Update in Xendit
            // Note: You might need to call Xendit API to update the payment method
            // for the recurring plan

            return {
                success: true,
                message: "Payment method updated successfully"
            };
        }),
});