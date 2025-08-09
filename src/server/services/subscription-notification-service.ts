// server/api/services/subscription-notification.service.ts
import { db } from "@/server/db";
import { SubscriptionStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";

// Types for notification data
export interface NotificationData {
    userId: string;
    type: 'expiry_warning' | 'expiry_today' | 'past_due' | 'inactive';
    daysRemaining?: number;
    subscriptionId: string;
}

export interface ProcessSubscriptionResult {
    success: boolean;
    processed: {
        expiringIn3Days: number;
        expiringToday: number;
        markedPastDue: number;
        markedInactive: number;
        totalNotifications: number;
    };
    notifications: NotificationData[];
    error?: string;
}

export class SubscriptionNotificationService {
    /**
     * Morning cron job: Send notifications only (no status updates)
     */
    static async processMorningNotifications(): Promise<ProcessSubscriptionResult> {
        try {
            const today = new Date();
            const threeDaysFromNow = addDays(today, 3);
            const threeDaysAgo = subDays(today, 3);

            const notifications: NotificationData[] = [];

            // 1. Find subscribers expiring in 3 days
            const expiringIn3Days = await db.subscription.findMany({
                where: {
                    currentPeriodEnd: {
                        gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
                        lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999))
                    },
                    status: SubscriptionStatus.ACTIVE,
                    plan: {
                        in: ['STARTER', 'PRO'] // Only paid plans
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // 2. Find subscribers expiring today
            const expiringToday = await db.subscription.findMany({
                where: {
                    currentPeriodEnd: {
                        gte: new Date(today.setHours(0, 0, 0, 0)),
                        lt: new Date(today.setHours(23, 59, 59, 999))
                    },
                    status: SubscriptionStatus.ACTIVE,
                    plan: {
                        in: ['STARTER', 'PRO']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // 3. Find subscriptions that became inactive today (for final notification)
            const inactiveToday = await db.subscription.findMany({
                where: {
                    currentPeriodEnd: {
                        gte: new Date(threeDaysAgo.setHours(0, 0, 0, 0)),
                        lt: new Date(threeDaysAgo.setHours(23, 59, 59, 999))
                    },
                    status: SubscriptionStatus.INACTIVE,
                    plan: {
                        in: ['STARTER', 'PRO']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Process 3-day expiry warnings
            for (const subscription of expiringIn3Days) {
                notifications.push({
                    userId: subscription.user!.id,
                    type: 'expiry_warning',
                    daysRemaining: 3,
                    subscriptionId: subscription.id
                });

                await this.createNotification({
                    userId: subscription.user!.id,
                    channel: 'email',
                    title: 'Your ZosMed subscription expires in 3 days',
                    content: `Hi ${subscription.user!.name}, your ${subscription.plan} plan will expire on ${subscription.currentPeriodEnd?.toLocaleDateString()}. Renew now to continue enjoying all features.`,
                    metadata: {
                        type: 'expiry_warning',
                        subscriptionId: subscription.id,
                        daysRemaining: 3,
                        userEmail: subscription.user!.email,
                        cronType: 'morning'
                    }
                });
            }

            // Process same-day expiry
            for (const subscription of expiringToday) {
                notifications.push({
                    userId: subscription.user!.id,
                    type: 'expiry_today',
                    daysRemaining: 0,
                    subscriptionId: subscription.id
                });

                await this.createNotification({
                    userId: subscription.user!.id,
                    channel: 'email',
                    title: 'Your ZosMed subscription expires today',
                    content: `Hi ${subscription.user!.name}, your ${subscription.plan} plan expires today. Renew immediately to avoid service interruption.`,
                    metadata: {
                        type: 'expiry_today',
                        subscriptionId: subscription.id,
                        userEmail: subscription.user!.email,
                        cronType: 'morning'
                    }
                });
            }

            // Process inactive today notifications (final notice)
            for (const subscription of inactiveToday) {
                notifications.push({
                    userId: subscription.user!.id,
                    type: 'inactive',
                    subscriptionId: subscription.id
                });

                await this.createNotification({
                    userId: subscription.user!.id,
                    channel: 'email',
                    title: 'Final notice: Your ZosMed subscription is now inactive',
                    content: `Hi ${subscription.user!.name}, your ${subscription.plan} subscription has been inactive for 3 days. Your account has been downgraded to the FREE plan. You can still reactivate by renewing your subscription.`,
                    metadata: {
                        type: 'inactive',
                        subscriptionId: subscription.id,
                        userEmail: subscription.user!.email,
                        cronType: 'morning'
                    }
                });
            }

            return {
                success: true,
                processed: {
                    expiringIn3Days: expiringIn3Days.length,
                    expiringToday: expiringToday.length,
                    markedPastDue: 0, // No status updates in morning job
                    markedInactive: 0, // No status updates in morning job
                    totalNotifications: notifications.length
                },
                notifications
            };

        } catch (error) {
            console.error('Morning notification processing error:', error);
            return {
                success: false,
                processed: {
                    expiringIn3Days: 0,
                    expiringToday: 0,
                    markedPastDue: 0,
                    markedInactive: 0,
                    totalNotifications: 0
                },
                notifications: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Evening cron job: Update subscription statuses only
     */
    static async processEveningStatusUpdates(): Promise<ProcessSubscriptionResult> {
        try {
            const today = new Date();
            const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));

            const notifications: NotificationData[] = [];

            // 1. Find expired subscriptions that should be marked as PAST_DUE
            const shouldBePastDue = await db.subscription.findMany({
                where: {
                    currentPeriodEnd: {
                        lt: today
                    },
                    status: SubscriptionStatus.ACTIVE,
                    plan: {
                        in: ['STARTER', 'PRO']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // 2. Find subscriptions that are 3+ days past due and should be INACTIVE
            const shouldBeInactive = await db.subscription.findMany({
                where: {
                    currentPeriodEnd: {
                        lt: threeDaysAgo
                    },
                    status: {
                        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE]
                    },
                    plan: {
                        in: ['STARTER', 'PRO']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Update expired subscriptions to PAST_DUE and send notifications
            for (const subscription of shouldBePastDue) {
                await db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: SubscriptionStatus.PAST_DUE,
                        updatedAt: new Date()
                    }
                });

                notifications.push({
                    userId: subscription.user!.id,
                    type: 'past_due',
                    subscriptionId: subscription.id
                });

                await this.createNotification({
                    userId: subscription.user!.id,
                    channel: 'email',
                    title: 'Your ZosMed subscription is past due',
                    content: `Hi ${subscription.user!.name}, your ${subscription.plan} plan has expired. Please renew your subscription to restore access to all features.`,
                    metadata: {
                        type: 'past_due',
                        subscriptionId: subscription.id,
                        userEmail: subscription.user!.email,
                        cronType: 'evening'
                    }
                });
            }

            // Update past due subscriptions to INACTIVE
            for (const subscription of shouldBeInactive) {
                await db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: SubscriptionStatus.INACTIVE,
                        updatedAt: new Date()
                    }
                });

                notifications.push({
                    userId: subscription.user!.id,
                    type: 'inactive',
                    subscriptionId: subscription.id
                });

                // Note: Notification for inactive status will be sent in morning job
            }

            return {
                success: true,
                processed: {
                    expiringIn3Days: 0, // No notifications in evening job
                    expiringToday: 0, // No notifications in evening job
                    markedPastDue: shouldBePastDue.length,
                    markedInactive: shouldBeInactive.length,
                    totalNotifications: notifications.length
                },
                notifications
            };

        } catch (error) {
            console.error('Evening status update processing error:', error);
            return {
                success: false,
                processed: {
                    expiringIn3Days: 0,
                    expiringToday: 0,
                    markedPastDue: 0,
                    markedInactive: 0,
                    totalNotifications: 0
                },
                notifications: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process notifications for a specific user
     */
    static async processUserSubscription(userId: string): Promise<ProcessSubscriptionResult> {
        try {
            const subscription = await db.subscription.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!subscription || subscription.plan === 'FREE') {
                return {
                    success: true,
                    processed: {
                        expiringIn3Days: 0,
                        expiringToday: 0,
                        markedPastDue: 0,
                        markedInactive: 0,
                        totalNotifications: 0
                    },
                    notifications: []
                };
            }

            const today = new Date();
            const notifications: NotificationData[] = [];
            let statusChanged = false;
            let newStatus = subscription.status;

            // Check if subscription should be past due
            if (subscription.currentPeriodEnd &&
                subscription.currentPeriodEnd < today &&
                subscription.status === SubscriptionStatus.ACTIVE) {
                newStatus = SubscriptionStatus.PAST_DUE;
                statusChanged = true;
            }

            // Check if subscription should be inactive (3+ days past due)
            const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));
            if (subscription.currentPeriodEnd &&
                subscription.currentPeriodEnd < threeDaysAgo &&
                (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.PAST_DUE)) {
                newStatus = SubscriptionStatus.INACTIVE;
                statusChanged = true;
            }

            if (statusChanged) {
                await db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: newStatus,
                        updatedAt: new Date()
                    }
                });

                const notificationType = newStatus === SubscriptionStatus.PAST_DUE ? 'past_due' : 'inactive';

                notifications.push({
                    userId: subscription.user!.id,
                    type: notificationType,
                    subscriptionId: subscription.id
                });

                await this.createNotification({
                    userId: subscription.user!.id,
                    channel: 'email',
                    title: `Your ZosMed subscription is ${newStatus.toLowerCase().replace('_', ' ')}`,
                    content: this.getStatusChangeMessage(subscription.user!.name!, newStatus, subscription.plan),
                    metadata: {
                        type: notificationType,
                        subscriptionId: subscription.id,
                        userEmail: subscription.user!.email,
                        oldStatus: subscription.status,
                        newStatus
                    }
                });
            }

            return {
                success: true,
                processed: {
                    expiringIn3Days: 0,
                    expiringToday: 0,
                    markedPastDue: newStatus === SubscriptionStatus.PAST_DUE ? 1 : 0,
                    markedInactive: newStatus === SubscriptionStatus.INACTIVE ? 1 : 0,
                    totalNotifications: notifications.length
                },
                notifications
            };

        } catch (error) {
            console.error('User subscription processing error:', error);
            return {
                success: false,
                processed: {
                    expiringIn3Days: 0,
                    expiringToday: 0,
                    markedPastDue: 0,
                    markedInactive: 0,
                    totalNotifications: 0
                },
                notifications: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Helper method to create notifications
     */
    private static async createNotification({
        userId,
        channel,
        title,
        content,
        metadata
    }: {
        userId: string;
        channel: string;
        title: string;
        content: string;
        metadata?: Record<string, any>;
    }) {
        try {
            await db.notification.create({
                data: {
                    userId,
                    channel,
                    title,
                    content,
                    metadata: metadata || {},
                    status: 'pending'
                }
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    }

    /**
     * Helper method to get status change message
     */
    private static getStatusChangeMessage(userName: string, status: SubscriptionStatus, plan: string): string {
        switch (status) {
            case SubscriptionStatus.PAST_DUE:
                return `Hi ${userName}, your ${plan} plan has expired. Please renew your subscription to restore access to all features.`;
            case SubscriptionStatus.INACTIVE:
                return `Hi ${userName}, your ${plan} subscription has been deactivated due to non-payment. Your account has been downgraded to the FREE plan.`;
            default:
                return `Hi ${userName}, your subscription status has been updated.`;
        }
    }

    /**
     * Get subscription expiry information for a user
     */
    static async getUserExpiryInfo(userId: string) {
        const subscription = await db.subscription.findUnique({
            where: { userId },
            include: {
                pricingPlan: true
            }
        });

        if (!subscription || subscription.plan === 'FREE') {
            return {
                hasSubscription: false,
                plan: 'FREE',
                status: null,
                daysUntilExpiry: null,
                isExpiring: false,
                isExpired: false
            };
        }

        const today = new Date();
        const daysUntilExpiry = subscription.currentPeriodEnd
            ? Math.ceil((subscription.currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null;

        return {
            hasSubscription: true,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            daysUntilExpiry,
            isExpiring: daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0,
            isExpired: daysUntilExpiry !== null && daysUntilExpiry <= 0,
            pricingPlan: subscription.pricingPlan
        };
    }
}