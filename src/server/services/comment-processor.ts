import { db } from "@/server/db";
import { WorkflowTriggerType } from "@prisma/client";
import { InstagramService } from "@/server/services/instagram-service";
import { ActionTracker } from "@/server/services/action-tracker";
import { Redis } from "@upstash/redis";
import { CombinedActionsExecutor } from "./combine-actions-executor";

interface CommentData {
    id: string;
    text: string;
    from: {
        id: string;
        username: string;
    };
    media?: {
        id: string;
    };
    parent_id?: string;
}

export class CommentProcessor {
    private static redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    /**
     * Process incoming comment webhook
     */
    static async process(
        integration: any,
        commentData: CommentData,
        webhookEventId: string
    ): Promise<void> {
        console.log(`💬 Processing comment ${commentData.id} from @${commentData.from.username}`);

        try {
            // 1. Deduplicate - check if already processed
            const isDuplicate = await this.checkDuplicate(commentData.id);
            if (isDuplicate) {
                console.log(`Comment ${commentData.id} already processed, skipping`);
                return;
            }

            // 2. Get full comment details if needed
            const fullComment = await this.enrichCommentData(
                commentData,
                integration.accessToken
            );

            // 3. Save comment to database
            const comment = await this.saveComment(integration.id, fullComment);

            // 4. Find matching workflows
            const workflows = await db.workflow.findMany({
                where: {
                    integrationId: integration.id,
                    isActive: true,
                    triggerType: WorkflowTriggerType.COMMENT_RECEIVED
                }
            });

            console.log(`Found ${workflows.length} active workflows for comment trigger`);

            // 5. Execute workflows with Combined Actions
            for (const workflow of workflows) {
                await this.executeWorkflow(workflow, comment, integration);
            }

        } catch (error) {
            console.error(`Error processing comment ${commentData.id}:`, error);
            throw error;
        }
    }

    /**
     * Check if comment was already processed (deduplication)
     */
    private static async checkDuplicate(commentId: string): Promise<boolean> {
        const key = `processed_comment:${commentId}`;
        const exists = await this.redis.get(key);

        if (exists) {
            return true;
        }

        // Mark as processed with 24 hour TTL
        await this.redis.set(key, "1", { ex: 86400 });
        return false;
    }

    /**
     * Enrich comment data if needed
     */
    private static async enrichCommentData(
        commentData: CommentData,
        accessToken: string
    ): Promise<CommentData> {
        // If we don't have media info, fetch full comment details
        if (!commentData.media?.id) {
            const instagramService = new InstagramService();
            const fullComment = await instagramService.getCommentDetails(
                commentData.id,
                accessToken
            );
            return fullComment || commentData;
        }
        return commentData;
    }

    /**
     * Save comment to database
     */
    private static async saveComment(
        integrationId: string,
        commentData: CommentData
    ) {
        return await db.comment.upsert({
            where: { commentId: commentData.id },
            update: {
                text: commentData.text,
                username: commentData.from.username,
                updatedAt: new Date()
            },
            create: {
                integrationId,
                commentId: commentData.id,
                postId: commentData.media?.id || 'unknown',
                userId: commentData.from.id,
                username: commentData.from.username,
                text: commentData.text,
                parentId: commentData.parent_id
            }
        });
    }

    /**
     * Execute workflow for comment with Combined Actions
     */
    private static async executeWorkflow(
        workflow: any,
        comment: any,
        integration: any
    ): Promise<void> {
        try {
            console.log(`🚀 Executing workflow ${workflow.id} for comment ${comment.id}`);

            // Parse workflow definition
            const definition = JSON.parse(workflow.definition);

            // Find comment trigger node
            const triggerNode = definition.nodes.find(
                (n: any) => n.data.type === 'IG_USER_COMMENT'
            );

            if (!triggerNode) {
                console.log('No comment trigger node found');
                return;
            }

            // Check keyword filters
            const matchesFilters = await this.checkKeywordFilters(
                comment,
                triggerNode.data.igUserCommentData
            );

            if (!matchesFilters) {
                console.log('Comment does not match keyword filters');
                return;
            }

            // Find reply node with Combined Actions config
            const replyNode = definition.nodes.find(
                (n: any) => n.data.type === 'IG_SEND_MSG'
            );

            if (!replyNode?.data?.igReplyData) {
                console.log('No reply configuration found');
                return;
            }

            // Execute with Combined Actions
            const executor = new CombinedActionsExecutor(
                new ActionTracker(this.redis),
                integration.id
            );

            const result = await executor.executeReplyAction(
                replyNode.data.igReplyData,
                {
                    comment,
                    integration,
                    workflowId: workflow.id
                }
            );

            // Log execution result
            await db.workflowExecution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    trigger: JSON.stringify({
                        type: 'IG_USER_COMMENT',
                        commentId: comment.id,
                        username: comment.username
                    }),
                    status: result.success ? 'SUCCESS' : 'FAILED',
                    startedAt: new Date(),
                    completedAt: new Date(),
                    definition: workflow.definition,
                    metadata: JSON.stringify({
                        actionsPerformed: result.actionsPerformed,
                        budgetUsed: result.budgetUsed,
                        errors: result.errors
                    })
                }
            });

            console.log(`✅ Workflow execution completed:`, result);

        } catch (error) {
            console.error(`Workflow execution error:`, error);

            // Log failed execution
            await db.workflowExecution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    trigger: JSON.stringify({
                        type: 'IG_USER_COMMENT',
                        commentId: comment.id
                    }),
                    status: 'FAILED',
                    startedAt: new Date(),
                    completedAt: new Date(),
                    definition: workflow.definition,
                    errorMessage: error instanceof Error ? error.message : String(error)
                }
            });
        }
    }

    /**
     * Check if comment matches keyword filters
     */
    private static async checkKeywordFilters(
        comment: any,
        filterConfig: any
    ): Promise<boolean> {
        if (!filterConfig) return true;

        const text = comment.text.toLowerCase();

        // Check include keywords
        if (filterConfig.includeKeywords?.length > 0) {
            const hasIncludeKeyword = filterConfig.includeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (!hasIncludeKeyword) {
                return false;
            }
        }

        // Check exclude keywords
        if (filterConfig.excludeKeywords?.length > 0) {
            const hasExcludeKeyword = filterConfig.excludeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (hasExcludeKeyword) {
                return false;
            }
        }

        return true;
    }
}