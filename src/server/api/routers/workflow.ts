import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createWorkflowSchema, duplicateWorkflowSchema } from "@/schema/workflow";
import type { AppNode } from "@/types/app-node.type";
import type { Edge } from "@xyflow/react";
import { CreateFlowNode } from "@/lib/workflow/create-flow-node";
import { TaskType } from "@/types/task.type";
import { WorkflowStatus } from "@/types/workflow.type";
import { z } from "zod";
import { FlowToExecutionPlan } from "@/lib/workflow/execution-plan";
import { CalculateWorkflowCost } from "@/lib/workflow/helpers";

export const workflowRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createWorkflowSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id! } })
            if (!user) throw new Error("User not found")
            const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
                nodes: [],
                edges: [],
            };

            // Let's add the flow entry point
            initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

            const result = await ctx.db.workflow.create({
                data: {
                    userId: user.id,
                    status: WorkflowStatus.DRAFT,
                    definition: JSON.stringify(initialFlow),
                    ...input,
                },
            });

            if (!result) {
                throw new Error("failed to create workflow");
            }
            return result;
        }),
    getWorkflowsForUser: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.workflow.findMany({
            where: { userId: ctx.session.user.id! },
            orderBy: {
                createdAt: "asc",
            },
        })
    }),
    delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.workflow.delete({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
        })
    }),
    duplicate: protectedProcedure.input(duplicateWorkflowSchema).mutation(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflow.findUnique({
            where: {
                id: input.workflowId,
                userId: ctx.session.user.id!,
            },
        })
        if (!workflow) throw new Error("Workflow not found")
        const newWorkflow = await ctx.db.workflow.create({
            data: {
                userId: ctx.session.user.id!,
                name: input.name,
                description: input.description,
                status: WorkflowStatus.DRAFT,
                definition: workflow.definition,
            },
        })
        if (!newWorkflow) throw new Error("Failed to duplicate workflow")
        return newWorkflow
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
    publishWorkflow: protectedProcedure.input(z.object({ id: z.string(), flowDefinition: z.string() })).mutation(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflow.findUnique({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
        });

        if (!workflow) {
            throw new Error("workflow not found");
        }

        if (workflow.status !== WorkflowStatus.DRAFT) {
            throw new Error("workflow is not a draft");
        }

        const flow = JSON.parse(input.flowDefinition);
        const result = FlowToExecutionPlan(flow.nodes, flow.edges);
        if (result.error) {
            throw new Error("flow definition not valid");
        }

        if (!result.executionPlan) {
            throw new Error("no execution plan generated");
        }

        const creditsCost = CalculateWorkflowCost(flow.nodes);
        await ctx.db.workflow.update({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
            data: {
                definition: input.flowDefinition,
                executionPlan: JSON.stringify(result.executionPlan),
                creditsCost,
                status: WorkflowStatus.PUBLISHED,
            },
        });
    }),
    removeWorkflowSchedule: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.workflow.update({
            where: { id: input.id, userId: ctx.session.user.id! },
            data: {
                cron: null,
                nextRunAt: null,
            },
        });
    }),
    unpublishWorkflow: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflow.findUnique({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
        });

        if (!workflow) {
            throw new Error("workflow not found");
        }

        if (workflow.status !== WorkflowStatus.PUBLISHED) {
            throw new Error("workflow is not published");
        }

        await ctx.db.workflow.update({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
            data: {
                status: WorkflowStatus.DRAFT,
                executionPlan: null,
                creditsCost: 0,
            },
        });
        return workflow;
    }),
    update: protectedProcedure.input(z.object({ id: z.string(), definition: z.string() })).mutation(async ({ ctx, input }) => {
        const workflow = await ctx.db.workflow.findUnique({
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
        });

        if (!workflow) {
            throw new Error("workflow not found");
        }
        if (workflow.status !== WorkflowStatus.DRAFT) {
            throw new Error("workflow is not a draft");
        }

        await ctx.db.workflow.update({
            data: {
                definition: input.definition,
            },
            where: {
                id: input.id,
                userId: ctx.session.user.id!,
            },
        });
        return workflow;
    }),
})
