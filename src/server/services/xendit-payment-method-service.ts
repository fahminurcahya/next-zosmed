import axios, { type AxiosInstance } from 'axios';
import { TRPCError } from '@trpc/server';
import { db } from '@/server/db';

interface PaymentMethodParams {
    type: 'CARD' | 'EWALLET' | 'DIRECT_DEBIT';
    reusability: 'ONE_TIME_USE' | 'MULTIPLE_USE';
    customer_id: string;
    description?: string;
    country?: string
    metadata?: Record<string, any>;
    card?: {
        currency: string;
        token_id: string;
        authentication_3ds_id: string | undefined;
        channel_properties?: {
            success_return_url: string;
            failure_return_url: string;
            skip_three_d_secure?: boolean;
        };
    };
    ewallet?: {
        channel_code: 'OVO' | 'DANA' | 'SHOPEEPAY' | 'LINKAJA' | 'ASTRAPAY' | 'SAKUKU';
        channel_properties: {
            success_return_url: string;
            failure_return_url: string;
            cancel_return_url?: string;
            mobile_number?: string;
            cashtag?: string;
        };
    };
    direct_debit?: {
        channel_code: 'BCA_KLIKPAY' | 'BCA_ONEKLIK' | 'BRI' | 'MANDIRI' | 'BNI' | 'RCBC' | 'UBP' | 'CHINABANK';
        channel_properties: {
            success_return_url: string;
            failure_return_url: string;
            mobile_number?: string;
            card_last_four?: string;
            card_expiry?: string;
            email?: string;
        };
    };
}

