import type { PrismaClient, Workflow, WorkflowExecution } from "@prisma/client";
import type { InstagramService } from "./instagram-service";
import type { WorkflowDefinition } from "@/types/workflow.type";
import type { AppNode } from "@/types/app-node.type";
import { TaskType } from "@/types/task.type";

export class WorkflowExecutor {
    constructor(
        private db: PrismaClient,
        private instagramService: InstagramService
    ) { }

    // Execute workflow for a comment
    async executeCommentWorkflow(
        commentData: {
            commentId: string;
            postId: string;
            userId: string;
            username: string;
            text: string;
            instagramAccountId: string;
        },
        integration: any
    ) {
        console.log("Executing workflow for comment:", commentData);

        // Find active workflows for this user
        const workflows = await this.db.workflow.findMany({
            where: {
                userId: integration.userId,
                status: "PUBLISHED",
            },
        });

        for (const workflow of workflows) {
            try {
                const definition: WorkflowDefinition = JSON.parse(workflow.definition);

                // Check if workflow matches the trigger
                const shouldExecute = await this.checkCommentTrigger(
                    definition,
                    commentData
                );

                if (shouldExecute) {
                    await this.executeWorkflow(
                        workflow,
                        definition,
                        commentData,
                        integration
                    );
                }
            } catch (error) {
                console.error(`Error executing workflow ${workflow.id}:`, error);
            }
        }
    }

    // Check if comment matches workflow trigger
    private async checkCommentTrigger(
        definition: WorkflowDefinition,
        commentData: any
    ): Promise<boolean> {
        // Find IG_USER_COMMENT nodes
        const triggerNodes = definition.nodes.filter(
            (node) => node.data.type === TaskType.IG_USER_COMMENT
        );

        for (const node of triggerNodes) {
            const triggerData = node.data.igUserCommentData;
            if (!triggerData) continue;

            // Check include keywords
            if (triggerData.includeKeywords.length > 0) {
                const commentLower = commentData.text.toLowerCase();
                const hasIncludeKeyword = triggerData.includeKeywords.some((keyword: string) =>
                    commentLower.includes(keyword.toLowerCase())
                );

                if (!hasIncludeKeyword) continue;
            }

            // Check exclude keywords
            if (triggerData.excludeKeywords.length > 0) {
                const commentLower = commentData.text.toLowerCase();
                const hasExcludeKeyword = triggerData.excludeKeywords.some((keyword: string) =>
                    commentLower.includes(keyword.toLowerCase())
                );

                if (hasExcludeKeyword) continue;
            }

            // All conditions met
            return true;
        }

        return false;
    }

