import { db } from "@/server/db";
import { FlowToExecutionPlan } from "@/lib/workflow/execution-plan";
import type { AppNode } from "@/types/app-node.type";
import type { Edge } from "@xyflow/react";
import type { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow.type";
import { InstagramService } from "@/server/services/instagram-service";
import { Redis } from "@upstash/redis";
import { WorkflowBasedActionTracker } from "./workflow-base-action-tracker";
import { TaskType } from "@/types/task.type";

interface ExecutionContext {
    comment?: any;
    message?: any;
    integration: any;
    workflowId: string;
    executionId: string;
    outputs: Map<string, any>; // Store outputs from previous nodes
}

export class FlowBasedWorkflowExecutor {
    private redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    private actionTracker = new WorkflowBasedActionTracker(this.redis);

    /**
     * Execute workflow based on node/edge flow definition
     */
    async executeWorkflow(
        workflow: any,
        context: {
            comment?: any;
            message?: any;
            integration: any;
        }
    ): Promise<{ success: boolean; executionId: string; error?: string }> {
        console.log(`🚀 Executing flow-based workflow ${workflow.id}`);

        try {
            // 1. Parse workflow definition
            const definition = JSON.parse(workflow.definition);
            const nodes: AppNode[] = definition.nodes || [];
            const edges: Edge[] = definition.edges || [];

            if (nodes.length === 0) {
                throw new Error('No nodes found in workflow definition');
            }

            // 2. Create execution plan
            const planResult = FlowToExecutionPlan(nodes, edges);
            if (planResult.error) {
                throw new Error(`Invalid workflow: ${planResult.error.type}`);
            }

            const executionPlan = planResult.executionPlan!;

            // 3. Create execution record
            const execution = await db.workflowExecution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    trigger: JSON.stringify({
                        type: context.comment ? 'IG_USER_COMMENT' : 'IG_DM_RECEIVED',
                        data: context.comment || context.message
                    }),
                    status: 'RUNNING',
                    startedAt: new Date(),
                    definition: workflow.definition
                }
            });

            // 4. Execute workflow phases
            const executionContext: ExecutionContext = {
                ...context,
                workflowId: workflow.id,
                executionId: execution.id,
                outputs: new Map()
            };

            await this.executeWorkflowPlan(executionPlan, executionContext);

            // 5. Mark execution as successful
            await db.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'SUCCESS', // Database uses SUCCESS instead of COMPLETED
                    completedAt: new Date()
                }
            });

            console.log(`✅ Workflow ${workflow.id} executed successfully`);
            return { success: true, executionId: execution.id };

        } catch (error) {
            console.error(`❌ Workflow execution failed:`, error);
            return {
                success: false,
                executionId: '',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Execute workflow plan phase by phase
     */
    private async executeWorkflowPlan(
        executionPlan: WorkflowExecutionPlan,
        context: ExecutionContext
    ): Promise<void> {
        for (const phase of executionPlan) {
            console.log(`🔄 Executing phase ${phase.phase} with ${phase.nodes.length} nodes`);

            await this.executePhase(phase, context);
        }
    }

    /**
     * Execute a single phase (nodes in parallel)
     */
    private async executePhase(
        phase: WorkflowExecutionPlanPhase,
        context: ExecutionContext
    ): Promise<void> {
        // Execute all nodes in this phase in parallel
        const nodePromises = phase.nodes.map(node => this.executeNode(node, context));

        try {
            await Promise.all(nodePromises);
            console.log(`✅ Phase ${phase.phase} completed successfully`);
        } catch (error) {
            console.error(`❌ Phase ${phase.phase} failed:`, error);
            throw error;
        }
    }

    /**
     * Execute a single node
     */
    private async executeNode(node: AppNode, context: ExecutionContext): Promise<void> {
        console.log(`🎯 Executing node ${node.id} (${node.data.type})`);

        // Create execution phase record
        const phaseRecord = await db.executionPhase.create({
            data: {
                workflowExecutionId: context.executionId,
                userId: context.integration.userId,
                number: 1, // Will be updated based on actual phase
                node: node.id,
                name: node.data.type,
                status: 'RUNNING',
                startedAt: new Date(),
                inputs: JSON.stringify(node.data.inputs || {})
            }
        });

        try {
            // Get node task type and execute
            const nodeType = node.data.type;
            let result: any = {};

            switch (nodeType) {
                case TaskType.IG_USER_COMMENT:
                    result = await this.executeCommentTrigger(node, context);
                    break;

                case TaskType.IG_USER_DM:
                    result = await this.executeDMTrigger(node, context);
                    break;

                case TaskType.IG_SEND_MSG:
                    result = await this.executeReplyAction(node, context);
                    break;

                case TaskType.IG_SEND_MSG_FROM_DM:
                    result = await this.executeDelay(node);
                    break;

                default:
                    throw new Error(`Unknown node type: ${nodeType}`);
            }

            // Store output for next nodes
            context.outputs.set(node.id, result);

            // Update phase record as successful
            await db.executionPhase.update({
                where: { id: phaseRecord.id },
                data: {
                    status: 'SUCCESS', // Database uses SUCCESS instead of COMPLETED
                    completedAt: new Date(),
                    outputs: JSON.stringify(result)
                }
            });

            console.log(`✅ Node ${node.id} executed successfully`);

        } catch (error) {
            // Update phase record as failed
            await db.executionPhase.update({
                where: { id: phaseRecord.id },
                data: {
                    status: 'FAILED',
                    completedAt: new Date(),
                    errorMessage: error instanceof Error ? error.message : String(error)
                }
            });

            console.error(`❌ Node ${node.id} execution failed:`, error);
            throw error;
        }
    }

    /**
     * Execute comment trigger node
     */
    private async executeCommentTrigger(node: AppNode, context: ExecutionContext): Promise<any> {
        const config = node.data.igUserCommentData;

        if (!context.comment) {
            throw new Error('Comment trigger requires comment context');
        }

        // Validate post filter
        if (config?.selectedPostId?.length > 0) {
            const commentPostId = context.comment.postId;
            const isValidPost = config.selectedPostId.includes(commentPostId);

            if (!isValidPost) {
                throw new Error(`Comment post ${commentPostId} not in selected posts`);
            }
        }

        // Validate keyword filters
        const text = context.comment.text.toLowerCase();

        // Include keywords check
        if (config?.includeKeywords?.length > 0) {
            const hasIncludeKeyword = config.includeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (!hasIncludeKeyword) {
                throw new Error('Comment does not contain required keywords');
            }
        }

        // Exclude keywords check
        if (config?.excludeKeywords?.length > 0) {
            const hasExcludeKeyword = config.excludeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (hasExcludeKeyword) {
                throw new Error('Comment contains excluded keywords');
            }
        }

        return {
            commentId: context.comment.id,
            postId: context.comment.postId,
            username: context.comment.username,
            text: context.comment.text,
            validated: true
        };
    }

    /**
     * Execute DM trigger node
     */
    // todo
    private async executeDMTrigger(node: AppNode, context: ExecutionContext): Promise<any> {
        if (!context.message) {
            throw new Error('DM trigger requires message context');
        }

        return {
            messageId: context.message.id,
            senderId: context.message.senderId,
            text: context.message.text,
            validated: true
        };
    }

    /**
     * Execute reply action node
     */
    private async executeReplyAction(node: AppNode, context: ExecutionContext): Promise<any> {
        const config = node.data.igReplyData;

        if (!config) {
            throw new Error('Reply action requires configuration');
        }

        const instagramService = new InstagramService();
        const results = [];

        // Check safety limits using workflow-based tracking
        if (config.safetyConfig?.enabled) {
            const limits = config.safetyConfig.combinedLimits || {
                maxActionsPerHour: 25,
                maxActionsPerDay: 200,
                delayBetweenActions: [5, 15],
                commentToDmDelay: [8, 25]
            };

            const actionTypes = config.safetyConfig.actionTypes || {
                enableCommentReply: true,
                enableDMReply: true
            };

            // Check if we can perform comment reply
            if (config.enableCommentReply && config.publicReplies?.length > 0 && context.comment) {
                const canComment = await this.actionTracker.canPerformAction(
                    context.workflowId,
                    'comment_reply',
                    limits,
                    actionTypes
                );

                if (!canComment.allowed) {
                    throw new Error(`Comment reply blocked: ${canComment.reason}`);
                }
            }

            // Check if we can perform DM
            if (config.enableDMReply && config.dmMessage && context.comment) {
                const canDM = await this.actionTracker.canPerformAction(
                    context.workflowId,
                    'dm_send',
                    limits,
                    actionTypes
                );

                if (!canDM.allowed) {
                    throw new Error(`DM send blocked: ${canDM.reason}`);
                }
            }
        }

        // Execute public reply if configured
        if (config.enableCommentReply && config.publicReplies?.length > 0 && context.comment) {
            const randomReply = config.publicReplies[
                Math.floor(Math.random() * config.publicReplies.length)
            ];

            try {
                await instagramService.replyToComment(
                    context.integration.accountId,
                    context.comment.commentId,
                    randomReply,
                    context.integration.accessToken
                );

                // Record action for workflow
                if (config.safetyConfig?.enabled) {
                    await this.actionTracker.recordAction(
                        context.workflowId,
                        'comment_reply',
                        {
                            commentId: context.comment.commentId,
                            replyText: randomReply,
                            username: context.comment.username
                        }
                    );
                }

                // Update comment status
                await db.comment.update({
                    where: { commentId: context.comment.commentId },
                    data: {
                        isReplied: true,
                        repliedAt: new Date(),
                        replyText: randomReply,
                        replyStatus: 'SUCCESS'
                    }
                });

                results.push({ type: 'comment_reply', success: true, text: randomReply });
                console.log(`✅ Replied to comment: ${randomReply}`);

            } catch (error) {
                results.push({
                    type: 'comment_reply',
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
                console.error(`❌ Failed to reply to comment:`, error);
            }
        }

        // Execute DM if configured
        if (config.enableDMReply && config.dmMessage && context.comment) {
            // Add delay between comment reply and DM
            if (config.safetyConfig?.combinedLimits?.commentToDmDelay) {
                const [min, max] = config.safetyConfig.combinedLimits.commentToDmDelay;
                const delay = Math.floor(Math.random() * (max - min + 1)) + min;
                console.log(`⏱️ Waiting ${delay}s before sending DM`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }

            try {
                await instagramService.sendDirectMessage(
                    context.integration.accountId,
                    context.comment.userId,
                    config.dmMessage,
                    context.integration.accessToken
                );

                // Record action for workflow
                if (config.safetyConfig?.enabled) {
                    await this.actionTracker.recordAction(
                        context.workflowId,
                        'dm_send',
                        {
                            recipientId: context.comment.userId,
                            recipientUsername: context.comment.username,
                            message: config.dmMessage,
                            triggeredByComment: context.comment.commentId
                        }
                    );
                }

                // Update comment DM status
                await db.comment.update({
                    where: { commentId: context.comment.commentId },
                    data: {
                        dmSent: true,
                        dmSentAt: new Date()
                    }
                });

                results.push({ type: 'dm_send', success: true, text: config.dmMessage });
                console.log(`✅ Sent DM: ${config.dmMessage}`);

            } catch (error) {
                results.push({
                    type: 'dm_send',
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
                console.error(`❌ Failed to send DM:`, error);
            }
        }

        return {
            actionsExecuted: results.length,
            results,
            workflowStats: config.safetyConfig?.enabled
                ? await this.actionTracker.getWorkflowStats(context.workflowId)
                : null
        };
    }

    /**
     * Execute delay node
     */
    private async executeDelay(node: AppNode): Promise<any> {
        const delaySeconds = node.data.delaySeconds || 0;

        if (delaySeconds > 0) {
            console.log(`⏱️ Delaying for ${delaySeconds} seconds`);
            await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        }

        return { delayExecuted: delaySeconds };
    }

}