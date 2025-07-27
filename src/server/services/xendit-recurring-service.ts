import axios, { type AxiosInstance } from 'axios';
import { TRPCError } from '@trpc/server';
import { db } from '@/server/db';
import { addMonths, format } from 'date-fns';

interface RecurringSchedule {
    reference_id: string;
    interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    interval_count: number;
    total_recurrence?: number;
    anchor_date?: string;
    retry_interval?: 'DAY' | 'WEEK' | 'MONTH';
    retry_interval_count?: number;
    total_retry?: number;
    failed_attempt_notifications?: number[];
}


interface RecurringPlanParams {
    reference_id: string;
    customer_id: string;
    recurring_action: 'PAYMENT';
    currency: string;
    amount: number;
    schedule: RecurringSchedule;
    immediate_action_type?: 'FULL_AMOUNT' | 'OTHER_AMOUNT';
    notification_config?: {
        recurring_created?: string[];
        recurring_succeeded?: string[];
        recurring_failed?: string[];
        locale?: string;
    };
    failed_cycle_action?: 'STOP' | 'IGNORE';
    success_return_url?: string;
    failure_return_url?: string;
    metadata?: Record<string, any>;
}


interface RecurringCycleUpdate {
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
}


class XenditRecurringService {
    private api: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.XENDIT_API_URL || 'https://api.xendit.co';

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`,
                'Content-Type': 'application/json',
                'X-API-VERSION': '2020-10-31'
            },
            timeout: 30000
        });

        // Add request/response interceptors for logging
        this.api.interceptors.request.use(
            (config) => {
                console.log(`[Xendit Recurring] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('[Xendit Recurring] Request error:', error);
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            (response) => {
                console.log(`[Xendit Recurring] Response ${response.status} from ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('[Xendit Recurring] Response error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Create a recurring plan
     */
    async createPlan(params: RecurringPlanParams) {
        try {
            console.log(params)
            const response = await this.api.post('/recurring/plans', params);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to create recurring plan',
                cause: error.response?.data
            });
        }
    }

    /**
     * Get a recurring plan by ID
     */
    async getPlan(planId: string) {
        try {
            const response = await this.api.get(`/recurring/plans/${planId}`);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: error.response?.data?.message || 'Recurring plan not found',
            });
        }
    }

    /**
     * Update a recurring plan
     */
    async updatePlan(planId: string, updates: Partial<RecurringPlanParams>) {
        try {
            const response = await this.api.patch(`/recurring/plans/${planId}`, updates);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to update recurring plan',
            });
        }
    }

    /**
     * Deactivate (stop) a recurring plan
     */
    async deactivatePlan(planId: string) {
        try {
            const response = await this.api.post(`/recurring/plans/${planId}/deactivate`);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to deactivate recurring plan',
            });
        }
    }

    /**
     * Get all cycles for a plan
     */
    async getPlanCycles(planId: string) {
        try {
            const response = await this.api.get(`/recurring/plans/${planId}/cycles`);
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to get plan cycles',
            });
        }
    }

    /**
     * Update a specific cycle (useful for usage-based billing)
     */
    async updateCycle(planId: string, cycleId: string, updates: RecurringCycleUpdate) {
        try {
            const response = await this.api.patch(
                `/recurring/plans/${planId}/cycles/${cycleId}`,
                updates
            );
            return response.data;
        } catch (error: any) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: error.response?.data?.message || 'Failed to update cycle',
            });
        }
    }

    /**
     * Create recurring plan for user subscription
     */
    async createSubscriptionPlan(params: {
        userId: string;
        planId: string;
        customerId: string;
        amount: number;
        period: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'LIFETIME';
        discountCode?: string;
        discountAmount?: number;
    }) {
        const externalId = `sub_${params.userId}_${Date.now()}`;

        const recurringPlan = await this.createPlan({
            reference_id: externalId,
            customer_id: params.customerId,
            recurring_action: 'PAYMENT',
            currency: 'IDR',
            amount: params.amount - (params.discountAmount || 0),
            schedule: {
                reference_id: `schedule_${externalId}`,
                interval: params.period === 'MONTHLY' ? 'MONTH' : 'YEAR',
                interval_count: 1,
                retry_interval: 'DAY',
                retry_interval_count: 3,
                total_retry: 3,
                failed_attempt_notifications: [1, 2, 3]
            },
            immediate_action_type: 'FULL_AMOUNT',
            notification_config: {
                recurring_created: ['EMAIL'],
                recurring_succeeded: ['EMAIL', 'SMS'],
                recurring_failed: ['EMAIL', 'WHATSAPP'],
                locale: 'id'
            },
            failed_cycle_action: 'STOP',
            success_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?type=recurring&plan_id=${externalId}`,
            failure_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/failed?type=recurring&plan_id=${externalId}`,
            metadata: {
                user_id: params.userId,
                plan_id: params.planId,
                discount_code: params.discountCode,
                discount_amount: params.discountAmount
            }
        });

        // Save recurring plan to database
        await db.recurringPlan.create({
            data: {
                userId: params.userId,
                pricingPlanId: params.planId,
                xenditPlanId: recurringPlan.id,
                xenditCustomerId: params.customerId,
                status: 'PENDING_ACTIVATION',
                amount: params.amount,
                discountCode: params.discountCode,
                discountAmount: params.discountAmount,
                metadata: recurringPlan
            }
        });

        // Find activation URL from actions
        const activationAction = recurringPlan.actions?.find(
            (action: any) => action.action === 'AUTH' || action.action === 'PAYMENT_METHOD_BINDING'
        );

        return {
            planId: recurringPlan.id,
            externalId,
            activationUrl: activationAction?.url || recurringPlan.activationUrl,
            status: recurringPlan.status
        };
    }

    /**
     * Handle recurring webhook events
     */
    async handleWebhook(event: any) {
        const { event: eventType, data } = event;


        switch (eventType) {
            case 'recurring.plan.created':
                await this.handlePlanCreated(data);
                break;

            case 'recurring.plan.activated':
                await this.handlePlanActivated(data);
                break;

            case 'recurring.cycle.created':
                await this.handleCycleCreated(data);
                break;

            case 'recurring.cycle.succeeded':
                await this.handleCycleSucceeded(data);
                break;

            case 'recurring.cycle.failed':
                await this.handleCycleFailed(data);
                break;

            case 'recurring.plan.deactivated':
                await this.handlePlanDeactivated(data);
                break;

            default:
                console.log(`[Xendit Recurring] Unhandled event: ${eventType}`);
        }
    }

    /**
     * Handle plan created webhook
     */
    private async handlePlanCreated(param: any) {
        const { data } = param;

        console.log('[Xendit Recurring] Plan created:', data.id);

        await db.recurringPlan.update({
            where: { xenditPlanId: data.id },
            data: {
                status: 'CREATED',
                updatedAt: new Date()
            }
        });
    }

    /**
     * Handle plan activated webhook
     */
    private async handlePlanActivated(param: any) {
        const { data } = param;
        console.log('[Xendit Recurring] Plan activated:', data.id);

        const recurringPlan = await db.recurringPlan.update({
            where: { xenditPlanId: data.id },
            data: {
                status: 'ACTIVE',
                paymentMethodId: data.payment_method_id,
                activatedAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                user: true,
                pricingPlan: true
            }
        });

        // Create or update subscription
        const subscription = await db.subscription.upsert({
            where: { userId: recurringPlan.userId },
            create: {
                userId: recurringPlan.userId,
                pricingPlanId: recurringPlan.pricingPlanId,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: addMonths(
                    new Date(),
                    recurringPlan.pricingPlan.period === 'MONTHLY' ? 1 : 12
                ),
                isRecurring: true,
                recurringPlanId: recurringPlan.id,
                metadata: {
                    xenditPlanId: data.id,
                    paymentMethodId: data.payment_method_id
                }
            },
            update: {
                pricingPlanId: recurringPlan.pricingPlanId,
                status: 'ACTIVE',
                isRecurring: true,
                recurringPlanId: recurringPlan.id,
                currentPeriodEnd: addMonths(
                    new Date(),
                    recurringPlan.pricingPlan.period === 'MONTHLY' ? 1 : 12
                ),
                metadata: {
                    xenditPlanId: data.id,
                    paymentMethodId: data.payment_methods?.payment_method_id
                }
            }
        });

        // Send notification email
        await this.sendActivationEmail(recurringPlan);
    }

    /**
     * Handle cycle created webhook
     */
    private async handleCycleCreated(param: any) {
        const { data } = param;
        console.log('[Xendit Recurring] Cycle created:', data.id);

        // Store cycle info for tracking
        await db.recurringCycle.create({
            data: {
                cycleId: data.id,
                planId: data.plan_id,
                amount: data.amount,
                currency: data.currency,
                status: 'SCHEDULED',
                scheduledAt: new Date(data.scheduled_timestamp),
                cycleNumber: data.cycle_number,
                metadata: data
            }
        });
    }

    /**
     * Handle cycle succeeded webhook
     */
    private async handleCycleSucceeded(param: any) {
        const { data } = param;
        console.log('[Xendit Recurring] Cycle succeeded:', data.id);

        const metadata = data.metadata || {};

        // Create payment record
        await db.payment.create({
            data: {
                userId: metadata.userId,
                planId: metadata.planId,
                externalId: `recurring_${data.id}`,
                xenditRecurringId: data.plan_id,
                recurringCycleId: data.id,
                isRecurring: true,
                amount: data.amount,
                currency: data.currency,
                status: 'SUCCESS',
                paidAt: new Date(),
                paymentMethod: 'RECURRING',
                paymentChannel: data.payment_method?.type,
                metadata: data
            }
        });

        // Update cycle status
        await db.recurringCycle.update({
            where: { cycleId: data.id },
            data: {
                status: 'SUCCEEDED',
                succeededAt: new Date()
            }
        });

        // Extend subscription
        const subscription = await db.subscription.findFirst({
            where: {
                userId: metadata.userId,
                isRecurring: true
            },
            include: { pricingPlan: true }
        });

        if (subscription) {
            const extensionMonths = subscription.pricingPlan?.period === 'MONTHLY' ? 1 : 12;
            const newEndDate = addMonths(
                subscription.currentPeriodEnd || new Date(),
                extensionMonths
            );

            await db.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentPeriodEnd: newEndDate,
                    status: 'ACTIVE',
                    lastPaymentAt: new Date()
                }
            });

            // Send success notification
            await this.sendPaymentSuccessEmail(subscription, data);
        }
    }

    /**
     * Handle cycle failed webhook
     */
    private async handleCycleFailed(data: any) {
        console.log('[Xendit Recurring] Cycle failed:', data.id);

        // Update cycle status
        await db.recurringCycle.update({
            where: { cycleId: data.id },
            data: {
                status: 'FAILED',
                failedAt: new Date(),
                failureReason: data.failure_reason
            }
        });

        // Send failure notification
        const metadata = data.metadata || {};
        if (metadata.userId) {
            await this.sendPaymentFailedEmail(metadata.userId, data);
        }
    }

    /**
     * Handle plan deactivated webhook
     */
    private async handlePlanDeactivated(data: any) {
        console.log('[Xendit Recurring] Plan deactivated:', data.id);

        const recurringPlan = await db.recurringPlan.update({
            where: { xenditPlanId: data.id },
            data: {
                status: 'INACTIVE',
                deactivatedAt: new Date()
            }
        });

        // Update subscription
        await db.subscription.update({
            where: {
                userId: recurringPlan.userId,
                recurringPlanId: recurringPlan.id
            },
            data: {
                isRecurring: false,
                cancelAtPeriodEnd: true
            }
        });
    }

    /**
     * Pause a recurring plan
     */
    async pausePlan(planId: string) {
        try {
            // Note: Xendit API doesn't have direct pause, we deactivate and can reactivate later
            const response = await this.deactivatePlan(planId);

            await db.recurringPlan.update({
                where: { xenditPlanId: planId },
                data: {
                    status: 'PAUSED',
                    pausedAt: new Date()
                }
            });

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Resume a recurring plan
     */
    async resumePlan(userId: string) {
        // For resume, we need to create a new plan with same details
        const pausedPlan = await db.recurringPlan.findFirst({
            where: {
                userId,
                status: 'PAUSED'
            },
            include: {
                pricingPlan: true,
                user: true
            }
        });

        if (!pausedPlan) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No paused plan found'
            });
        }

        // Create new recurring plan
        return this.createSubscriptionPlan({
            userId: pausedPlan.userId,
            planId: pausedPlan.pricingPlanId,
            customerId: pausedPlan.xenditCustomerId,
            amount: pausedPlan.amount,
            period: pausedPlan.pricingPlan?.period,
            discountCode: pausedPlan.discountCode || undefined,
            discountAmount: pausedPlan.discountAmount || undefined
        });
    }

    /**
     * Send activation email
     */
    private async sendActivationEmail(recurringPlan: any) {
        // Implement email sending logic
        console.log(`[Email] Sending activation email to user ${recurringPlan.userId}`);
    }

    /**
     * Send payment success email
     */
    private async sendPaymentSuccessEmail(subscription: any, paymentData: any) {
        // Implement email sending logic
        console.log(`[Email] Sending payment success email to user ${subscription.userId}`);
    }

    /**
     * Send payment failed email
     */
    private async sendPaymentFailedEmail(userId: string, failureData: any) {
        // Implement email sending logic
        console.log(`[Email] Sending payment failed email to user ${userId}`);
    }
}

// Export singleton instance
export const xenditRecurringService = new XenditRecurringService();