    // Execute the workflow
    private async executeWorkflow(
        workflow: Workflow,
        definition: WorkflowDefinition,
        triggerData: any,
        integration: any
    ) {
        // Create workflow execution record
        const execution = await this.db.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                userId: workflow.userId,
                trigger: "COMMENT",
                status: "RUNNING",
                definition: JSON.stringify(definition),
                startedAt: new Date(),
            },
        });

        try {
            // Execute nodes in order based on edges
            const executionOrder = this.getExecutionOrder(definition);

            for (const nodeId of executionOrder) {
                const node = definition.nodes.find((n) => n.id === nodeId);
                if (!node) continue;

                await this.executeNode(
                    node,
                    execution,
                    triggerData,
                    integration,
                    definition
                );
            }

            // Update execution status
            await this.db.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Workflow execution error:", error);

            // Update execution status
            await this.db.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                },
            });

            throw error;
        }
    }

    // Get execution order based on edges
    private getExecutionOrder(definition: WorkflowDefinition): string[] {
        const order: string[] = [];
        const visited = new Set<string>();

        // Find nodes with no incoming edges (start nodes)
        const startNodes = definition.nodes.filter(
            (node) => !definition.edges.some((edge) => edge.target === node.id)
        );

        // DFS traversal
        const visit = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            order.push(nodeId);

            // Find outgoing edges
            const outgoingEdges = definition.edges.filter(
                (edge) => edge.source === nodeId
            );

            for (const edge of outgoingEdges) {
                visit(edge.target);
            }
        };

        // Start traversal from start nodes
        for (const node of startNodes) {
            visit(node.id);
        }

        return order;
    }

    // Execute individual node
    private async executeNode(
        node: AppNode,
        execution: WorkflowExecution,
        triggerData: any,
        integration: any,
        definition: WorkflowDefinition
    ) {
        const phase = await this.db.executionPhase.create({
            data: {
                workflowExecutionId: execution.id,
                userId: execution.userId,
                status: "RUNNING",
                number: 1,
                node: node.id,
                name: node.data.type,
                startedAt: new Date(),
                inputs: JSON.stringify({ triggerData }),
            },
        });

        try {
            let outputs = {};

            switch (node.data.type) {
                case TaskType.IG_USER_COMMENT:
                    // This is the trigger node, no action needed
                    outputs = { matched: true };
                    break;

                case TaskType.IG_SEND_MSG:
                    outputs = await this.executeReplyNode(
                        node,
                        triggerData,
                        integration
                    );
                    break;

                default:
                    console.log(`Unknown node type: ${node.data.type}`);
            }

            // Update phase
            await this.db.executionPhase.update({
                where: { id: phase.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    outputs: JSON.stringify(outputs),
                },
            });

            // Log execution
            await this.db.executionLog.create({
                data: {
                    executionPhaseId: phase.id,
                    logLevel: "INFO",
                    message: `Node ${node.data.type} executed successfully`,
                },
            });
        } catch (error) {
            // Update phase
            await this.db.executionPhase.update({
                where: { id: phase.id },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                },
            });

            // Log error
            await this.db.executionLog.create({
                data: {
                    executionPhaseId: phase.id,
                    logLevel: "ERROR",
                    message: error instanceof Error ? error.message : "Unknown error",
                },
            });

            throw error;
        }
    }

    // Execute reply node
    private async executeReplyNode(
        node: AppNode,
        triggerData: any,
        integration: any
    ) {
        const replyData = node.data.igReplyData;
        if (!replyData) {
            throw new Error("No reply data found in node");
        }

        const results = {
            commentReply: null as any,
            dmSent: null as any,
        };

        try {
            // 1. Reply to comment publicly
            if (replyData.publicReplies.length > 0) {
                // Select random reply
                const randomReply =
                    replyData.publicReplies[
                    Math.floor(Math.random() * replyData.publicReplies.length)
                    ];

                results.commentReply = await this.instagramService.replyToComment(
                    triggerData.commentId,
                    randomReply,
                    integration.token
                );

                // Update comment status
                await this.db.comment.update({
                    where: { commentId: triggerData.commentId },
                    data: {
                        isReplied: true,
                        repliedAt: new Date(),
                        replyText: randomReply,
                        replyStatus: "SUCCESS",
                    },
                });
            }

            // 2. Send DM
            if (replyData.dmMessage) {
                // Construct DM with buttons
                let dmContent = replyData.dmMessage;

                if (replyData.buttons && replyData.buttons.length > 0) {
                    dmContent += "\n\n";
                    replyData.buttons
                        .filter((btn: any) => btn.enabled)
                        .forEach((btn: any) => {
                            dmContent += `${btn.title}: ${btn.url}\n`;
                        });
                }

                results.dmSent = await this.instagramService.sendDirectMessage(
                    triggerData.userId,
                    dmContent,
                    integration.token
                );

                // Save DM record
                await this.db.dms.create({
                    data: {
                        senderId: integration.instagramId,
                        reciever: triggerData.userId,
                        message: dmContent,
                        isReplied: true,
                        repliedAt: new Date(),
                    },
                });
            }

            // Update analytics
            await this.updateAnalytics(integration.userId);

            return results;
        } catch (error) {
            console.error("Error executing reply node:", error);
            throw error;
        }
    }

    // Update analytics
    private async updateAnalytics(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await this.db.analytics.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                commentCount: { increment: 1 },
                dmCount: { increment: 1 },
            },
            create: {
                userId,
                date: today,
                commentCount: 1,
                dmCount: 1,
            },
        });
    }
}
