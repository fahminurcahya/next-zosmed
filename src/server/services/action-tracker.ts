import { db } from '@/server/db';
import { Redis } from '@upstash/redis';

interface DailyStats {
    comments: number;
    dms: number;
    totalActions: number;
}

export class ActionTracker {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    }

    async trackAction(integrationId: string, actionType: 'comment_reply' | 'dm_send') {
        const today = new Date().toISOString().split('T')[0];
        const key = `actions:${integrationId}:${today}`;

        // Increment counters in Redis
        await this.redis.hincrby(key, actionType, 1);
        await this.redis.hincrby(key, 'total', 1);

        // Set expiry to 48 hours
        await this.redis.expire(key, 48 * 60 * 60);

        // Also track in database for long-term analytics
        await db.usageTracking.upsert({
            where: {
                userId_integrationId_date: {
                    userId: await this.getUserIdForIntegration(integrationId),
                    integrationId,
                    date: new Date(today + 'T00:00:00Z')
                }
            },
            update: {
                commentReplied: actionType === 'comment_reply' ? { increment: 1 } : undefined,
                dmSent: actionType === 'dm_send' ? { increment: 1 } : undefined,
            },
            create: {
                userId: await this.getUserIdForIntegration(integrationId),
                integrationId,
                date: new Date(today + 'T00:00:00Z'),
                commentReplied: actionType === 'comment_reply' ? 1 : 0,
                dmSent: actionType === 'dm_send' ? 1 : 0,
                workflowRuns: 0
            }
        });
    }

    async getDailyStats(integrationId: string): Promise<DailyStats> {
        const today = new Date().toISOString().split('T')[0];
        const key = `actions:${integrationId}:${today}`;

        const stats = await this.redis.hgetall(key);

        return {
            comments: parseInt((stats && typeof stats === 'object' && 'comment_reply' in stats && typeof stats.comment_reply === 'string') ? stats.comment_reply : '0'),
            dms: parseInt((stats && typeof stats === 'object' && 'dm_send' in stats && typeof stats.dm_send === 'string') ? stats.dm_send : '0'),
            totalActions: parseInt((stats && typeof stats === 'object' && 'total' in stats && typeof stats.total === 'string') ? stats.total : '0')
        };
    }

    async getRecentActionCount(integrationId: string, minutes: number = 60): Promise<number> {
        // For burst detection, track recent actions in a sorted set
        const key = `recent_actions:${integrationId}`;
        const now = Date.now();
        const windowStart = now - (minutes * 60 * 1000);

        // Remove old entries
        await this.redis.zremrangebyscore(key, 0, windowStart);

        // Count recent actions
        const count = await this.redis.zcard(key);

        // Add current timestamp
        await this.redis.zadd(key, { score: now, member: `${now}` });
        await this.redis.expire(key, 2 * 60 * 60); // 2 hours expiry

        return count;
    }

    async canPerformAction(
        integrationId: string,
        actionType: 'comment_reply' | 'dm_send'
    ): Promise<{ allowed: boolean; reason?: string }> {
        const dailyStats = await this.getDailyStats(integrationId);
        const hourlyCount = await this.getHourlyCount(integrationId, actionType);

        // Check daily limits
        if (actionType === 'comment_reply' && dailyStats.comments >= 200) {
            return { allowed: false, reason: 'Daily comment limit reached (200)' };
        }

        if (actionType === 'dm_send' && dailyStats.dms >= 100) {
            return { allowed: false, reason: 'Daily DM limit reached (100)' };
        }

        // Check hourly limits
        if (actionType === 'comment_reply' && hourlyCount >= 25) {
            return { allowed: false, reason: 'Hourly comment limit reached (25)' };
        }

        if (actionType === 'dm_send' && hourlyCount >= 20) {
            return { allowed: false, reason: 'Hourly DM limit reached (20)' };
        }

        return { allowed: true };
    }

    private async getHourlyCount(integrationId: string, actionType: string): Promise<number> {
        const key = `hourly:${integrationId}:${actionType}`;
        const now = Date.now();
        const hourAgo = now - (60 * 60 * 1000);

        // Remove old entries
        await this.redis.zremrangebyscore(key, 0, hourAgo);

        // Get count
        return await this.redis.zcard(key);
    }

    private async getUserIdForIntegration(integrationId: string): Promise<string> {
        const integration = await db.integration.findUnique({
            where: { id: integrationId },
            select: { userId: true }
        });

        if (!integration) {
            throw new Error('Integration not found');
        }

        return integration.userId;
    }

    // Analytics methods
    async getWeeklyStats(integrationId: string) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = await db.usageTracking.aggregate({
            where: {
                integrationId,
                date: { gte: sevenDaysAgo }
            },
            _sum: {
                dmSent: true,
                commentReplied: true,
                workflowRuns: true
            }
        });

        return {
            totalDMs: stats._sum.dmSent || 0,
            totalComments: stats._sum.commentReplied || 0,
            totalWorkflows: stats._sum.workflowRuns || 0
        };
    }

    async getAccountHealth(integrationId: string) {
        const dailyStats = await this.getDailyStats(integrationId);
        const weeklyStats = await this.getWeeklyStats(integrationId);

        // Calculate health score
        const dailyUsagePercent = {
            comments: (dailyStats.comments / 200) * 100,
            dms: (dailyStats.dms / 100) * 100
        };

        const health = {
            score: 100 - Math.max(dailyUsagePercent.comments, dailyUsagePercent.dms),
            status: 'healthy' as 'healthy' | 'warning' | 'critical',
            recommendations: [] as string[]
        };

        if (dailyUsagePercent.comments > 80 || dailyUsagePercent.dms > 80) {
            health.status = 'critical';
            health.recommendations.push('Reduce activity to avoid restrictions');
        } else if (dailyUsagePercent.comments > 60 || dailyUsagePercent.dms > 60) {
            health.status = 'warning';
            health.recommendations.push('Monitor usage closely');
        }

        if (weeklyStats.totalDMs > 500) {
            health.recommendations.push('Weekly DM volume is high, consider spreading activity');
        }

        return health;
    }
}