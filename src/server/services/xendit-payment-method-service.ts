import axios, { type AxiosInstance } from 'axios';
import { TRPCError } from '@trpc/server';
import { db } from '@/server/db';

interface PaymentMethodParams {
    type: 'CARD' | 'EWALLET' | 'DIRECT_DEBIT';
    reusability: 'ONE_TIME_USE' | 'MULTIPLE_USE';
    customerId: string;
    description?: string;
    metadata?: Record<string, any>;
    card?: {
        currency: string;
        channelProperties: {
            successReturnUrl: string;
            failureReturnUrl: string;
            skipThreeDSecure?: boolean;
        };
    };
    ewallet?: {
        channelCode: 'OVO' | 'DANA' | 'SHOPEEPAY' | 'LINKAJA' | 'ASTRAPAY' | 'SAKUKU';
        channelProperties: {
            successReturnUrl: string;
            failureReturnUrl: string;
            cancelReturnUrl?: string;
            mobileNumber?: string;
            cashtag?: string;
        };
    };
    directDebit?: {
        channelCode: 'BCA_KLIKPAY' | 'BCA_ONEKLIK' | 'BRI' | 'MANDIRI' | 'BNI' | 'RCBC' | 'UBP' | 'CHINABANK';
        channelProperties: {
            successReturnUrl: string;
            failureReturnUrl: string;
            mobileNumber?: string;
            cardLastFour?: string;
            cardExpiry?: string;
            email?: string;
        };
    };
}

interface PaymentMethodResponse {
    id: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'FAILED';
    reusability: string;
    customerId: string;
    actions?: Array<{
        action: string;
        method: string;
        url: string;
        urlType: string;
    }>;
    description?: string;
    created: string;
    updated: string;
    metadata?: Record<string, any>;
    billingInformation?: {
        country: string;
    };
    failureCode?: string;
    ewallet?: {
        channelCode: string;
        channelProperties: {
            id: string;
            cashtag?: string;
        };
        account: {
            name: string;
            accountDetails: string;
            balance: number;
            currency: string;
        };
    };
    directDebit?: {
        channelCode: string;
        channelProperties: Record<string, any>;
        type: string;
        bankAccount?: {
            bankAccountHash: string;
            maskedBankAccountNumber: string;
        };
        debitCard?: {
            maskedDebitCardNumber: string;
        };
    };
    card?: {
        currency: string;
        channelProperties: {
            skipThreeDSecure: boolean;
        };
        cardInformation: {
            tokenId: string;
            maskedCardNumber: string;
            expiryMonth: string;
            expiryYear: string;
            cardholderName: string;
            fingerprint: string;
            type: string;
            network: string;
            country: string;
            issuer: string;
        };
    };
}

