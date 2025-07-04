import { Redis } from '@upstash/redis';
import type { ActionStats, CombinedActionLimits } from '@/types/app-node.type';
export interface WorkflowActionLimits {
    maxActionsPerHour: number;
    maxActionsPerDay: number;
    delayBetweenActions: [number, number]; // [min, max] seconds
    commentToDmDelay: [number, number];    // [min, max] seconds
}

export interface WorkflowActionTypes {
    enableCommentReply: boolean;
    enableDMReply: boolean;
}

export interface WorkflowActionStats {
    daily: {
        total: number;
        comments: number;
        dms: number;
    };
    hourly: {
        total: number;
        comments: number;
        dms: number;
    };
}

export class ActionTracker {
    private redis: Redis;

    constructor(redis?: Redis) {
        // Allow passing Redis instance or create new one
        this.redis = redis || new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    }

    /**
     * Record a combined action (comment or DM)
     */
    async recordCombinedAction(
        integrationId: string,
        actionType: 'comment_reply' | 'dm_send',
        metadata?: Record<string, any>
    ): Promise<void> {
        const now = Date.now();
        const dateKey = new Date().toISOString().split('T')[0];

        const keys = {
            // Combined counters
            daily: `combined_daily:${integrationId}:${dateKey}`,
            hourly: `combined_hourly:${integrationId}`,

            // Metadata
            lastAction: `last_action:${integrationId}`,
            recentActions: `recent_actions:${integrationId}`
        };

        // Pipeline untuk atomic operations
        const pipeline = this.redis.pipeline();

        // Daily counters
        pipeline.hincrby(keys.daily, 'total', 1);
        pipeline.hincrby(keys.daily, actionType, 1);
        pipeline.expire(keys.daily, 2 * 24 * 60 * 60); // 2 days

        // Hourly sliding window
        pipeline.zadd(keys.hourly, {
            score: now,
            member: `${actionType}:${now}`
        });
        pipeline.zremrangebyscore(keys.hourly, 0, now - (60 * 60 * 1000));
        pipeline.expire(keys.hourly, 2 * 60 * 60); // 2 hours

        // Recent actions untuk burst detection
        pipeline.zadd(keys.recentActions, {
            score: now,
            member: `${now}:${actionType}`
        });
        pipeline.expire(keys.recentActions, 2 * 60 * 60);

        // Last action metadata
        pipeline.hset(keys.lastAction, {
            timestamp: now.toString(),
            type: actionType,
            ...(metadata || {})
        });

        await pipeline.exec();
    }

    /**
     * Get combined stats for hourly and daily
     */
    async getCombinedStats(integrationId: string): Promise<ActionStats> {
        const dateKey = new Date().toISOString().split('T')[0];
        const now = Date.now();

        // Daily stats
        const dailyKey = `combined_daily:${integrationId}:${dateKey}`;
        const dailyStats = await this.redis.hgetall(dailyKey) as Record<string, string>;

        // Hourly stats (sliding window)
        const hourlyKey = `combined_hourly:${integrationId}`;
        const hourAgo = now - (60 * 60 * 1000);

        // First remove old entries
        await this.redis.zremrangebyscore(hourlyKey, Number.NEGATIVE_INFINITY, hourAgo);

        // Then get all current entries
        const hourlyActions = await this.redis.zrange(hourlyKey, 0, -1);

        // Count hourly actions by type
        let hourlyComments = 0;
        let hourlyDms = 0;


        (hourlyActions as string[]).forEach(action => {
            if (action.startsWith('comment_reply:')) hourlyComments++;
            else if (action.startsWith('dm_send:')) hourlyDms++;
        });

        return {
            daily: {
                total: parseInt(dailyStats?.total || '0'),
                comments: parseInt(dailyStats?.comment_reply || '0'),
                dms: parseInt(dailyStats?.dm_send || '0')
            },
            hourly: {
                total: hourlyComments + hourlyDms,
                comments: hourlyComments,
                dms: hourlyDms
            }
        };
    }

    /**
     * Check if action can be performed based on combined limits
     */
    async canPerformCombinedAction(
        integrationId: string,
        actionType: 'comment_reply' | 'dm_send',
        limits: CombinedActionLimits
    ): Promise<{ allowed: boolean; reason?: string }> {
        // Check if action type is enabled
        if (actionType === 'comment_reply' && !limits.actionTypes.enableCommentReply) {
            return { allowed: false, reason: 'Comment replies are disabled' };
        }

        if (actionType === 'dm_send' && !limits.actionTypes.enableDMReply) {
            return { allowed: false, reason: 'DM replies are disabled' };
        }

        // Get current stats
        const stats = await this.getCombinedStats(integrationId);

        // Check daily limit
        if (stats.daily.total >= limits.maxActionsPerDay) {
            return {
                allowed: false,
                reason: `Daily action limit reached (${limits.maxActionsPerDay})`
            };
        }

        // Check hourly limit
        if (stats.hourly.total >= limits.maxActionsPerHour) {
            return {
                allowed: false,
                reason: `Hourly action limit reached (${limits.maxActionsPerHour})`
            };
        }

        return { allowed: true };
    }

