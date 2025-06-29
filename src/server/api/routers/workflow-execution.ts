// server/api/routers/workflow-execution.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const workflowExecutionRouter = createTRPCRouter({
    // List executions by workflow
    listByWorkflow: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
            limit: z.number().default(10),
            cursor: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            // Verify workflow ownership
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.workflowId,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Workflow not found',
                });
            }

            const executions = await ctx.db.workflowExecution.findMany({
                where: { workflowId: input.workflowId },
                include: {
                    phases: {
                        orderBy: { number: 'asc' },
                        include: {
                            logs: {
                                orderBy: { timestamp: 'asc' },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: input.limit,
                ...(input.cursor && {
                    cursor: { id: input.cursor },
                    skip: 1,
                }),
            });

            return executions;
        }),

    // Get single execution details
    get: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const execution = await ctx.db.workflowExecution.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
                include: {
                    workflow: {
                        include: {
                            integration: true,
                        },
                    },
                    phases: {
                        orderBy: { number: 'asc' },
                        include: {
                            logs: {
                                orderBy: { timestamp: 'asc' },
                            },
                        },
                    },
                },
            });

            if (!execution) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Execution not found',
                });
            }

            return execution;
        }),

    // Cancel running execution
    cancel: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const execution = await ctx.db.workflowExecution.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                    status: 'RUNNING',
                },
            });

            if (!execution) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Running execution not found',
                });
            }

            // Update execution status
            const updated = await ctx.db.workflowExecution.update({
                where: { id: input.id },
                data: {
                    status: 'CANCELLED',
                    completedAt: new Date(),
                },
            });

            // Cancel any pending phases
            await ctx.db.executionPhase.updateMany({
                where: {
                    workflowExecutionId: input.id,
                    status: 'PENDING',
                },
                data: {
                    status: 'SKIPPED',
                },
            });

            return updated;
        }),

    // Get execution statistics
    getStats: protectedProcedure
        .input(z.object({
            workflowId: z.string().optional(),
            days: z.number().default(7),
        }))
        .query(async ({ ctx, input }) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - input.days);

            const where = {
                userId: ctx.session.user.id,
                createdAt: { gte: startDate },
                ...(input.workflowId && { workflowId: input.workflowId }),
            };

            const [total, byStatus, avgDuration] = await Promise.all([
                // Total executions
                ctx.db.workflowExecution.count({ where }),

                // By status
                ctx.db.workflowExecution.groupBy({
                    by: ['status'],
                    where,
                    _count: true,
                }),

                // Average duration
                ctx.db.$queryRaw<Array<{ avg_duration: number | null }>>`
                    SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as avg_duration
                    FROM "workflow_execution"
                    WHERE "userId" = ${ctx.session.user.id}
                    AND "createdAt" >= ${startDate}
                    AND "completedAt" IS NOT NULL
                    AND "startedAt" IS NOT NULL
                    ${input.workflowId ? ctx.db.$queryRaw`AND "workflowId" = ${input.workflowId}` : ctx.db.$queryRaw``}
                `,
            ]);

            const statusCounts = byStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {} as Record<string, number>);

            return {
                total,
                statusCounts,
                successRate: total > 0
                    ? Math.round((statusCounts.SUCCESS || 0) / total * 100)
                    : 0,
                avgDurationSeconds: avgDuration[0]?.avg_duration || 0,
            };
        }),
});