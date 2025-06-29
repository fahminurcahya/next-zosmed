import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createWorkflowSchema, duplicateWorkflowSchema, updateWorkflowSchema } from "@/schema/workflow";
import type { AppNode } from "@/types/app-node.type";
import type { Edge } from "@xyflow/react";
import { CreateFlowNode } from "@/lib/workflow/create-flow-node";
import { TaskType } from "@/types/task.type";
import { WorkflowStatus } from "@/types/workflow.type";
import { z } from "zod";
import { FlowToExecutionPlan } from "@/lib/workflow/execution-plan";
import { CalculateWorkflowCost } from "@/lib/workflow/helpers";
import { TRPCError } from "@trpc/server";
import { WorkflowTriggerType } from "@prisma/client";

export const workflowRouter = createTRPCRouter({
    // List all workflows for user
    list: protectedProcedure
        .input(z.object({
            integrationId: z.string().optional(),
            triggerType: z.nativeEnum(WorkflowTriggerType).optional(),
            isActive: z.boolean().optional(),
            search: z.string().optional(),
            limit: z.number().default(20),
            cursor: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const where = {
                userId: ctx.session.user.id,
                ...(input.integrationId && { integrationId: input.integrationId }),
                ...(input.triggerType && { triggerType: input.triggerType }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
                ...(input.search && {
                    OR: [
                        { name: { contains: input.search, mode: 'insensitive' as const } },
                        { description: { contains: input.search, mode: 'insensitive' as const } },
                    ],
                }),
            };

            const workflows = await ctx.db.workflow.findMany({
                where,
                include: {
                    integration: {
                        select: {
                            id: true,
                            accountUsername: true,
                            type: true,
                        },
                    },
                    _count: {
                        select: {
                            executions: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                take: input.limit + 1,
                ...(input.cursor && {
                    cursor: { id: input.cursor },
                    skip: 1,
                }),
            });

            let nextCursor: string | undefined = undefined;
            if (workflows.length > input.limit) {
                const nextItem = workflows.pop();
                nextCursor = nextItem?.id;
            }

            // Calculate success rate for each workflow
            const workflowsWithStats = await Promise.all(
                workflows.map(async (workflow) => {
                    const successRate = workflow.totalRuns > 0
                        ? Math.round((workflow.successfulRuns / workflow.totalRuns) * 100)
                        : null;

                    // Get last 7 days execution trend
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    const recentExecutions = await ctx.db.workflowExecution.count({
                        where: {
                            workflowId: workflow.id,
                            createdAt: { gte: sevenDaysAgo },
                        },
                    });

                    return {
                        ...workflow,
                        successRate,
                        recentExecutions,
                    };
                })
            );

            return {
                workflows: workflowsWithStats,
                nextCursor,
            };
        }),

    // Get single workflow
    get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflow.findFirst({
            where: {
                id: input.id,
                userId: ctx.session.user.id,
            },
            include: {
                integration: true,
                executions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        phases: {
                            include: {
                                logs: true,
                            },
                        },
                    },
                },
            },
        });

        if (!workflow) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Workflow not found',
            });
        }

        return workflow;
    }),

    // Create workflow
    create: protectedProcedure
        .input(createWorkflowSchema)
        .mutation(async ({ ctx, input }) => {
            // Verify integration ownership
            const integration = await ctx.db.integration.findFirst({
                where: {
                    id: input.integrationId,
                    userId: ctx.session.user.id,
                },
            });

            if (!integration) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Integration not found',
                });
            }

            // Check for duplicate name
            const existing = await ctx.db.workflow.findFirst({
                where: {
                    name: input.name,
                    userId: ctx.session.user.id,
                },
            });

            if (existing) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'A workflow with this name already exists',
                });
            }

            const workflow = await ctx.db.workflow.create({
                data: {
                    userId: ctx.session.user.id,
                    integrationId: input.integrationId,
                    name: input.name,
                    description: input.description,
                    definition: JSON.stringify(input.definition),
                    triggerType: input.triggerType,
                    isActive: input.isActive,
                },
            });

            return workflow;
        }),

    // Update workflow
    update: protectedProcedure.input(z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        definition: z.any().optional(),
        isActive: z.boolean().optional(),
    }))
        .mutation(async ({ ctx, input }) => {
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Workflow not found',
                });
            }

            // Check name uniqueness if updating name
            if (input.name && input.name !== workflow.name) {
                const existing = await ctx.db.workflow.findFirst({
                    where: {
                        name: input.name,
                        userId: ctx.session.user.id,
                        NOT: { id: input.id },
                    },
                });

                if (existing) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'A workflow with this name already exists',
                    });
                }
            }

            const updated = await ctx.db.workflow.update({
                where: { id: input.id },
                data: {
                    ...(input.name && { name: input.name }),
                    ...(input.description !== undefined && { description: input.description }),
                    ...(input.definition && { definition: JSON.stringify(input.definition) }),
                    ...(input.isActive !== undefined && { isActive: input.isActive }),
                },
            });

            return updated;
        }),

    // Delete workflow
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
                include: {
                    _count: {
                        select: { executions: true },
                    },
                },
            });

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Workflow not found',
                });
            }

            await ctx.db.workflow.delete({
                where: { id: input.id },
            });

            return {
                success: true,
                deletedExecutions: workflow._count.executions,
            };
        }),

    // Toggle active status
    toggleActive: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Workflow not found',
                });
            }

            const updated = await ctx.db.workflow.update({
                where: { id: input.id },
                data: {
                    isActive: !workflow.isActive,
                },
            });

            return updated;
        }),

    // Duplicate workflow
    duplicate: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const workflow = await ctx.db.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
            });

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Workflow not found',
                });
            }

            // Generate unique name
            let newName = `${workflow.name} (Copy)`;
            let counter = 1;
            while (true) {
                const existing = await ctx.db.workflow.findFirst({
                    where: {
                        name: newName,
                        userId: ctx.session.user.id,
                    },
                });
                if (!existing) break;
                counter++;
                newName = `${workflow.name} (Copy ${counter})`;
            }

            const duplicated = await ctx.db.workflow.create({
                data: {
                    userId: ctx.session.user.id,
                    integrationId: workflow.integrationId!,
                    name: newName,
                    description: workflow.description,
                    definition: workflow.definition,
                    triggerType: workflow.triggerType,
                    isActive: false, // Always start inactive
                },
            });

            return duplicated;
        }),

    // Get workflow statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const [total, active, byTriggerType, recentExecutions] = await Promise.all([
            // Total workflows
            ctx.db.workflow.count({ where: { userId } }),

            // Active workflows
            ctx.db.workflow.count({ where: { userId, isActive: true } }),

            // By trigger type
            ctx.db.workflow.groupBy({
                by: ['triggerType'],
                where: { userId },
                _count: true,
            }),

            // Recent executions (last 24h)
            ctx.db.workflowExecution.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        return {
            total,
            active,
            inactive: total - active,
            byTriggerType: byTriggerType.reduce((acc, item) => {
                acc[item.triggerType] = item._count;
                return acc;
            }, {} as Record<WorkflowTriggerType, number>),
            recentExecutions,
        };
    }),


    // create: protectedProcedure
    //     .input(createWorkflowSchema)
    //     .mutation(async ({ ctx, input }) => {
    //         const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id! } })
    //         if (!user) throw new Error("User not found")
    //         const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
    //             nodes: [],
    //             edges: [],
    //         };

    //         // Let's add the flow entry point
    //         // initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

    //         const result = await ctx.db.workflow.create({
    //             data: {
    //                 userId: user.id,
    //                 status: WorkflowStatus.DRAFT,
    //                 definition: "",
    //                 ...input,
    //             },
    //         });

    //         if (!result) {
    //             throw new Error("failed to create workflow");
    //         }
    //         return result;
    //     }),

    getWorkflowsForUser: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.workflow.findMany({
            where: { userId: ctx.session.user.id! },
            orderBy: {
                createdAt: "asc",
            },
        })
    }),
    getWorkflowDetails: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.workflow.findUnique({
            where: { id: input.id, userId: ctx.session.user.id! },
        })
    }),

    getWorkflowlowExecution: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflowExecution.findMany({
            where: {
                workflowId: input.id,
                userId: ctx.session.user.id!,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return workflow
    }),
    getWorkflowExecutionWithPhases: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.workflowExecution.findUnique({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
            include: {
                phases: {
                    orderBy: {
                        number: "asc",
                    },
                },
            },
        })
    }),
    getWorkflowPhaseDetails: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.executionPhase.findUnique({
            where: {
                id: input.id,
                execution: {
                    userId: ctx.session.user.id!,
                },
            },
            include: {
                logs: {
                    orderBy: {
                        timestamp: "asc",
                    },
                },
            },
        })
    }),
    // publishWorkflow: protectedProcedure.input(z.object({ id: z.string(), flowDefinition: z.string() })).mutation(async ({ ctx, input }) => {
    //     const workflow = await ctx.db.workflow.findUnique({
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //     });

    //     if (!workflow) {
    //         throw new Error("workflow not found");
    //     }

    //     if (workflow.status !== WorkflowStatus.DRAFT) {
    //         throw new Error("workflow is not a draft");
    //     }

    //     const flow = JSON.parse(input.flowDefinition);
    //     const result = FlowToExecutionPlan(flow.nodes, flow.edges);
    //     if (result.error) {
    //         throw new Error("flow definition not valid");
    //     }

    //     if (!result.executionPlan) {
    //         throw new Error("no execution plan generated");
    //     }

    //     const creditsCost = CalculateWorkflowCost(flow.nodes);
    //     await ctx.db.workflow.update({
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //         data: {
    //             definition: input.flowDefinition,
    //             executionPlan: JSON.stringify(result.executionPlan),
    //             creditsCost,
    //             status: WorkflowStatus.PUBLISHED,
    //         },
    //     });
    // }),
    // removeWorkflowSchedule: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    //     return await ctx.db.workflow.update({
    //         where: { id: input.id, userId: ctx.session.user.id! },
    //         data: {
    //             cron: null,
    //             nextRunAt: null,
    //         },
    //     });
    // }),
    // unpublishWorkflow: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    //     const workflow = await ctx.db.workflow.findUnique({
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //     });

    //     if (!workflow) {
    //         throw new Error("workflow not found");
    //     }

    //     if (workflow.status !== WorkflowStatus.PUBLISHED) {
    //         throw new Error("workflow is not published");
    //     }

    //     await ctx.db.workflow.update({
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //         data: {
    //             status: WorkflowStatus.DRAFT,
    //             executionPlan: null,
    //             creditsCost: 0,
    //         },
    //     });
    //     return workflow;
    // }),
    // update: protectedProcedure.input(updateWorkflowSchema).mutation(async ({ ctx, input }) => {
    //     const workflow = await ctx.db.workflow.findUnique({
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //     });

    //     if (!workflow) {
    //         throw new Error("workflow not found");
    //     }
    //     if (workflow.status !== WorkflowStatus.DRAFT) {
    //         throw new Error("workflow is not a draft");
    //     }

    //     await ctx.db.workflow.update({
    //         data: {
    //             definition: input.definition,
    //         },
    //         where: {
    //             id: input.id,
    //             userId: ctx.session.user.id!,
    //         },
    //     });
    //     return workflow;
    // }),
})