    /**
     * Get time until next action is allowed
     */
    async getTimeUntilNextAction(
        integrationId: string,
        limits: {
            maxActionsPerHour: number;
            maxActionsPerDay: number;
        }
    ): Promise<{
        canActNow: boolean;
        waitTimeMs?: number;
        reason?: string
    }> {
        const stats = await this.getCombinedStats(integrationId);
        const now = Date.now();

        // Check daily limit
        if (stats.daily.total >= limits.maxActionsPerDay) {
            // Calculate time until midnight
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            return {
                canActNow: false,
                waitTimeMs: tomorrow.getTime() - now,
                reason: 'Daily limit reached'
            };
        }

        // Check hourly limit
        if (stats.hourly.total >= limits.maxActionsPerHour) {
            // Get oldest action in current hour window
            const hourlyKey = `combined_hourly:${integrationId}`;
            const hourAgo = now - (60 * 60 * 1000);

            // Get all members with scores
            const allActions = await this.redis.zrange(hourlyKey, 0, -1, { withScores: true });

            // Find oldest action in the hour window
            let oldestTimestamp = now;
            for (let i = 0; i < allActions.length; i += 2) {
                const score = parseInt(allActions[i + 1] as string);
                if (score >= hourAgo && score < oldestTimestamp) {
                    oldestTimestamp = score;
                }
            }

            if (oldestTimestamp < now) {
                const waitTime = (oldestTimestamp + (60 * 60 * 1000)) - now;
                return {
                    canActNow: false,
                    waitTimeMs: Math.max(0, waitTime),
                    reason: 'Hourly limit reached'
                };
            }
        }

        return { canActNow: true };
    }

    /**
     * Get recent actions for burst detection
     */
    async getRecentActionCount(integrationId: string, minutes: number = 5): Promise<number> {
        const key = `recent_actions:${integrationId}`;
        const now = Date.now();
        const windowStart = now - (minutes * 60 * 1000);

        // Remove old entries
        await this.redis.zremrangebyscore(key, 0, windowStart);

        // Count recent actions
        const count = await this.redis.zcard(key);

        return count;
    }

    /**
     * Reset daily stats (untuk testing)
     */
    async resetDailyStats(integrationId: string): Promise<void> {
        const dateKey = new Date().toISOString().split('T')[0];
        const dailyKey = `combined_daily:${integrationId}:${dateKey}`;
        await this.redis.del(dailyKey);
    }

    /**
     * Reset hourly stats (untuk testing)
     */
    async resetHourlyStats(integrationId: string): Promise<void> {
        const hourlyKey = `combined_hourly:${integrationId}`;
        await this.redis.del(hourlyKey);
    }

    /**
     * Get detailed action history
     */
    async getActionHistory(
        integrationId: string,
        hours: number = 24
    ): Promise<Array<{ timestamp: number; type: string }>> {
        const key = `recent_actions:${integrationId}`;
        const since = Date.now() - (hours * 60 * 60 * 1000);

        // Remove old entries first
        await this.redis.zremrangebyscore(key, Number.NEGATIVE_INFINITY, since);


        // Get all actions with scores
        const actions = await this.redis.zrange(key, 0, -1, { withScores: true });

        const history: Array<{ timestamp: number; type: string }> = [];

        // Process results (zrange with scores returns [member, score, member, score...])
        for (let i = 0; i < actions.length; i += 2) {
            const member = actions[i] as string;
            const score = parseInt(actions[i + 1] as string);

            // Parse member format: "timestamp:actionType"
            const parts = member.split(':');
            if (parts.length >= 2) {
                history.push({
                    timestamp: score,
                    type: parts[1] ?? 'unknown' // atau ''
                });
            }
        }

        return history.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get action statistics for analytics
     */
    async getActionAnalytics(
        integrationId: string,
        days: number = 7
    ): Promise<{
        dailyBreakdown: Array<{
            date: string;
            comments: number;
            dms: number;
            total: number;
        }>;
        totalComments: number;
        totalDms: number;
        avgPerDay: number;
    }> {
        const breakdown = [];
        let totalComments = 0;
        let totalDms = 0;

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];


            const dailyKey = `combined_daily:${integrationId}:${dateKey}`;
            const stats = await this.redis.hgetall(dailyKey) as Record<string, string>;

            const dayStats = {
                date: dateKey || '',
                comments: parseInt(stats?.comment_reply || '0'),
                dms: parseInt(stats?.dm_send || '0'),
                total: parseInt(stats?.total || '0')
            };

            breakdown.push(dayStats);
            totalComments += dayStats.comments;
            totalDms += dayStats.dms;
        }


        return {
            dailyBreakdown: breakdown.reverse(), // Oldest to newest
            totalComments,
            totalDms,
            avgPerDay: (totalComments + totalDms) / days
        };
    }
}