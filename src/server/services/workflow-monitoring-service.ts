import { db } from "@/server/db";
import { Redis } from "@upstash/redis";
import { WorkflowBasedActionTracker } from "./workflow-base-action-tracker";

export interface WorkflowPerformanceMetrics {
    workflowId: string;
    workflowName: string;
    isActive: boolean;

    // Execution stats
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;

    // Action stats (today)
    actionsToday: {
        total: number;
        comments: number;
        dms: number;
    };

    // Rate limiting status
    rateLimitStatus: {
        hourlyUsage: number;
        dailyUsage: number;
        isNearingLimit: boolean;
        nextActionAllowed: Date | null;
    };

    // Performance indicators
    avgExecutionTimeMs: number;
    lastExecutedAt: Date | null;
    lastSuccessAt: Date | null;

    // Warnings
    warnings: string[];
}

export class WorkflowMonitoringService {
    private redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    private actionTracker = new WorkflowBasedActionTracker(this.redis);

    /**
     * Get comprehensive performance metrics for a workflow
     */
    async getWorkflowMetrics(workflowId: string): Promise<WorkflowPerformanceMetrics | null> {
        // Get workflow basic info
        const workflow = await db.workflow.findUnique({
            where: { id: workflowId },
            include: {
                executions: {
                    orderBy: { createdAt: 'desc' },
                    take: 100 // Last 100 executions for analysis
                }
            }
        });

        if (!workflow) return null;

        // Calculate execution stats
        const totalExecutions = workflow.executions.length;
        const successfulExecutions = workflow.executions.filter(e => e.status === 'SUCCESS').length;
        const failedExecutions = workflow.executions.filter(e => e.status === 'FAILED').length;
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

        // Calculate average execution time
        const completedExecutions = workflow.executions.filter(e => e.completedAt && e.startedAt);
        const avgExecutionTimeMs = completedExecutions.length > 0
            ? completedExecutions.reduce((sum, exec) => {
                const duration = exec.completedAt!.getTime() - exec.startedAt!.getTime();
                return sum + duration;
            }, 0) / completedExecutions.length
            : 0;

        // Get action stats from tracker
        const actionStats = await this.actionTracker.getWorkflowStats(workflowId);

        // Analyze rate limiting status
        const rateLimitStatus = await this.analyzeRateLimitStatus(workflowId);

        // Generate warnings
        const warnings = await this.generateWarnings(workflow, actionStats, rateLimitStatus);

        return {
            workflowId: workflow.id,
            workflowName: workflow.name,
            isActive: workflow.isActive,

            totalExecutions,
            successfulExecutions,
            failedExecutions,
            successRate,

            actionsToday: actionStats.daily,
            rateLimitStatus,

            avgExecutionTimeMs,
            lastExecutedAt: workflow.executions[0]?.createdAt || null,
            lastSuccessAt: workflow.executions.find(e => e.status === 'SUCCESS')?.createdAt || null,

            warnings
        };
    }

    /**
     * Get metrics for multiple workflows
     */
    async getWorkflowsMetrics(
        userId: string,
        integrationId?: string
    ): Promise<WorkflowPerformanceMetrics[]> {
        const workflows = await db.workflow.findMany({
            where: {
                userId,
                ...(integrationId && { integrationId })
            },
            select: { id: true }
        });

        const metrics = await Promise.all(
            workflows.map(w => this.getWorkflowMetrics(w.id))
        );

        return metrics.filter(Boolean) as WorkflowPerformanceMetrics[];
    }

    /**
     * Get workflows that need attention
     */
    async getWorkflowsNeedingAttention(userId: string): Promise<{
        failing: WorkflowPerformanceMetrics[];
        nearingLimits: WorkflowPerformanceMetrics[];
        inactive: WorkflowPerformanceMetrics[];
    }> {
        const allMetrics = await this.getWorkflowsMetrics(userId);

        const failing = allMetrics.filter(m =>
            m.isActive && m.totalExecutions > 5 && m.successRate < 50
        );

        const nearingLimits = allMetrics.filter(m =>
            m.isActive && m.rateLimitStatus.isNearingLimit
        );

        const inactive = allMetrics.filter(m => {
            const daysSinceLastExecution = m.lastExecutedAt
                ? (Date.now() - m.lastExecutedAt.getTime()) / (1000 * 60 * 60 * 24)
                : Infinity;
            return m.isActive && daysSinceLastExecution > 7;
        });

        return { failing, nearingLimits, inactive };
    }

    /**
     * Get workflow action timeline (for charts)
     */
    async getWorkflowActionTimeline(
        workflowId: string,
        days: number = 7
    ): Promise<Array<{
        date: string;
        comments: number;
        dms: number;
        total: number;
    }>> {
        const timeline = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dailyKey = `workflow_actions:${workflowId}:daily:${dateStr}`;

            // Use hgetall to get all fields from hash
            const dailyStats = await this.redis.hgetall(dailyKey) as Record<string, string> | null;

            timeline.push({
                date: dateStr ?? "",
                comments: parseInt(dailyStats?.comment_reply || '0'),
                dms: parseInt(dailyStats?.dm_send || '0'),
                total: parseInt(dailyStats?.total || '0')
            });
        }

