import { db } from "@/server/db";
import { WorkflowTriggerType } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { InstagramService } from "./instagram-service";
import { FlowBasedWorkflowExecutor } from "./flow-base-executor";

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
                    triggerType: WorkflowTriggerType.IG_COMMENT_RECEIVED
                }
            });

            console.log(`Found ${workflows.length} active workflows for comment trigger`);

            // 5. Execute workflows with post validation and combined actions
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
     * Execute workflow for comment with Flow-Based Execution
     */
    private static async executeWorkflow(
        workflow: any,
        comment: any,
        integration: any
    ): Promise<void> {
        try {
            console.log(`🚀 Executing flow-based workflow ${workflow.id} for comment ${comment.id}`);

            // Initialize Flow-Based Executor
            const executor = new FlowBasedWorkflowExecutor();

            // Execute workflow with context
            const result = await executor.executeWorkflow(workflow, {
                comment,
                integration
            });

            if (result.success) {
                console.log(`✅ Flow-based workflow execution completed: ${result.executionId}`);
            } else {
                console.error(`❌ Flow-based workflow execution failed: ${result.error}`);

                // Log failed execution
                await db.workflowExecution.create({
                    data: {
                        workflowId: workflow.id,
                        userId: workflow.userId,
                        trigger: JSON.stringify({
                            type: 'IG_COMMENT_RECEIVED',
                            commentId: comment.id,
                            postId: comment.postId
                        }),
                        status: 'FAILED',
                        startedAt: new Date(),
                        completedAt: new Date(),
                        definition: workflow.definition,
                        errorMessage: result.error
                    }
                });
            }

        } catch (error) {
            console.error(`Flow-based workflow execution error:`, error);
            throw error;
        }
    }

    /**
     * Validate if comment is on the selected post(s)
     */
    private static async validatePostId(
        comment: any,
        filterConfig: any
    ): Promise<boolean> {
        const selectedPostIds = filterConfig?.selectedPostId;

        // If selectedPostId is not defined or empty array, don't process
        if (!selectedPostIds || (Array.isArray(selectedPostIds) && selectedPostIds.length === 0)) {
            console.log('❌ No posts selected in workflow, skipping processing');
            return false;
        }

        const commentPostId = comment.postId;

        // Always convert to array format for consistent handling
        const postIdsArray = Array.isArray(selectedPostIds) ? selectedPostIds : [selectedPostIds];

        console.log(`Validating post: comment post ID = ${commentPostId}, selected post IDs = [${postIdsArray.join(', ')}]`);

        // Check if comment's postId matches any of the selected posts
        const normalizedCommentPostId = this.normalizePostId(commentPostId);
        const isMatch = postIdsArray.some(postId =>
            this.normalizePostId(postId) === normalizedCommentPostId
        );

        if (!isMatch) {
            console.log(`❌ Post validation failed: comment on ${commentPostId}, workflow for posts [${postIdsArray.join(', ')}]`);
        } else {
            console.log(`✅ Post validation passed: comment matches one of selected posts [${postIdsArray.join(', ')}]`);
        }

        return isMatch;
    }

    /**
     * Normalize post ID for comparison (handle different formats)
     */
    private static normalizePostId(postId: string): string {
        if (!postId) return '';

        // Remove any URL prefixes and get just the ID
        const normalized = postId.toString().replace(/^https?:\/\/[^\/]+\//, '').split('/')[0];
        return normalized || '';
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
                console.log(`❌ Include keyword filter failed: "${comment.text}" doesn't contain any of [${filterConfig.includeKeywords.join(', ')}]`);
                return false;
            }
            console.log(`✅ Include keyword filter passed`);
        }

        // Check exclude keywords
        if (filterConfig.excludeKeywords?.length > 0) {
            const hasExcludeKeyword = filterConfig.excludeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (hasExcludeKeyword) {
                console.log(`❌ Exclude keyword filter failed: "${comment.text}" contains excluded keyword`);
                return false;
            }
            console.log(`✅ Exclude keyword filter passed`);
        }

        return true;
    }
}