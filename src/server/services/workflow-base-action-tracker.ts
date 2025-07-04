import { Redis } from "@upstash/redis";

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

export class WorkflowBasedActionTracker {
    constructor(private redis: Redis) { }

    /**
     * Record an action for a specific workflow
     */
    async recordAction(
        workflowId: string,
        actionType: 'comment_reply' | 'dm_send',
        metadata?: any
    ): Promise<void> {
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHour = new Date().getHours();

        // Keys for different time windows
        const dailyKey = `workflow_actions:${workflowId}:daily:${today}`;
        const hourlyKey = `workflow_actions:${workflowId}:hourly:${today}:${currentHour}`;
        const lastActionKey = `workflow_last_action:${workflowId}`;

        // Record action with score = timestamp for ordering
        const actionData = JSON.stringify({
            type: actionType,
            timestamp: now,
            metadata
        });

        await Promise.all([
            // Daily stats - hash for easy counting by type
            this.redis.hincrby(dailyKey, actionType, 1),
            this.redis.hincrby(dailyKey, 'total', 1),
            this.redis.expire(dailyKey, 86400 * 2), // Keep for 2 days

            // Hourly stats - sorted set for time-based queries
            this.redis.zadd(hourlyKey, { score: now, member: actionData }),
            this.redis.expire(hourlyKey, 3600 * 2), // Keep for 2 hours

            // Track last action time for delay calculations
            this.redis.set(lastActionKey, now),
            this.redis.expire(lastActionKey, 86400) // Keep for 1 day
        ]);

        console.log(`📝 Recorded ${actionType} for workflow ${workflowId}`);
    }