class XenditPaymentMethodService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.XENDIT_API_URL || 'https://api.xendit.co',
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
                'Content-Type': 'application/json',
                'X-API-VERSION': '2020-10-31'
            },
            timeout: 30000
        });
    }

    /**
     * Create a payment method
     */
    async createPaymentMethod(params: PaymentMethodParams): Promise<PaymentMethodResponse> {
        try {
            const response = await this.api.post('/v2/payment_methods', params);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to create payment method',
                cause: error.response?.data
            });
        }
    }

    /**
     * Get a payment method by ID
     */
    async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodResponse> {
        try {
            const response = await this.api.get(`/v2/payment_methods/${paymentMethodId}`);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: error.response?.data?.message || 'Payment method not found',
            });
        }
    }

    /**
     * List all payment methods for a customer
     */
    async listPaymentMethods(customerId: string): Promise<PaymentMethodResponse[]> {
        try {
            const response = await this.api.get('/v2/payment_methods', {
                params: { customerId }
            });
            return response.data.data || [];
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to list payment methods',
            });
        }
    }

    /**
     * Expire a payment method
     */
    async expirePaymentMethod(paymentMethodId: string): Promise<PaymentMethodResponse> {
        try {
            const response = await this.api.post(`/v2/payment_methods/${paymentMethodId}/expire`);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to expire payment method',
            });
        }
    }

    /**
     * Create payment method for recurring
     */
    async createRecurringPaymentMethod(params: {
        userId: string;
        customerId: string;
        type: 'CARD' | 'EWALLET' | 'DIRECT_DEBIT';
        channelCode?: string;
    }) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const externalId = `pm_${params.userId}_${Date.now()}`;

        const paymentMethodParams: PaymentMethodParams = {
            type: params.type,
            reusability: 'MULTIPLE_USE',
            customerId: params.customerId,
            description: 'Auto-renewal payment method',
            metadata: {
                userId: params.userId,
                purpose: 'recurring_subscription'
            }
        };

        // Configure based on type
        if (params.type === 'CARD') {
            paymentMethodParams.card = {
                currency: 'IDR',
                channelProperties: {
                    successReturnUrl: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}`,
                    failureReturnUrl: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}`,
                    skipThreeDSecure: false
                }
            };
        } else if (params.type === 'EWALLET' && params.channelCode) {
            paymentMethodParams.ewallet = {
                channelCode: params.channelCode as any,
                channelProperties: {
                    successReturnUrl: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}`,
                    failureReturnUrl: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}`,
                    cancelReturnUrl: `${baseUrl}/billing/payment-methods/cancel?external_id=${externalId}`
                }
            };
        } else if (params.type === 'DIRECT_DEBIT' && params.channelCode) {
            paymentMethodParams.directDebit = {
                channelCode: params.channelCode as any,
                channelProperties: {
                    successReturnUrl: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}`,
                    failureReturnUrl: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}`
                }
            };
        }

        const paymentMethod = await this.createPaymentMethod(paymentMethodParams);

        // Save to database
        await db.paymentMethod.create({
            data: {
                userId: params.userId,
                xenditPaymentMethodId: paymentMethod.id,
                type: params.type,
                channelCode: params.channelCode,
                status: 'PENDING_ACTIVATION',
                isDefault: false,
                metadata: JSON.parse(JSON.stringify(paymentMethod))
            }
        });

        // Find authorization URL
        const authAction = paymentMethod.actions?.find(
            action => action.action === 'AUTH' || action.action === 'PRESENT_TO_CUSTOMER'
        );

        return {
            paymentMethodId: paymentMethod.id,
            authUrl: authAction?.url,
            status: paymentMethod.status,
            externalId
        };
    }

    /**
     * Update default payment method
     */
    async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
        // Reset all to non-default
        await db.paymentMethod.updateMany({
            where: { userId },
            data: { isDefault: false }
        });

        // Set new default
        const updated = await db.paymentMethod.update({
            where: {
                userId,
                xenditPaymentMethodId: paymentMethodId
            },
            data: { isDefault: true }
        });

        return updated;
    }

    /**
     * Remove payment method
     */
    async removePaymentMethod(userId: string, paymentMethodId: string) {
        // Check if it's being used in active recurring
        const activeRecurring = await db.recurringPlan.findFirst({
            where: {
                userId,
                paymentMethodId,
                status: 'ACTIVE'
            }
        });

        if (activeRecurring) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot remove payment method that is being used for active subscription'
            });
        }

        // Expire in Xendit
        await this.expirePaymentMethod(paymentMethodId);

        // Update in database
        await db.paymentMethod.update({
            where: {
                userId,
                xenditPaymentMethodId: paymentMethodId
            },
            data: {
                status: 'EXPIRED',
                expiredAt: new Date()
            }
        });

        return { success: true };
    }

    /**
     * Get user's payment methods
     */
    async getUserPaymentMethods(userId: string) {
        const paymentMethods = await db.paymentMethod.findMany({
            where: {
                userId,
                status: { in: ['ACTIVE', 'PENDING_ACTIVATION'] }
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Enrich with current data from Xendit
        const enriched = await Promise.all(
            paymentMethods.map(async (pm) => {
                try {
                    const xenditData = await this.getPaymentMethod(pm.xenditPaymentMethodId);
                    return {
                        ...pm,
                        xenditData,
                        displayName: this.getPaymentMethodDisplayName(xenditData)
                    };
                } catch (error) {
                    return {
                        ...pm,
                        displayName: 'Unknown Payment Method'
                    };
                }
            })
        );

        return enriched;
    }

    /**
     * Get display name for payment method
     */
    private getPaymentMethodDisplayName(paymentMethod: PaymentMethodResponse): string {
        if (paymentMethod.card) {
            const card = paymentMethod.card.cardInformation;
            return `${card.network} •••• ${card.maskedCardNumber.slice(-4)}`;
        }

        if (paymentMethod.ewallet) {
            return `${paymentMethod.ewallet.channelCode} - ${paymentMethod.ewallet.account.name}`;
        }

        if (paymentMethod.directDebit) {
            if (paymentMethod.directDebit.bankAccount) {
                return `${paymentMethod.directDebit.channelCode} •••• ${paymentMethod.directDebit.bankAccount.maskedBankAccountNumber.slice(-4)}`;
            }
            if (paymentMethod.directDebit.debitCard) {
                return `${paymentMethod.directDebit.channelCode} •••• ${paymentMethod.directDebit.debitCard.maskedDebitCardNumber.slice(-4)}`;
            }
        }

        return 'Payment Method';
    }

    /**
     * Handle payment method webhook
     */
    async handleWebhook(event: any) {
        const { event: eventType, data } = event;

        switch (eventType) {
            case 'payment_method.activated':
                await this.handlePaymentMethodActivated(data);
                break;

            case 'payment_method.inactivated':
                await this.handlePaymentMethodInactivated(data);
                break;

            case 'payment_method.failed':
                await this.handlePaymentMethodFailed(data);
                break;

            case 'payment_method.expired':
                await this.handlePaymentMethodExpired(data);
                break;

            default:
                console.log(`[Payment Method] Unhandled event: ${eventType}`);
        }
    }

    private async handlePaymentMethodActivated(param: any) {
        const { data } = param
        await db.paymentMethod.update({
            where: { xenditPaymentMethodId: data.id },
            data: {
                status: 'ACTIVE',
                activatedAt: new Date(),
                metadata: data
            }
        });

        // Update recurring plan if this was for recurring
        const metadata = data.metadata || {};
        if (metadata.purpose === 'recurring_subscription' && metadata.userId) {
            await db.recurringPlan.updateMany({
                where: {
                    userId: metadata.userId,
                    status: 'PENDING_ACTIVATION'
                },
                data: {
                    paymentMethodId: data.id,
                    status: 'ACTIVE'
                }
            });
        }
    }

    private async handlePaymentMethodInactivated(param: any) {
        const { data } = param
        await db.paymentMethod.update({
            where: { xenditPaymentMethodId: data.id },
            data: {
                status: 'INACTIVE',
                metadata: data
            }
        });
    }

    private async handlePaymentMethodFailed(param: any) {
        const { data } = param
        await db.paymentMethod.update({
            where: { xenditPaymentMethodId: data.id },
            data: {
                status: 'FAILED',
                failureCode: data.failure_code,
                metadata: data
            }
        });
    }

    private async handlePaymentMethodExpired(param: any) {
        const { data } = param
        await db.paymentMethod.update({
            where: { xenditPaymentMethodId: data.id },
            data: {
                status: 'EXPIRED',
                expiredAt: new Date(),
                metadata: data
            }
        });
    }
}

// Export singleton instance
export const xenditPaymentMethodService = new XenditPaymentMethodService();