        return timeline;
    }

    /**
     * Analyze rate limiting status for a workflow
     */
    private async analyzeRateLimitStatus(workflowId: string): Promise<{
        hourlyUsage: number;
        dailyUsage: number;
        isNearingLimit: boolean;
        nextActionAllowed: Date | null;
    }> {
        const stats = await this.actionTracker.getWorkflowStats(workflowId);
        const timeSinceLastAction = await this.actionTracker.getTimeSinceLastAction(workflowId);

        // Default limits (should come from workflow config in real app)
        const defaultLimits = {
            maxActionsPerHour: 25,
            maxActionsPerDay: 200,
            minDelayBetweenActions: 5 // seconds
        };

        const hourlyUsagePercent = (stats.hourly.total / defaultLimits.maxActionsPerHour) * 100;
        const dailyUsagePercent = (stats.daily.total / defaultLimits.maxActionsPerDay) * 100;
        const isNearingLimit = hourlyUsagePercent >= 80 || dailyUsagePercent >= 80;

        // Calculate when next action is allowed
        let nextActionAllowed: Date | null = null;
        if (timeSinceLastAction < defaultLimits.minDelayBetweenActions * 1000) {
            const waitTime = (defaultLimits.minDelayBetweenActions * 1000) - timeSinceLastAction;
            nextActionAllowed = new Date(Date.now() + waitTime);
        }

        return {
            hourlyUsage: Math.round(hourlyUsagePercent),
            dailyUsage: Math.round(dailyUsagePercent),
            isNearingLimit,
            nextActionAllowed
        };
    }

    /**
     * Generate warnings for a workflow
     */
    private async generateWarnings(
        workflow: any,
        actionStats: any,
        rateLimitStatus: any
    ): Promise<string[]> {
        const warnings: string[] = [];

        // Execution warnings
        if (workflow.executions.length > 10) {
            const recentExecutions = workflow.executions.slice(0, 10);
            const recentFailures = recentExecutions.filter((e: any) => e.status === 'FAILED').length;
            const failureRate = (recentFailures / recentExecutions.length) * 100;

            if (failureRate > 50) {
                warnings.push(`High failure rate: ${failureRate.toFixed(1)}% of recent executions failed`);
            }
        }

        // Rate limiting warnings
        if (rateLimitStatus.hourlyUsage > 90) {
            warnings.push(`Hourly rate limit nearly reached: ${rateLimitStatus.hourlyUsage}%`);
        }

        if (rateLimitStatus.dailyUsage > 90) {
            warnings.push(`Daily rate limit nearly reached: ${rateLimitStatus.dailyUsage}%`);
        }

        // Activity warnings
        const lastExecution = workflow.executions[0];
        if (workflow.isActive && lastExecution) {
            const daysSinceLastExecution = (Date.now() - lastExecution.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastExecution > 3) {
                warnings.push(`No activity for ${Math.floor(daysSinceLastExecution)} days`);
            }
        }

        // Configuration warnings
        if (workflow.isActive && !workflow.definition) {
            warnings.push('Workflow is active but has no configuration');
        }

        return warnings;
    }

    /**
     * Get real-time workflow status
     */
    async getWorkflowRealTimeStatus(workflowId: string): Promise<{
        isExecuting: boolean;
        currentExecution?: {
            id: string;
            startedAt: Date;
            currentPhase?: string;
            progress?: number;
        };
        queuedActions: number;
        lastAction?: {
            type: string;
            timestamp: Date;
            success: boolean;
        };
    }> {
        // Check for currently running executions
        const runningExecution = await db.workflowExecution.findFirst({
            where: {
                workflowId,
                status: 'RUNNING'
            },
            include: {
                phases: {
                    orderBy: { number: 'desc' },
                    take: 1
                }
            }
        });

        // Get recent action history
        const recentActions = await this.actionTracker.getWorkflowHistory(workflowId, 1);
        const lastAction = recentActions[0];

        return {
            isExecuting: !!runningExecution,
            currentExecution: runningExecution ? {
                id: runningExecution.id,
                startedAt: runningExecution.startedAt!,
                currentPhase: runningExecution.phases[0]?.name,
                progress: this.calculateExecutionProgress(runningExecution)
            } : undefined,
            queuedActions: 0, // TODO: Implement action queue
            lastAction: lastAction ? {
                type: lastAction.type,
                timestamp: new Date(lastAction.timestamp),
                success: true // TODO: Get from action metadata
            } : undefined
        };
    }

    /**
     * Get workflow health score (0-100)
     */
    async getWorkflowHealthScore(workflowId: string): Promise<{
        score: number;
        factors: Array<{
            name: string;
            score: number;
            weight: number;
            impact: 'positive' | 'negative' | 'neutral';
        }>;
    }> {
        const metrics = await this.getWorkflowMetrics(workflowId);
        if (!metrics) return { score: 0, factors: [] };

        const factors = [
            {
                name: 'Success Rate',
                score: metrics.successRate,
                weight: 30,
                impact: getImpact(metrics.successRate)
            },
            {
                name: 'Recent Activity',
                score: this.calculateActivityScore(metrics.lastExecutedAt),
                weight: 20,
                impact: 'neutral' as const
            },
            {
                name: 'Rate Limit Health',
                score: 100 - Math.max(metrics.rateLimitStatus.hourlyUsage, metrics.rateLimitStatus.dailyUsage),
                weight: 25,
                impact: metrics.rateLimitStatus.isNearingLimit ? 'negative' as const : 'positive' as const
            },
            {
                name: 'Performance',
                score: this.calculatePerformanceScore(metrics.avgExecutionTimeMs),
                weight: 15,
                impact: 'neutral' as const
            },
            {
                name: 'Configuration',
                score: metrics.warnings.length === 0 ? 100 : Math.max(0, 100 - (metrics.warnings.length * 20)),
                weight: 10,
                impact: metrics.warnings.length === 0 ? 'positive' as const : 'negative' as const
            }
        ];

        const totalScore = factors.reduce((sum, factor) => {
            return sum + (factor.score * factor.weight / 100);
        }, 0);

        return {
            score: Math.round(totalScore),
            factors
        };
    }

    /**
     * Export workflow performance report
     */
    async exportWorkflowReport(
        workflowId: string,
        format: 'json' | 'csv' = 'json'
    ): Promise<string> {
        const metrics = await this.getWorkflowMetrics(workflowId);
        const timeline = await this.getWorkflowActionTimeline(workflowId, 30);
        const healthScore = await this.getWorkflowHealthScore(workflowId);

        const report = {
            generatedAt: new Date().toISOString(),
            workflow: {
                id: workflowId,
                name: metrics?.workflowName,
                isActive: metrics?.isActive
            },
            metrics,
            timeline,
            healthScore,
            summary: {
                status: this.getWorkflowStatus(metrics),
                recommendations: this.generateRecommendations(metrics)
            }
        };

        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else {
            // Convert to CSV format
            return this.convertReportToCSV(report);
        }
    }

    /**
     * Private helper methods
     */
    private calculateExecutionProgress(execution: any): number {
        // Simple progress calculation based on phases
        if (!execution.phases?.length) return 0;

        const totalPhases = execution.phases.length;
        const completedPhases = execution.phases.filter((p: any) => p.status === 'SUCCESS').length;

        return Math.round((completedPhases / totalPhases) * 100);
    }

    private calculateActivityScore(lastExecutedAt: Date | null): number {
        if (!lastExecutedAt) return 0;

        const daysSince = (Date.now() - lastExecutedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince <= 1) return 100;
        if (daysSince <= 3) return 80;
        if (daysSince <= 7) return 60;
        if (daysSince <= 14) return 40;
        if (daysSince <= 30) return 20;
        return 0;
    }

    private calculatePerformanceScore(avgExecutionTimeMs: number): number {
        if (avgExecutionTimeMs === 0) return 100;
        if (avgExecutionTimeMs < 1000) return 100;
        if (avgExecutionTimeMs < 5000) return 80;
        if (avgExecutionTimeMs < 15000) return 60;
        if (avgExecutionTimeMs < 30000) return 40;
        return 20;
    }

    private getWorkflowStatus(metrics: WorkflowPerformanceMetrics | null): string {
        if (!metrics) return 'unknown';
        if (!metrics.isActive) return 'inactive';
        if (metrics.warnings.length > 0) return 'warning';
        if (metrics.successRate < 50) return 'failing';
        if (metrics.rateLimitStatus.isNearingLimit) return 'limited';
        return 'healthy';
    }

    private generateRecommendations(metrics: WorkflowPerformanceMetrics | null): string[] {
        if (!metrics) return [];

        const recommendations: string[] = [];

        if (metrics.successRate < 80) {
            recommendations.push('Review workflow configuration and error logs to improve success rate');
        }

        if (metrics.rateLimitStatus.isNearingLimit) {
            recommendations.push('Consider adjusting rate limits or distributing actions across time');
        }

        if (metrics.warnings.length > 0) {
            recommendations.push('Address workflow warnings to improve reliability');
        }

        if (!metrics.lastExecutedAt || (Date.now() - metrics.lastExecutedAt.getTime()) > 7 * 24 * 60 * 60 * 1000) {
            recommendations.push('Workflow has been inactive - check triggers and conditions');
        }

        return recommendations;
    }

    private convertReportToCSV(report: any): string {
        // Simple CSV conversion for timeline data
        const headers = ['Date', 'Comments', 'DMs', 'Total'];
        const rows = report.timeline.map((t: any) => [
            t.date, t.comments, t.dms, t.total
        ]);

        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

function getImpact(val: number): "positive" | "negative" | "neutral" {
    if (val > 80) return "positive";
    if (val < 50) return "negative";
    return "neutral";
}