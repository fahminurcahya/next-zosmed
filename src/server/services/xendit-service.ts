import { Xendit } from 'xendit-node';
import { TRPCError } from "@trpc/server";
import { addMonths, addDays } from "date-fns";

import type { CreateInvoiceRequest } from 'xendit-node/invoice/models';
import { db } from '../db';
import { da } from 'date-fns/locale';
import { xenditRecurringService } from './xendit-recurring-service';
import { xenditPaymentMethodService } from './xendit-payment-method-service';

// Initialize Xendit client
const xendit = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY!,
});

// Get API clients
const { Invoice: invoiceClient } = xendit;
const { PaymentMethod: paymentMethodClient } = xendit;
const { Customer: customerClient } = xendit;
const { Balance: balanceClient } = xendit;
const { Payout: payoutClient } = xendit;


// Types
export interface CreateInvoiceParams {
    userId: string;
    planId: string;
    amount: number;
    discountCode?: string;
    discountAmount?: number;
    description: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    paymentMethods?: string[];
    customer?: {
        givenNames: string;
        email: string;
        mobileNumber?: string;
    };
    isRenewal?: boolean;
}

export interface CreateRecurringParams {
    userId: string;
    planId: string;
    amount: number;
    interval: "DAY" | "WEEK" | "MONTH";
    intervalCount: number;
    description: string;
    currency?: string;
    totalRecurrence?: number;
    missedPaymentAction?: "IGNORE" | "STOP";
}

export interface XenditWebhookEvent {
    id: string;
    created: string;
    businessId: string;
    statusEvent: string;
    event: string;
    data: any;
}