    /**
     * Get current action statistics for a workflow
     */
    async getWorkflowStats(workflowId: string): Promise<WorkflowActionStats> {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        const dailyKey = `workflow_actions:${workflowId}:daily:${today}`;
        const hourlyKey = `workflow_actions:${workflowId}:hourly:${today}:${currentHour}`;

        // Get daily stats from hash
        const dailyStats = await this.redis.hgetall(dailyKey) as Record<string, string> | null;

        // Get hourly actions from sorted set - use zrange instead of zrevrange
        const hourlyActions = await this.redis.zrange(hourlyKey, 0, -1) as string[];

        // Count hourly actions by type
        let hourlyComments = 0;
        let hourlyDms = 0;

        hourlyActions.forEach(actionStr => {
            try {
                const action = JSON.parse(actionStr);
                if (action.type === 'comment_reply') hourlyComments++;
                else if (action.type === 'dm_send') hourlyDms++;
            } catch (e) {
                // Skip malformed entries
            }
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
     * Check if workflow can perform action based on limits
     */
    async canPerformAction(
        workflowId: string,
        actionType: 'comment_reply' | 'dm_send',
        limits: WorkflowActionLimits,
        actionTypes: WorkflowActionTypes
    ): Promise<{ allowed: boolean; reason?: string; waitTimeMs?: number }> {
        // Check if action type is enabled
        if (actionType === 'comment_reply' && !actionTypes.enableCommentReply) {
            return { allowed: false, reason: 'Comment replies are disabled for this workflow' };
        }

        if (actionType === 'dm_send' && !actionTypes.enableDMReply) {
            return { allowed: false, reason: 'DM replies are disabled for this workflow' };
        }

        // Get current stats
        const stats = await this.getWorkflowStats(workflowId);

        // Check daily limit
        if (stats.daily.total >= limits.maxActionsPerDay) {
            return {
                allowed: false,
                reason: `Workflow daily action limit reached (${limits.maxActionsPerDay})`,
                waitTimeMs: this.getTimeUntilTomorrow()
            };
        }

        // Check hourly limit
        if (stats.hourly.total >= limits.maxActionsPerHour) {
            return {
                allowed: false,
                reason: `Workflow hourly action limit reached (${limits.maxActionsPerHour})`,
                waitTimeMs: this.getTimeUntilNextHour()
            };
        }

        // Check minimum delay between actions
        const timeSinceLastAction = await this.getTimeSinceLastAction(workflowId);
        const [minDelay, maxDelay] = limits.delayBetweenActions;
        const requiredDelay = Math.random() * (maxDelay - minDelay) + minDelay;

        if (timeSinceLastAction < requiredDelay * 1000) {
            const waitTime = (requiredDelay * 1000) - timeSinceLastAction;
            return {
                allowed: false,
                reason: `Workflow minimum delay not met (${requiredDelay}s required)`,
                waitTimeMs: waitTime
            };
        }

        return { allowed: true };
    }

    /**
     * Check and record action atomically
     */
    async checkAndRecordAction(
        workflowId: string,
        actionType: 'comment_reply' | 'dm_send',
        limits: WorkflowActionLimits,
        actionTypes: WorkflowActionTypes,
        metadata?: any
    ): Promise<{ success: boolean; reason?: string; waitTimeMs?: number }> {
        const canPerform = await this.canPerformAction(workflowId, actionType, limits, actionTypes);

        if (!canPerform.allowed) {
            return {
                success: false,
                reason: canPerform.reason,
                waitTimeMs: canPerform.waitTimeMs
            };
        }

        await this.recordAction(workflowId, actionType, metadata);
        return { success: true };
    }

    /**
     * Get time since last action for a workflow
     */
    async getTimeSinceLastAction(workflowId: string): Promise<number> {
        const lastActionKey = `workflow_last_action:${workflowId}`;
        const lastActionTime = await this.redis.get(lastActionKey);

        if (!lastActionTime) {
            return Infinity; // No previous action
        }

        return Date.now() - parseInt(lastActionTime as string);
    }

    /**
     * Get workflow action history (last N actions)
     */
    async getWorkflowHistory(
        workflowId: string,
        limit: number = 50
    ): Promise<Array<{ type: string; timestamp: number; metadata?: any }>> {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        // Get from current and previous hours
        const hours = [currentHour, currentHour - 1].filter(h => h >= 0);
        const allActions: Array<{ type: string; timestamp: number; metadata?: any }> = [];

        for (const hour of hours) {
            const hourlyKey = `workflow_actions:${workflowId}:hourly:${today}:${hour}`;

            // Use zrange with reverse order (highest scores first)
            const actions = await this.redis.zrange(hourlyKey, 0, limit, {
                rev: true // This gives us reverse order (newest first)
            });

            for (const actionStr of actions as string[]) {
                try {
                    const action = JSON.parse(actionStr);
                    allActions.push(action);
                } catch (e) {
                    // Skip malformed entries
                }
            }
        }

        // Sort by timestamp (newest first) and limit
        return allActions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get workflows that are approaching limits
     */
    async getWorkflowsNearingLimits(
        workflowIds: string[],
        thresholdPercentage: number = 80
    ): Promise<Array<{ workflowId: string; usage: WorkflowActionStats; warningType: string }>> {
        const warnings: Array<{ workflowId: string; usage: WorkflowActionStats; warningType: string }> = [];

        for (const workflowId of workflowIds) {
            const stats = await this.getWorkflowStats(workflowId);

            // Check against common limits (you can make this configurable)
            const defaultLimits = { maxActionsPerHour: 25, maxActionsPerDay: 200 };

            const hourlyUsagePercent = (stats.hourly.total / defaultLimits.maxActionsPerHour) * 100;
            const dailyUsagePercent = (stats.daily.total / defaultLimits.maxActionsPerDay) * 100;

            if (hourlyUsagePercent >= thresholdPercentage) {
                warnings.push({
                    workflowId,
                    usage: stats,
                    warningType: `Hourly limit at ${hourlyUsagePercent.toFixed(1)}%`
                });
            }

            if (dailyUsagePercent >= thresholdPercentage) {
                warnings.push({
                    workflowId,
                    usage: stats,
                    warningType: `Daily limit at ${dailyUsagePercent.toFixed(1)}%`
                });
            }
        }

        return warnings;
    }

    /**
     * Reset workflow action counters (for testing or manual reset)
     */
    async resetWorkflowCounters(workflowId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        const keys = [
            `workflow_actions:${workflowId}:daily:${today}`,
            `workflow_actions:${workflowId}:hourly:${today}:${currentHour}`,
            `workflow_last_action:${workflowId}`
        ];

        await Promise.all(keys.map(key => this.redis.del(key)));
        console.log(`🔄 Reset counters for workflow ${workflowId}`);
    }

    /**
     * Private helper methods
     */
    private getTimeUntilTomorrow(): number {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime() - now.getTime();
    }

    private getTimeUntilNextHour(): number {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        return nextHour.getTime() - now.getTime();
    }
}