interface PaymentMethodResponse {
    id: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'FAILED';
    reusability: string;
    customer_id: string;
    actions?: Array<{
        action: string;
        method: string;
        url: string;
        url_type: string;
    }>;
    description?: string;
    created: string;
    updated: string;
    metadata?: Record<string, any>;
    billing_information?: {
        country: string;
    };
    failure_code?: string;
    ewallet?: {
        channel_code: string;
        channel_properties: {
            id: string;
            cashtag?: string;
        };
        account: {
            name: string;
            account_details: string;
            balance: number;
            currency: string;
        };
    };
    direct_debit?: {
        channel_code: string;
        channel_properties: Record<string, any>;
        type: string;
        bank_account?: {
            bank_account_hash: string;
            masked_bank_account_number: string;
        };
        debit_card?: {
            masked_debit_card_number: string;
        };
    };
    card?: {
        currency: string;
        channel_properties: {
            skip_three_d_secure: boolean;
        };
        card_information: {
            token_id: string;
            masked_card_number: string;
            expiry_month: string;
            expiry_year: string;
            cardholder_name: string;
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

        // For CARD type, we need to use Xendit's tokenization flow
        if (params.type === 'CARD') {
            try {
                // Create a setup intent for card tokenization
                const response = await this.api.post('/v2/credit_card_tokens/authentication_setups', {
                    amount: 10000, // Minimum amount for authentication
                    currency: 'IDR',
                    channel_properties: {
                        success_return_url: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}&type=card`,
                        failure_return_url: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}&type=card`,
                        cancel_return_url: `${baseUrl}/billing/payment-methods/cancel?external_id=${externalId}&type=card`
                    },
                    capture_method: 'MANUAL',
                    customer_id: params.customerId,
                    description: 'Setup payment method for recurring subscription',
                    metadata: {
                        userId: params.userId,
                        purpose: 'recurring_subscription',
                        externalId
                    }
                });

                // Save pending payment method
                await db.paymentMethod.create({
                    data: {
                        userId: params.userId,
                        xenditPaymentMethodId: externalId, // Temporary, will be updated after tokenization
                        type: 'CARD',
                        channelCode: 'CARD',
                        status: 'PENDING_ACTIVATION',
                        isDefault: false,
                        metadata: {
                            setupId: response.data.id,
                            ...response.data
                        }
                    }
                });

                return {
                    paymentMethodId: externalId,
                    authUrl: response.data.actions?.find((a: any) => a.action === 'PRESENT_CARD_DETAILS')?.url || response.data.url,
                    status: 'PENDING',
                    externalId
                };
            } catch (error: any) {
                console.error('Card tokenization setup error:', error.response?.data);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.response?.data?.message || 'Failed to setup card tokenization',
                    cause: error.response?.data
                });
            }
        }

        // For non-card payment methods (existing code)
        const paymentMethodParams: PaymentMethodParams = {
            type: params.type,
            reusability: 'MULTIPLE_USE',
            customer_id: params.customerId,
            country: "ID",
            description: 'Auto-renewal payment method',
            metadata: {
                userId: params.userId,
                purpose: 'recurring_subscription',
                externalId
            }
        };

        // Configure based on type
        if (params.type === 'EWALLET' && params.channelCode) {
            paymentMethodParams.ewallet = {
                channel_code: params.channelCode as any,
                channel_properties: {
                    success_return_url: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}`,
                    failure_return_url: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}`,
                    cancel_return_url: `${baseUrl}/billing/payment-methods/cancel?external_id=${externalId}`
                }
            };
        } else if (params.type === 'DIRECT_DEBIT' && params.channelCode) {
            paymentMethodParams.direct_debit = {
                channel_code: params.channelCode as any,
                channel_properties: {
                    success_return_url: `${baseUrl}/billing/payment-methods/success?external_id=${externalId}`,
                    failure_return_url: `${baseUrl}/billing/payment-methods/failed?external_id=${externalId}`
                }
            };
        }

        console.log(paymentMethodParams)

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

    async handleCardTokenCallback(params: {
        userId: string;
        tokenId: string;
        externalId: string;
        authentication3dsId?: string;
    }) {
        try {
            // Get customer
            const customer = await db.user.findUnique({
                where: { id: params.userId },
                select: { id: true, email: true }
            });

            if (!customer) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found'
                });
            }

            // Create payment method with the token
            const paymentMethodParams: PaymentMethodParams = {
                type: 'CARD',
                reusability: 'MULTIPLE_USE',
                customer_id: customer.id,
                description: 'Auto-renewal payment method',
                card: {
                    currency: 'IDR',
                    token_id: params.tokenId,
                    authentication_3ds_id: params.authentication3dsId
                },
                metadata: {
                    userId: params.userId,
                    purpose: 'recurring_subscription',
                    externalId: params.externalId
                }
            };

            const paymentMethod = await this.createPaymentMethod(paymentMethodParams);

            // Update the pending payment method
            await db.paymentMethod.update({
                where: {
                    userId: params.userId,
                    xenditPaymentMethodId: params.externalId
                },
                data: {
                    xenditPaymentMethodId: paymentMethod.id,
                    status: paymentMethod.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_ACTIVATION',
                    activatedAt: paymentMethod.status === 'ACTIVE' ? new Date() : null,
                    metadata: JSON.parse(JSON.stringify(paymentMethod))
                }
            });

            return paymentMethod;
        } catch (error: any) {
            console.error('Card payment method creation error:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to create card payment method',
                cause: error.response?.data
            });
        }
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
            const card = paymentMethod.card.card_information;
            return `${card.network} •••• ${card.masked_card_number.slice(-4)}`;
        }

        if (paymentMethod.ewallet) {
            return `${paymentMethod.ewallet.channel_code} - ${paymentMethod.ewallet.account.name}`;
        }

        if (paymentMethod.direct_debit) {
            if (paymentMethod.direct_debit.bank_account) {
                return `${paymentMethod.direct_debit.channel_code} •••• ${paymentMethod.direct_debit.bank_account.masked_bank_account_number.slice(-4)}`;
            }
            if (paymentMethod.direct_debit.debit_card) {
                return `${paymentMethod.direct_debit.channel_code} •••• ${paymentMethod.direct_debit.debit_card.masked_debit_card_number.slice(-4)}`;
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