export const xenditService = {
    /**
     * Create one-time payment invoice
     */
    async createInvoice(params: CreateInvoiceParams) {
        const user = await db.user.findUnique({
            where: { id: params.userId },
            include: { subscription: true },
        });

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        const plan = await db.pricingPlan.findUnique({
            where: { id: params.planId },
        });

        if (!plan) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Plan not found",
            });
        }

        // Create or get customer
        const customer = await this.createOrGetCustomer({
            referenceId: user.id,
            givenNames: params.customer?.givenNames || user.name,
            email: params.customer?.email || user.email,
        });

        // Create invoice reference
        let externalId
        if (params.isRenewal) {
            externalId = `REN-${Date.now()}-${user.id}`;
        } else {
            externalId = `INV-${Date.now()}-${user.id}`;
        }
        try {
            const invoiceRequest: CreateInvoiceRequest = {
                externalId,
                amount: params.amount,
                currency: "IDR",
                customer: {
                    id: customer!.id,
                },
                customerNotificationPreference: {
                    invoiceCreated: ["email", "whatsapp"],
                    invoiceReminder: ["email", "whatsapp"],
                    invoicePaid: ["email", "whatsapp"],
                },
                description: params.description,
                invoiceDuration: parseInt(process.env.XENDIT_INVOICE_DURATION || "86400"), // 24 hours in seconds
                successRedirectUrl: params.successRedirectUrl
                    || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?external_id=${externalId}&invoice_id={id}`,
                failureRedirectUrl: params.failureRedirectUrl
                    || `${process.env.NEXT_PUBLIC_APP_URL}/billing/failed?external_id=${externalId}&invoice_id={id}`,
                paymentMethods: params.paymentMethods || [
                    "CREDIT_CARD",
                    "BCA",
                    "BNI",
                    "BSI",
                    "BRI",
                    "MANDIRI",
                    "PERMATA",
                    "ALFAMART",
                    "INDOMARET",
                    "OVO",
                    "DANA",
                    "SHOPEEPAY",
                    "LINKAJA",
                    "QRIS",
                ],
                items: [
                    {
                        name: plan.displayName,
                        quantity: 1,
                        price: plan.price,
                        category: "DIGITAL_PRODUCT",
                        url: process.env.NEXT_PUBLIC_APP_URL,
                    },
                ],
                fees: [
                    {
                        type: "Admin Fee",
                        value: 5000,
                    },
                ],
            };

            // Apply discount if exists
            if (params.discountAmount && params.discountAmount > 0) {
                invoiceRequest.items?.push({
                    name: `Discount${params.discountCode ? ` - ${params.discountCode}` : ''}`,
                    quantity: 1,
                    price: -params.discountAmount,
                    category: "DIGITAL_PRODUCT",
                });
            }

            const invoice = await invoiceClient.createInvoice({
                data: invoiceRequest,
            });

            // Store payment record
            await db.payment.create({
                data: {
                    userId: params.userId,
                    planId: params.planId,
                    externalId,
                    xenditInvoiceId: invoice.id,
                    xenditInvoiceUrl: invoice.invoiceUrl,
                    amount: params.amount,
                    status: "PENDING",
                    discountCode: params.discountCode,
                    discountAmount: params.discountAmount,
                    metadata: {
                        planName: plan.displayName,
                        userEmail: user.email,
                        customerId: customer!.id,
                    },
                },
            });

            return {
                invoiceId: invoice.id,
                invoiceUrl: invoice.invoiceUrl,
                externalId,
                amount: params.amount,
                expiryDate: invoice.expiryDate,
                availableBanks: invoice.availableBanks,
                availableRetailOutlets: invoice.availableRetailOutlets,
                availableEwallets: invoice.availableEwallets,
                availableQrCodes: invoice.availableQrCodes,
            };
        } catch (error: any) {
            console.error("Xendit create invoice error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to create payment invoice",
            });
        }
    },

    /**
     * Create or get Xendit customer
     */
    async createOrGetCustomer(params: {
        referenceId: string;
        givenNames: string;
        email: string;
        mobileNumber?: string;
    }) {
        try {
            // Try to get existing customer
            console.log("referenceId")
            console.log(params.referenceId)
            const customers = await customerClient.getCustomerByReferenceID({
                referenceId: params.referenceId,
            });

            if (customers.data && customers.data.length > 0) {
                return customers.data[0];
            }
            const data = {
                referenceId: params.referenceId,
                clientName: params.givenNames,
                email: params.email,
                mobileNumber: params.mobileNumber,
                type: "INDIVIDUAL",
            }
            console.log(data)

            // Create new customer
            const customer = await customerClient.createCustomer({
                data: {
                    referenceId: params.referenceId,
                    email: params.email,
                    mobileNumber: params.mobileNumber,
                    individualDetail: {
                        givenNames: params.givenNames
                    },
                    type: "INDIVIDUAL",
                },
            });

            return customer;
        } catch (error: any) {
            console.error("Xendit customer error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create customer",
            });
        }
    },

    /**
     * Update Xendit customer phone number
     */
    async updateCustomer(params: {
        id: string;
        mobileNumber: string;
    }) {
        try {
            return await customerClient.updateCustomer({
                id: params.id,
                data: {
                    mobileNumber: params.mobileNumber,
                },
            });

        } catch (error: any) {
            console.error("Xendit update customer error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update customer",
            });
        }
    },

    /**
     * Get invoice by ID
     */
    async getInvoice(invoiceId: string) {
        try {
            const invoice = await invoiceClient.getInvoiceById({
                invoiceId,
            });
            return invoice;
        } catch (error: any) {
            console.error("Get invoice error:", error);
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invoice not found",
            });
        }
    },

    /**
     * Expire invoice
     */
    async expireInvoice(invoiceId: string) {
        try {
            const invoice = await invoiceClient.expireInvoice({
                invoiceId,
            });
            return invoice;
        } catch (error: any) {
            console.error("Expire invoice error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to expire invoice",
            });
        }
    },

    /**
     * Get balance
     */
    async getBalance(accountType: "CASH" | "HOLDING" | "TAX" = "CASH") {
        try {
            const balance = await balanceClient.getBalance({
                accountType,
            });
            return balance;
        } catch (error: any) {
            console.error("Get balance error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get balance",
            });
        }
    },

    /**
     * Create payout (disbursement)
     */
    async createPayout(params: {
        externalId: string;
        amount: number;
        channelCode: string;
        channelProperties: {
            accountNumber: string;
            accountHolderName: string;
        };
        description: string;
        currency?: string;
        referenceId?: string;
    }) {
        try {
            const payout = await payoutClient.createPayout({
                idempotencyKey: "todo",
                data: {
                    referenceId: params.referenceId || params.externalId,
                    channelCode: params.channelCode,
                    channelProperties: params.channelProperties,
                    amount: params.amount,
                    currency: params.currency || "IDR",
                    description: params.description,
                    metadata: {
                        externalId: params.externalId,
                    },
                },
            });
            return payout;
        } catch (error: any) {
            console.error("Create payout error:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message || "Failed to create payout",
            });
        }
    },

    /**
     * Get available payment methods
     */
    async getAvailablePaymentMethods(params?: {
        currency?: string;
        amount?: number;
        country?: string;
    }) {
        try {
            const paymentMethods = await paymentMethodClient.getAllPaymentMethods();
            // console.log("paymentMethods")
            // console.log(paymentMethods)

            // // Group by type
            // const grouped = paymentMethods.data?.reduce((acc: any, method: any) => {
            //     const type = method.type;
            //     if (!acc[type]) acc[type] = [];
            //     acc[type].push({
            //         id: method.id,
            //         type: method.type,
            //         name: method.name || method.type,
            //         channelCode: method.channelCode,
            //         isActivated: method.status === "ACTIVE",
            //         logo: method.logo,
            //     });
            //     return acc;
            // }, {} as Record<string, any[]>) || {};
            // // console.log(grouped)

            // return grouped;
            return paymentMethods.data;
        } catch (error: any) {
            console.error("Get payment methods error:", error);
            return {};
        }
    },

    /**
     * Handle webhook callback
     */
    async handleWebhook(event: XenditWebhookEvent) {
        const { statusEvent: eventStatus, data, event: eventType } = event;

        // Handle payment method events
        if (eventType?.startsWith('payment_method.')) {
            return xenditPaymentMethodService.handleWebhook({
                event: eventType,
                data: data
            });
        }

        if (eventType?.startsWith('recurring.')) {
            return xenditRecurringService.handleWebhook({
                event: eventType,
                data
            });
        }

        switch (eventStatus) {
            case "PAID":
                return this.handleInvoicePaid(data);
            case "EXPIRED":
                return this.handleInvoiceExpired(data);
            case "FAILED":
                return this.handlePaymentFailed(data);
            case "payouts.completed":
                return this.handlePayoutCompleted(data);
            case "payouts.failed":
                return this.handlePayoutFailed(data);
            default:
                console.log("Unhandled webhook event:", eventType);
        }
    },

    /**
     * Handle paid invoice
     */
    async handleInvoicePaid(invoice: any) {
        const payment = await db.payment.findUnique({
            where: { xenditInvoiceId: invoice.id },
            include: {
                user: true,
                plan: true,
            },
        });

        if (!payment) {
            console.error("Payment not found for invoice:", invoice.id);
            return;
        }

        // Update payment record
        await db.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                paidAt: new Date(invoice.paid_at),
                paymentMethod: invoice.payment_method,
                paymentChannel: invoice.payment_channel,
                metadata: {
                    ...payment.metadata as any,
                    xenditPaymentId: invoice.payment_id,
                    xenditPaymentDetails: invoice.payment_details,
                },
            },
        });

        // Cek apakah invoice.external_id diawali dengan "REN"
        if (invoice.external_id && invoice.external_id.startsWith("REN")) {
            // Ini adalah pembayaran renewal, bisa tambahkan logika khusus jika diperlukan
            const subscription = await db.subscription.findFirst({
                where: {
                    userId: payment.userId,
                },
            });
            if (!subscription) {
                console.error("Subscription not found for user:", payment.userId);
                return;
            }

            const currentPeriodEnd = subscription!.currentPeriodEnd!
            const endDate = payment.plan?.period === "YEARLY"
                ? addMonths(currentPeriodEnd, 12)
                : payment.plan?.period === "QUARTERLY"
                    ? addMonths(currentPeriodEnd, 3)
                    : addMonths(currentPeriodEnd, 1);


            // Cek apakah currentPeriodEnd lebih besar dari sekarang
            const now = new Date();
            const dmResetDate = currentPeriodEnd > now ? subscription.dmResetDate : endDate;

            let currentDMCount, currentAICount
            if (currentPeriodEnd > now) {
                currentDMCount = subscription.currentDMCount
                currentAICount = subscription.currentAICount
            } else {
                currentDMCount = 0
                currentAICount = 0
            }

            await db.subscription.update({
                where: { userId: payment.userId },
                data: {
                    pricingPlanId: payment.planId,
                    plan: payment.plan?.name as any,
                    status: "ACTIVE",
                    currentPeriodEnd: endDate,
                    dmResetDate: dmResetDate,
                    currentDMCount: currentDMCount,
                    currentAICount: currentAICount,

                },
            });

            // TODO : NOTIF send
            // Send notification
            await db.notification.create({
                data: {
                    userId: payment.userId,
                    content: `Renewal payment successful! Your ${payment.plan?.displayName} plan has been extended.`,
                    channel: 'email'
                },
            });

        } else {
            // Update user subscription
            const currentDate = new Date();
            const endDate = payment.plan?.period === "YEARLY"
                ? addMonths(currentDate, 12)
                : payment.plan?.period === "QUARTERLY"
                    ? addMonths(currentDate, 3)
                    : addMonths(currentDate, 1);

            await db.subscription.upsert({
                where: { userId: payment.userId },
                update: {
                    pricingPlanId: payment.planId,
                    plan: payment.plan?.name as any,
                    status: "ACTIVE",
                    currentPeriodEnd: endDate,
                    dmResetDate: endDate,
                    cancelAtPeriodEnd: false,
                    maxAccounts: payment.plan?.maxAccounts || 1,
                    maxDMPerMonth: payment.plan?.maxDMPerMonth || 50,
                    currentDMCount: 0,
                    currentAICount: 0,
                    maxAIReplyPerMonth: payment.plan?.maxAIReplyPerMonth || 20,
                    hasAIReply: (payment.plan?.maxAIReplyPerMonth || 0) > 0,
                },
                create: {
                    userId: payment.userId,
                    pricingPlanId: payment.planId,
                    plan: payment.plan?.name as any,
                    status: "ACTIVE",
                    currentPeriodEnd: endDate,
                    dmResetDate: endDate,
                    maxAccounts: payment.plan?.maxAccounts || 1,
                    maxDMPerMonth: payment.plan?.maxDMPerMonth || 50,
                    maxAIReplyPerMonth: payment.plan?.maxAIReplyPerMonth || 20,
                    hasAIReply: (payment.plan?.maxAIReplyPerMonth || 0) > 0,
                },
            });

            // TODO : NOTIF send
            // Send notification
            await db.notification.create({
                data: {
                    userId: payment.userId,
                    content: `Payment successful! Your ${payment.plan?.displayName} plan is now active.`,
                    channel: 'email'
                },
            });
        }
        console.log(`Payment processed for user ${payment.userId}, plan ${payment.planId}`);
    },

    /**
     * Handle expired invoice
     */
    async handleInvoiceExpired(invoice: any) {
        await db.payment.update({
            where: { xenditInvoiceId: invoice.id },
            data: {
                status: "EXPIRED",
                expiredAt: new Date(),
            },
        });
        // TODO : NOTIF expired
    },

    /**
     * Handle payment failed
     */
    async handlePaymentFailed(data: any) {
        const { invoice_id, failure_code, failure_message } = data;

        await db.payment.update({
            where: { xenditInvoiceId: invoice_id },
            data: {
                status: "FAILED",
                metadata: {
                    failureCode: failure_code,
                    failureMessage: failure_message,
                },
            },
        });
    },

    /**
     * Handle payout completed
     */
    async handlePayoutCompleted(data: any) {
        console.log("Payout completed:", data.id);
        // Update payout record
    },

    /**
     * Handle payout failed
     */
    async handlePayoutFailed(data: any) {
        console.log("Payout failed:", data.id, data.failure_code);
        // Update payout record
    },

    /**
     * Verify webhook notification
     */
    verifyWebhookNotification(
        webhookToken: string,
        requestBody: string,
        xCallbackToken?: string
    ): boolean {
        if (!xCallbackToken) return false;

        // Xendit sends the webhook token as x-callback-token header
        // Compare it with your stored webhook token
        return webhookToken === xCallbackToken;
    },

    /**
     * Simulate payment (for testing in development)
     */
    async simulatePayment(invoiceId: string) {
        if (process.env.NODE_ENV !== "development") {
            throw new Error("Simulation only available in development");
        }

        try {
            // Get invoice first
            const invoice = await this.getInvoice(invoiceId);

            // Manually trigger the paid webhook
            await this.handleInvoicePaid({
                ...invoice,
                status: "PAID",
                paid_at: new Date().toISOString(),
                payment_method: "TEST",
                payment_channel: "TEST_SIMULATOR",
            });

            return { success: true, message: "Payment simulated successfully" };
        } catch (error: any) {
            console.error("Simulate payment error:", error);
            throw error;
        }
    },
};