// src/server/api/routers/workflow-monitoring.ts
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { WorkflowBasedActionTracker } from "@/server/services/workflow-base-action-tracker";
import { WorkflowMonitoringService } from "@/server/services/workflow-monitoring-service";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const monitoringService = new WorkflowMonitoringService();
const actionTracker = new WorkflowBasedActionTracker(redis);

export const workflowMonitoringRouter = createTRPCRouter({
    // Get metrics for a single workflow
    getWorkflowMetrics: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            // Verify user owns this workflow
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await monitoringService.getWorkflowMetrics(input.workflowId);
        }),

    // Get metrics for all user's workflows
    getAllWorkflowsMetrics: protectedProcedure
        .input(z.object({
            integrationId: z.string().optional(),
        }))
        .query(async ({ input, ctx }) => {
            return await monitoringService.getWorkflowsMetrics(
                ctx.session.user.id,
                input.integrationId
            );
        }),

    // Get workflows needing attention
    getWorkflowsNeedingAttention: protectedProcedure
        .query(async ({ ctx }) => {
            return await monitoringService.getWorkflowsNeedingAttention(
                ctx.session.user.id
            );
        }),

    // Get workflow health score
    getWorkflowHealthScore: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await monitoringService.getWorkflowHealthScore(input.workflowId);
        }),

    // Get workflow action timeline
    getWorkflowTimeline: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
            days: z.number().min(1).max(30).default(7),
        }))
        .query(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await monitoringService.getWorkflowActionTimeline(
                input.workflowId,
                input.days
            );
        }),

    // Get real-time workflow status
    getWorkflowRealTimeStatus: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await monitoringService.getWorkflowRealTimeStatus(input.workflowId);
        }),

    // Get workflow action history
    getWorkflowActionHistory: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
            limit: z.number().min(10).max(100).default(50),
        }))
        .query(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await actionTracker.getWorkflowHistory(
                input.workflowId,
                input.limit
            );
        }),

    // Get workflow statistics
    getWorkflowStats: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            return await actionTracker.getWorkflowStats(input.workflowId);
        }),

    // Export workflow report
    exportWorkflowReport: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
            format: z.enum(['json', 'csv']).default('json'),
        }))
        .mutation(async ({ input, ctx }) => {
            // Verify ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            const report = await monitoringService.exportWorkflowReport(
                input.workflowId,
                input.format
            );

            return {
                data: report,
                filename: `workflow-${input.workflowId}-report.${input.format}`,
                contentType: input.format === 'json'
                    ? 'application/json'
                    : 'text/csv'
            };
        }),

    // Reset workflow counters (for testing/manual reset)
    resetWorkflowCounters: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Verify ownership and admin permission
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new Error("Workflow not found or access denied");
            }

            await actionTracker.resetWorkflowCounters(input.workflowId);

            return { success: true };
        }),

    // Get dashboard summary for all workflows
    getDashboardSummary: protectedProcedure
        .query(async ({ ctx }) => {
            const [allMetrics, needingAttention] = await Promise.all([
                monitoringService.getWorkflowsMetrics(ctx.session.user.id),
                monitoringService.getWorkflowsNeedingAttention(ctx.session.user.id)
            ]);

            // Calculate summary stats
            const totalWorkflows = allMetrics.length;
            const activeWorkflows = allMetrics.filter(m => m.isActive).length;
            const totalActionsToday = allMetrics.reduce(
                (sum, m) => sum + m.actionsToday.total, 0
            );
            const avgSuccessRate = allMetrics.length > 0
                ? allMetrics.reduce((sum, m) => sum + m.successRate, 0) / allMetrics.length
                : 0;

            // Top performing workflows
            const topPerforming = allMetrics
                .filter(m => m.isActive && m.totalExecutions > 5)
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 5);

            // Recent activity
            const recentActivity = allMetrics
                .filter(m => m.lastExecutedAt)
                .sort((a, b) =>
                    (b.lastExecutedAt?.getTime() || 0) - (a.lastExecutedAt?.getTime() || 0)
                )
                .slice(0, 10);

            return {
                summary: {
                    totalWorkflows,
                    activeWorkflows,
                    totalActionsToday,
                    avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
                },
                needingAttention,
                topPerforming,
                recentActivity,
                healthDistribution: {
                    healthy: allMetrics.filter(m =>
                        m.isActive && m.successRate > 80 && !m.rateLimitStatus.isNearingLimit
                    ).length,
                    warning: allMetrics.filter(m =>
                        m.isActive && (m.warnings.length > 0 || m.rateLimitStatus.isNearingLimit)
                    ).length,
                    failing: allMetrics.filter(m =>
                        m.isActive && m.successRate < 50
                    ).length,
                    inactive: allMetrics.filter(m => !m.isActive).length,
                }
            };
        }),
});