import { SubscriptionStatus } from "@prisma/client";
import { db } from "../db";
import { addMonths, endOfDay, startOfDay } from "date-fns";

export interface QuotaResetResult {
    success: boolean;
    processed: {
        billingCycleResets: number;
        monthlyResets: number;
        totalResets: number;
    };
    resets: Array<{
        userId: string;
        subscriptionId: string;
        resetType: 'billing_cycle' | 'monthly';
        oldDMCount: number;
        oldAICount: number;
    }>;
    error?: string;
}

export class QuotaResetService {
    /**
      * Reset kuota berdasarkan billing cycle (RECOMMENDED)
      * Dijalankan setiap hari untuk cek subscription yang perlu direset
      */
    static async processBillingCycleResets(): Promise<QuotaResetResult> {
        try {
            const today = new Date();
            const resets = [];

            const start = startOfDay(today);
            const end = endOfDay(today);

            // Cari subscription yang billing cycle-nya dimulai hari ini
            const subscriptionsToReset = await db.subscription.findMany({
                where: {
                    status: SubscriptionStatus.ACTIVE,
                    plan: { in: ['STARTER', 'PRO'] },
                    dmResetDate: {
                        gte: start,
                        lt: end
                    },
                    currentPeriodEnd: {
                        gt: today
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

            // Reset kuota untuk setiap subscription
            for (const subscription of subscriptionsToReset) {
                const oldDMCount = subscription.currentDMCount;
                const oldAICount = subscription.currentAICount;
                subscription.dmResetDate

                await db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        currentDMCount: 0,
                        currentAICount: 0,
                        dmResetDate: addMonths(subscription.dmResetDate!, 1), // Next month
                        updatedAt: new Date()
                    }
                });

                resets.push({
                    userId: subscription.user!.id,
                    subscriptionId: subscription.id,
                    resetType: 'billing_cycle',
                    oldDMCount,
                    oldAICount
                });

                // Create notification
                await this.createQuotaResetNotification({
                    userId: subscription.user!.id,
                    userName: subscription.user!.name,
                    plan: subscription.plan,
                    resetType: 'billing_cycle',
                    newLimits: {
                        dmLimit: subscription.maxDMPerMonth,
                        aiLimit: subscription.maxAIReplyPerMonth
                    }
                });
            }

            return {
                success: true,
                processed: {
                    billingCycleResets: resets.length,
                    monthlyResets: 0,
                    totalResets: resets.length
                },
                resets: resets as Array<{
                    userId: string;
                    subscriptionId: string;
                    resetType: 'billing_cycle' | 'monthly';
                    oldDMCount: number;
                    oldAICount: number;
                }>
            };

        } catch (error) {
            console.error('Billing cycle quota reset error:', error);
            return {
                success: false,
                processed: {
                    billingCycleResets: 0,
                    monthlyResets: 0,
                    totalResets: 0
                },
                resets: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
    * Reset kuota untuk user tertentu (manual/admin)
    */
    static async resetUserQuota(userId: string, resetType: 'manual' | 'upgrade' = 'manual'): Promise<QuotaResetResult> {
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

            if (!subscription) {
                throw new Error('Subscription not found for user');
            }

            const oldDMCount = subscription.currentDMCount;
            const oldAICount = subscription.currentAICount;

            // Calculate next reset date based on current period
            const nextResetDate = subscription.currentPeriodEnd ||
                addMonths(subscription.dmResetDate!, 1);

            await db.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentDMCount: 0,
                    currentAICount: 0,
                    dmResetDate: nextResetDate,
                    updatedAt: new Date()
                }
            });

            const reset = {
                userId: subscription.user!.id,
                subscriptionId: subscription.id,
                resetType: resetType as 'billing_cycle',
                oldDMCount,
                oldAICount
            };

            // Create notification
            await this.createQuotaResetNotification({
                userId: subscription.user!.id,
                userName: subscription.user!.name,
                plan: subscription.plan,
                resetType: resetType as 'billing_cycle',
                newLimits: {
                    dmLimit: subscription.maxDMPerMonth,
                    aiLimit: subscription.maxAIReplyPerMonth
                }
            });

            return {
                success: true,
                processed: {
                    billingCycleResets: resetType === 'manual' ? 1 : 0,
                    monthlyResets: 0,
                    totalResets: 1
                },
                resets: [reset]
            };

        } catch (error) {
            console.error('User quota reset error:', error);
            return {
                success: false,
                processed: {
                    billingCycleResets: 0,
                    monthlyResets: 0,
                    totalResets: 0
                },
                resets: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
   * Check users yang akan reset dalam X hari (untuk notifikasi advance)
   */
    static async getUpcomingResets(days: number = 3) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        const upcomingResets = await db.subscription.findMany({
            where: {
                status: SubscriptionStatus.ACTIVE,
                plan: { in: ['STARTER', 'PRO'] },
                OR: [
                    // Billing cycle resets
                    {
                        currentPeriodStart: {
                            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
                        }
                    },
                    // Monthly resets (if using dmResetDate)
                    {
                        dmResetDate: {
                            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
                        }
                    }
                ]
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

        return upcomingResets.map(sub => ({
            userId: sub.user!.id,
            userName: sub.user!.name,
            userEmail: sub.user!.email,
            plan: sub.plan,
            currentDMCount: sub.currentDMCount,
            currentAICount: sub.currentAICount,
            maxDMPerMonth: sub.maxDMPerMonth,
            maxAIReplyPerMonth: sub.maxAIReplyPerMonth,
            resetDate: sub.dmResetDate,
            daysUntilReset: days
        }));
    }

    /**
   * Helper: Create quota reset notification
   */
    private static async createQuotaResetNotification({
        userId,
        userName,
        plan,
        resetType,
        newLimits
    }: {
        userId: string;
        userName: string;
        plan: string;
        resetType: string;
        newLimits: {
            dmLimit: number;
            aiLimit: number;
        };
    }) {
        try {
            await db.notification.create({
                data: {
                    userId,
                    channel: 'email',
                    title: 'Your quota has been reset!',
                    content: `Hi ${userName}, your ${plan} plan quota has been reset. You now have ${newLimits.dmLimit} DM credits and ${newLimits.aiLimit} AI reply credits available.`,
                    metadata: {
                        type: 'quota_reset',
                        resetType,
                        newLimits,
                        cronType: 'quota_reset'
                    },
                    status: 'pending'
                }
            });
        } catch (error) {
            console.error('Failed to create quota reset notification:', error);
        }
    }

    /**
   * Get quota usage statistics
   */
    static async getQuotaUsageStats() {
        const stats = await db.subscription.aggregate({
            where: {
                status: SubscriptionStatus.ACTIVE,
                plan: { in: ['STARTER', 'PRO'] }
            },
            _avg: {
                currentDMCount: true,
                currentAICount: true
            },
            _sum: {
                currentDMCount: true,
                currentAICount: true,
                maxDMPerMonth: true,
                maxAIReplyPerMonth: true
            },
            _count: true
        });

        const usageByPlan = await db.subscription.groupBy({
            by: ['plan'],
            where: {
                status: SubscriptionStatus.ACTIVE,
                plan: { in: ['STARTER', 'PRO'] }
            },
            _avg: {
                currentDMCount: true,
                currentAICount: true
            },
            _sum: {
                currentDMCount: true,
                currentAICount: true
            },
            _count: true
        });

        return {
            overall: stats,
            byPlan: usageByPlan,
            timestamp: new Date().toISOString()
        };
    }
}