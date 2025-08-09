import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { xenditService } from "@/server/services/xendit-service";
import { discountService } from "@/server/services/discount-service";
import type { PaymentWithPlan } from "@/types/billing.type";
import { xenditRecurringService } from "@/server/services/xendit-recurring-service";
import { UserService } from "@/server/services/user-service";

const userService = new UserService()

export const billingRouter = createTRPCRouter({
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        const subscription = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id },
            include: {
                pricingPlan: true,
                user: {
                    include: {
                        integration: true
                    }
                }
            },
        });

        if (!subscription) {
            return null;
        }

        return {
            ...subscription,
            isActive: subscription.status === "ACTIVE",
            daysRemaining: subscription.currentPeriodEnd
                ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : null,
        };
    }),

    // Get available plans for upgrade
    getUpgradePlans: protectedProcedure.query(async ({ ctx }) => {
        const currentSub = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id },
            include: { pricingPlan: true },
        });

        const allPlans = await ctx.db.pricingPlan.findMany({
            where: { isActive: true },
            orderBy: { price: "asc" },
        });

        // Filter plans that are upgrades
        const currentPrice = currentSub?.pricingPlan?.price || 0;
        const upgradePlans = allPlans.filter(plan => plan.price > currentPrice);

        return upgradePlans.map(plan => ({
            ...plan,
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
            isCurrentPlan: plan.id === currentSub?.pricingPlanId,
            priceIncrease: plan.price - currentPrice,
        }));
    }),

    // Create payment invoice
    createInvoice: protectedProcedure
        .input(
            z.object({
                planId: z.string(),
                discountCode: z.string().optional(),
                enableRecurring: z.boolean().default(false),
                isReplace: z.boolean().default(false),
                paymentMethod: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {

            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { id: true, email: true, name: true },
            });

            if (!user || !user.email) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User email is required",
                });
            }

            const plan = await ctx.db.pricingPlan.findUnique({
                where: { id: input.planId },
            });

            if (!plan) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Plan not found",
                });
            }

            // Check if already on this plan
            const currentSub = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id },
            });

            if (!input.isReplace) {
                if (currentSub?.pricingPlanId === input.planId) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "You are already on this plan",
                    });
                }
            }

            let FEE = 5000
            if (plan.price > 500000) {
                FEE = 10000
            }

            let finalAmount = plan.price + FEE;
            let discountAmount = 0;

            // Apply discount if provided
            if (input.discountCode) {
                const discountResult = await discountService.applyDiscount(
                    input.discountCode,
                    ctx.session.user.id,
                    plan.name,
                    plan.price
                );
                finalAmount = discountResult.finalAmount;
                discountAmount = discountResult.discountAmount;
            }

            if (input.enableRecurring) {
                // Create or get Xendit customer
                const customer = await xenditService.createOrGetCustomer({
                    referenceId: user.id,
                    givenNames: user.name || "Customer",
                    email: user.email,
                });

                if (!customer) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Failed Get Customer",
                    });
                }
                const recurringResult = await xenditRecurringService.createSubscriptionPlan({
                    userId: user.id,
                    planId: plan.id,
                    customerId: customer.id,
                    amount: process.env.NODE_ENV === "development" ? 13579 : finalAmount,
                    period: plan.period,
                    discountCode: input.discountCode,
                    discountAmount,
                });

                return {
                    type: "recurring",
                    planId: recurringResult.planId,
                    externalId: recurringResult.externalId,
                    activationUrl: recurringResult.activationUrl,
                    status: recurringResult.status,
                };

            } else {
                // Create invoice
                const paymentMethods = [
                    input.paymentMethod!
                ]
                const invoice = await xenditService.createInvoice({
                    userId: ctx.session.user.id,
                    planId: plan.id,
                    amount: finalAmount,
                    discountCode: input.discountCode,
                    discountAmount,
                    paymentMethods: paymentMethods,
                    description: `Upgrade to ${plan.displayName} Plan`,
                });

                // TODO : NOTIF send invoice to take action to pay
                return {
                    type: "invoice",
                    ...invoice,
                };
            }
        }),

    // Create payment invoice
    createRenewalInvoice: protectedProcedure
        .input(
            z.object({
                planId: z.string(),
                paymentMethod: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {

            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { id: true, email: true, name: true },
            });

            if (!user || !user.email) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "User email is required",
                });
            }

            const plan = await ctx.db.pricingPlan.findUnique({
                where: { id: input.planId },
            });

            if (!plan) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Plan not found",
                });
            }

            // Check if already on this plan
            const currentSub = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id },
            });

            if (currentSub?.pricingPlanId !== input.planId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Plan is not same",
                });
            }

            let FEE = 5000
            if (plan.price > 500000) {
                FEE = 10000
            }

            let finalAmount = plan.price + FEE;
            let discountAmount = 0;


            // Create invoice
            const paymentMethods = [
                input.paymentMethod!
            ]
            const invoice = await xenditService.createInvoice({
                userId: ctx.session.user.id,
                planId: plan.id,
                amount: finalAmount,
                discountAmount,
                paymentMethods: paymentMethods,
                description: `Renewal ${plan.displayName} Plan`,
                isRenewal: true,
            });

            // TODO : NOTIF send invoice to take action to pay
            return {
                type: "invoice",
                ...invoice,
            };
        }
        ),

    upgradeWithSavedMethod: protectedProcedure
        .input(z.object({
            planId: z.string(),
            discountCode: z.string().optional(),
            paymentMethodId: z.string(),
            enableRecurring: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            // Logic untuk upgrade menggunakan saved payment method
        }),

    getRecurringStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const recurringPlan = await ctx.db.recurringPlan.findFirst({
                where: {
                    userId: ctx.session.user.id,
                    status: { in: ['ACTIVE', 'PAUSED', 'PENDING_ACTIVATION'] }
                },
                include: {
                    pricingPlan: true,
                }
            });

            if (!recurringPlan) {
                return null;
            }

            // Get next charge date from Xendit
            let nextChargeDate = null;
            try {
                const xenditPlan = await xenditRecurringService.getPlan(recurringPlan.xenditPlanId);
                const cycles = await xenditRecurringService.getPlanCycles(recurringPlan.xenditPlanId);

                // Find next scheduled cycle
                const nextCycle = cycles.data?.find((cycle: any) =>
                    cycle.status === 'SCHEDULED'
                );

                if (nextCycle) {
                    nextChargeDate = new Date(nextCycle.scheduled_timestamp);
                }
            } catch (error) {
                console.error('Failed to get Xendit plan details:', error);
            }

            // recurringPlan.metadata bisa berupa object plan dari Xendit, bukan array actions
            // Ambil actions dari metadata jika ada, lalu cari activation action
            let activationAction = null;
            if (recurringPlan.metadata && typeof recurringPlan.metadata === 'object' && recurringPlan.metadata !== null) {
                const actions = (recurringPlan.metadata as any).actions;
                if (Array.isArray(actions)) {
                    activationAction = actions.find(
                        (action: any) => action.action === 'AUTH' || action.action === 'PAYMENT_METHOD_BINDING'
                    );
                }
            }


            return {
                id: recurringPlan.id,
                status: recurringPlan.status,
                plan: recurringPlan.pricingPlan,
                amount: recurringPlan.amount,
                discountAmount: recurringPlan.discountAmount,
                paymentMethod: recurringPlan.paymentMethodId,
                activatedAt: recurringPlan.activatedAt,
                activationUrl: activationAction?.url,
                nextChargeDate,
            };
        }),

    pauseRecurring: protectedProcedure
        .mutation(async ({ ctx }) => {
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

            // Pause in Xendit
            await xenditRecurringService.pausePlan(recurringPlan.xenditPlanId);

            // Update subscription
            await ctx.db.subscription.update({
                where: { userId: ctx.session.user.id },
                data: {
                    cancelAtPeriodEnd: true
                }
            });

            return {
                success: true,
                message: "Recurring subscription paused successfully"
            };
        }),

    resumeRecurring: protectedProcedure
        .mutation(async ({ ctx }) => {
            const result = await xenditRecurringService.resumePlan(ctx.session.user.id);

            return {
                success: true,
                message: "Please complete payment method setup to resume your subscription",
                activationUrl: result.activationUrl
            };
        }),

    // Get recurring history
    getRecurringHistory: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(10),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const [cycles, total] = await Promise.all([
                ctx.db.recurringCycle.findMany({
                    where: {
                        planId: {
                            in: await ctx.db.recurringPlan
                                .findMany({
                                    where: { userId: ctx.session.user.id },
                                    select: { xenditPlanId: true }
                                })
                                .then(plans => plans.map(p => p.xenditPlanId))
                        }
                    },
                    orderBy: { scheduledAt: 'desc' },
                    take: input.limit,
                    skip: input.offset,
                }),
                ctx.db.recurringCycle.count({
                    where: {
                        planId: {
                            in: await ctx.db.recurringPlan
                                .findMany({
                                    where: { userId: ctx.session.user.id },
                                    select: { xenditPlanId: true }
                                })
                                .then(plans => plans.map(p => p.xenditPlanId))
                        }
                    }
                })
            ]);

            return {
                cycles,
                total,
                hasMore: input.offset + input.limit < total
            };
        }),
    hasActiveRecurring: protectedProcedure
        .query(async ({ ctx }) => {
            const activeRecurring = await ctx.db.recurringPlan.findFirst({
                where: {
                    userId: ctx.session.user.id,
                    status: 'ACTIVE'
                }
            });

            return {
                hasActive: !!activeRecurring,
                planId: activeRecurring?.xenditPlanId
            };
        }),

    // Get payment history
    getPaymentHistory: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).default(10),
                offset: z.number().default(0),
            })
        )
        .query(async ({ ctx, input }) => {
            const [payments, total] = await Promise.all([
                ctx.db.payment.findMany({
                    where: { userId: ctx.session.user.id },
                    include: {
                        plan: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: input.limit,
                    skip: input.offset,
                }),
                ctx.db.payment.count({
                    where: { userId: ctx.session.user.id },
                }),
            ]);

            return {
                payments,
                total,
                hasMore: input.offset + input.limit < total,
            };
        }),

    // Cancel subscription
    cancelSubscription: protectedProcedure
        .input(
            z.object({
                reason: z.string().optional(),
                feedback: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id },
            });

            if (!subscription) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No active subscription found",
                });
            }

            // Mark for cancellation at period end
            await ctx.db.subscription.update({
                where: { id: subscription.id },
                data: {
                    cancelAtPeriodEnd: true,
                },
            });

            // Log cancellation reason
            if (input.reason || input.feedback) {
                await ctx.db.notification.create({
                    data: {
                        userId: ctx.session.user.id,
                        content: `Cancellation reason: ${input.reason || "Not specified"}. Feedback: ${input.feedback || "None"}`,
                        channel: 'email'
                    },
                });
            }

            return {
                success: true,
                message: "Subscription will be cancelled at the end of current period",
                endDate: subscription.currentPeriodEnd,
            };
        }),

    freeSubscribtion: protectedProcedure
        .mutation(async ({ ctx, input }) => {
            const subscription = await ctx.db.subscription.findUnique({
                where: { userId: ctx.session.user.id },
            });

            if (!subscription) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No active subscription found",
                });
            }

            userService.changeToFreePlan(ctx.session.user.id);

            return {
                success: true,
                message: "Success",
                endDate: subscription.currentPeriodEnd,
            };
        }),


    // Resume cancelled subscription
    resumeSubscription: protectedProcedure.mutation(async ({ ctx }) => {
        const subscription = await ctx.db.subscription.findUnique({
            where: { userId: ctx.session.user.id },
        });

        if (!subscription || !subscription.cancelAtPeriodEnd) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No cancelled subscription to resume",
            });
        }

        await ctx.db.subscription.update({
            where: { id: subscription.id },
            data: {
                cancelAtPeriodEnd: false,
            },
        });

        return {
            success: true,
            message: "Subscription resumed successfully",
        };
    }),

    // Get available payment methods
    getPaymentMethods: protectedProcedure.query(async () => {
        const methods = await xenditService.getAvailablePaymentMethods();
        // console.log(methods)

        // return methods.map((method: any) => ({
        //     type: method.type,
        //     name: method.displayName,
        //     logo: method.logo,
        //     enabled: method.status === "ACTIVE",
        // }));
        return methods
    }),

    // Simulate payment (dev only)
    simulatePayment: protectedProcedure
        .input(z.object({ invoiceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (process.env.NODE_ENV !== "development") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only available in development",
                });
            }

            await xenditService.simulatePayment(input.invoiceId);
            return { success: true };
        }),
    getPaymentByExternalId: protectedProcedure
        .input(z.object({
            externalId: z.string().min(1, "External ID is required")
        }))
        .query(async ({ ctx, input }): Promise<PaymentWithPlan> => {
            console.log('Looking for payment with externalId:', input.externalId);

            const payment = await ctx.db.payment.findFirst({
                where: {
                    externalId: input.externalId,
                    userId: ctx.session.user.id
                },
                include: {
                    plan: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            price: true,
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            console.log('Payment found:', payment);

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Payment with external ID ${input.externalId} not found for this user`,
                });
            }

            return payment as PaymentWithPlan;
        }),

    // Get payment by invoice ID  
    getPaymentByInvoiceId: protectedProcedure
        .input(z.object({
            invoiceId: z.string().min(1, "Invoice ID is required")
        }))
        .query(async ({ ctx, input }): Promise<PaymentWithPlan | null> => {
            console.log('Looking for payment with invoiceId:', input.invoiceId);

            const payment = await ctx.db.payment.findFirst({
                where: {
                    xenditInvoiceId: input.invoiceId,
                    userId: ctx.session.user.id
                },
                include: {
                    plan: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            price: true,
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });

            console.log('Payment found by invoice:', payment);
            return payment as PaymentWithPlan | null;
        }),

    verifyPaymentStatus: protectedProcedure
        .input(z.object({
            externalId: z.string().optional(),
            invoiceId: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            if (!input.externalId && !input.invoiceId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Either externalId or invoiceId must be provided",
                });
            }

            const where = input.externalId
                ? { externalId: input.externalId }
                : { xenditInvoiceId: input.invoiceId };

            const payment = await ctx.db.payment.findFirst({
                where: {
                    ...where,
                    userId: ctx.session.user.id
                },
                include: {
                    plan: true,
                }
            });

            if (!payment) {
                return { status: 'NOT_FOUND' };
            }

            // If payment is successful, also return subscription info
            if (payment.status === 'SUCCESS') {
                const subscription = await ctx.db.subscription.findUnique({
                    where: { userId: ctx.session.user.id },
                    include: { pricingPlan: true }
                });

                return {
                    status: payment.status,
                    payment,
                    subscription
                };
            }

            return {
                status: payment.status,
                payment
            };
        }),
    retryPayment: protectedProcedure
        .input(z.object({
            originalExternalId: z.string(),
            discountCode: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Get original payment details
            const originalPayment = await ctx.db.payment.findFirst({
                where: {
                    externalId: input.originalExternalId,
                    userId: ctx.session.user.id
                },
                include: { plan: true }
            });

            if (!originalPayment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Original payment not found",
                });
            }

            if (originalPayment.status === 'SUCCESS') {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot retry successful payment",
                });
            }

            // Create new invoice with same details
            const invoice = await xenditService.createInvoice({
                userId: ctx.session.user.id,
                planId: originalPayment.planId!,
                amount: originalPayment.amount,
                discountCode: input.discountCode || originalPayment.discountCode!,
                discountAmount: originalPayment.discountAmount || 0,
                description: `Retry payment for ${originalPayment.plan?.displayName} Plan`,
            });

            return invoice;
        }),
    markPaymentAbandoned: protectedProcedure
        .input(z.object({
            externalId: z.string(),
            reason: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const payment = await ctx.db.payment.findFirst({
                where: {
                    externalId: input.externalId,
                    userId: ctx.session.user.id,
                    status: { in: ['PENDING', 'FAILED'] }
                }
            });

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Payment not found or already processed",
                });
            }

            await ctx.db.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'ABANDONED',
                    metadata: {
                        ...payment.metadata as any,
                        abandonReason: input.reason,
                        abandonedAt: new Date().toISOString(),
                    }
                }
            });

            return { success: true };
        }),

    getPaymentStats: protectedProcedure
        .input(z.object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
        }))
        .query(async ({ ctx, input }) => {
            // const isAdmin = ctx.session.user.role === 'ADMIN'; // Adjust based on your role system

            const where = {
                ...(input.startDate && input.endDate && {
                    createdAt: {
                        gte: input.startDate,
                        lte: input.endDate,
                    }
                }),
                // ...(!isAdmin && { userId: ctx.session.user.id })
            };

            const [
                totalPayments,
                successfulPayments,
                failedPayments,
                pendingPayments,
                totalRevenue
            ] = await Promise.all([
                ctx.db.payment.count({ where }),
                ctx.db.payment.count({ where: { ...where, status: 'SUCCESS' } }),
                ctx.db.payment.count({ where: { ...where, status: 'FAILED' } }),
                ctx.db.payment.count({ where: { ...where, status: 'PENDING' } }),
                ctx.db.payment.aggregate({
                    where: { ...where, status: 'SUCCESS' },
                    _sum: { amount: true }
                })
            ]);

            const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

            return {
                totalPayments,
                successfulPayments,
                failedPayments,
                pendingPayments,
                totalRevenue: totalRevenue._sum.amount || 0,
                successRate: Math.round(successRate * 100) / 100,
            };
        }),

    sendPaymentReceipt: protectedProcedure
        .input(z.object({ paymentId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const payment = await ctx.db.payment.findFirst({
                where: {
                    id: input.paymentId,
                    userId: ctx.session.user.id,
                    status: 'SUCCESS'
                },
                include: {
                    plan: true,
                    user: true
                }
            });

            if (!payment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Payment not found or not successful",
                });
            }

            // Here you would integrate with your email service
            // For example, using Resend, SendGrid, or similar
            try {
                // await emailService.sendPaymentReceipt({
                //     to: payment.user.email,
                //     payment: payment,
                //     plan: payment.plan
                // });

                // For now, just log
                console.log(`Payment receipt would be sent to ${payment.user.email} for payment ${payment.id}`);

                return { success: true, message: 'Receipt sent successfully' };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to send receipt",
                });
            }
        }),

    getPaymentMethodStats: protectedProcedure
        .query(async ({ ctx }) => {
            const stats = await ctx.db.payment.groupBy({
                by: ['paymentMethod'],
                where: {
                    paymentMethod: { not: null },
                    userId: ctx.session.user.id // Only user's own data unless admin
                },
                _count: {
                    _all: true,
                },
                _sum: {
                    amount: true,
                }
            });

            const successStats = await ctx.db.payment.groupBy({
                by: ['paymentMethod'],
                where: {
                    paymentMethod: { not: null },
                    status: 'SUCCESS',
                    userId: ctx.session.user.id
                },
                _count: {
                    _all: true,
                }
            });

            // Combine stats
            const combined = stats.map(stat => {
                const successStat = successStats.find(s => s.paymentMethod === stat.paymentMethod);
                const successCount = successStat?._count._all || 0;
                const totalCount = stat._count._all;
                const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

                return {
                    paymentMethod: stat.paymentMethod,
                    totalTransactions: totalCount,
                    successfulTransactions: successCount,
                    totalAmount: stat._sum.amount || 0,
                    successRate: Math.round(successRate * 100) / 100,
                };
            });

            return combined.sort((a, b) => b.totalTransactions - a.totalTransactions);
        }),

});