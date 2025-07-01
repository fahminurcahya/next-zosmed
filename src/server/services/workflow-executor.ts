// server/services/enhanced-workflow-executor.ts
import { db } from '@/server/db';
import { InstagramAPI } from './instagram-api';
import { InMemoryRateLimiter, RateLimiter } from './rate-limiter';
import { InstagramSafetyChecker, InstagramSafetyConfig } from '@/server/config/instagram-safety';
import { ActionTracker } from './action-tracker';

export class EnhancedWorkflowExecutor {
    private static rateLimiter = new InMemoryRateLimiter();
    private static actionTracker = new ActionTracker();

    static async execute(workflow: any, trigger: { type: string; data: any }) {
        // Check if within active hours
        if (!InstagramSafetyChecker.isWithinActiveHours()) {
            console.log('Outside active hours, delaying workflow execution');
            // Schedule for next active period
            await this.scheduleForLater(workflow, trigger);
            return;
        }

        // Check daily limits before starting
        const dailyStats = await this.actionTracker.getDailyStats(workflow.integrationId);
        if (dailyStats.comments >= InstagramSafetyConfig.rateLimits.commentsPerDay ||
            dailyStats.dms >= InstagramSafetyConfig.rateLimits.dmsPerDay) {
            console.log('Daily limits reached, scheduling for tomorrow');
            await this.scheduleForTomorrow(workflow, trigger);
            return;
        }

        // Execute workflow with safety checks
        await this.executeWithSafety(workflow, trigger);
    }

    private static async executeWithSafety(workflow: any, trigger: { type: string; data: any }) {
        const execution = await db.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                userId: workflow.userId,
                trigger: JSON.stringify(trigger),
                status: 'RUNNING',
                startedAt: new Date(),
                definition: workflow.definition
            }
        });

        try {
            const definition = JSON.parse(workflow.definition);
            const executionOrder = this.getExecutionOrder(definition);
            let previousOutputs = trigger.data;

            for (let i = 0; i < executionOrder.length; i++) {
                const nodeId = executionOrder[i];
                const node = definition.nodes.find((n: any) => n.id === nodeId);

                if (!node) continue;

                // Check if we should pause for safety
                const actionCount = await this.actionTracker.getRecentActionCount(workflow.integrationId);
                if (await InstagramSafetyChecker.shouldPauseForSafety(actionCount)) {
                    console.log('Pausing for safety after burst activity');
                    await this.delay(InstagramSafetyConfig.rateLimits.cooldownAfterBurst);
                }

                // Execute node with safety checks
                const output = await this.executeNodeSafely(
                    node,
                    previousOutputs,
                    workflow.integrationId,
                    execution.id
                );

                previousOutputs = output;
            }

            // Mark execution as successful
            await db.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'SUCCESS',
                    completedAt: new Date()
                }
            });

        } catch (error) {
            await db.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'FAILED',
                    completedAt: new Date()
                }
            });
            throw error;
        }
    }

    private static async executeNodeSafely(
        node: any,
        input: any,
        integrationId: string,
        executionId: string
    ) {
        const integration = await db.integration.findUnique({
            where: { id: integrationId }
        });

        if (!integration) {
            throw new Error('Integration not found');
        }

        switch (node.data.type) {
            case 'IG_USER_COMMENT':
                return this.executeCommentFilter(node, input);

            case 'IG_SEND_MSG':
                return this.executeSendMessageSafely(node, input, integration, executionId);

            default:
                throw new Error(`Unknown node type: ${node.data.type}`);
        }
    }

    private static async executeSendMessageSafely(
        node: any,
        input: any,
        integration: any,
        executionId: string
    ) {
        const config = node.data.igReplyData;
        const comment = input;

        // 1. Check and apply rate limits
        const canReplyComment = await this.rateLimiter.checkLimit(
            integration.id,
            'comment_reply',
            {
                maxRequests: InstagramSafetyConfig.rateLimits.commentsPerHour,
                windowMs: 60 * 60 * 1000 // 1 hour
            }
        );

        if (!canReplyComment) {
            throw new Error('Comment reply rate limit exceeded');
        }

        const canSendDM = await this.rateLimiter.checkLimit(
            integration.id,
            'dm_send',
            {
                maxRequests: InstagramSafetyConfig.rateLimits.dmsPerHour,
                windowMs: 60 * 60 * 1000 // 1 hour
            }
        );

        if (!canSendDM) {
            throw new Error('DM rate limit exceeded');
        }

        // 2. Add human-like delay
        const delay = InstagramSafetyChecker.getRandomDelay();
        console.log(`Waiting ${delay / 1000} seconds before action`);
        await this.delay(delay);

        const api = new InstagramAPI(integration.accessToken);
        const results: any = {};

        // 3. Reply to comment with safety checks
        if (config.publicReplies && config.publicReplies.length > 0) {
            // Get a random reply template
            const replyTemplate = InstagramSafetyChecker.getRandomTemplate(config.publicReplies);

            // Check if message is safe
            const safetyCheck = InstagramSafetyChecker.isMessageSafe(replyTemplate);
            if (!safetyCheck.safe) {
                throw new Error(`Comment reply failed safety check: ${safetyCheck.reason}`);
            }

            try {
                await api.replyToComment(comment.commentId, replyTemplate);

                // Track action
                await this.actionTracker.trackAction(integration.id, 'comment_reply');

                // Update comment status
                await db.comment.update({
                    where: { id: comment.id },
                    data: {
                        isReplied: true,
                        repliedAt: new Date(),
                        replyText: replyTemplate,
                        replyStatus: 'SUCCESS',
                        workflowExecutionId: executionId
                    }
                });

                results.commentReplied = true;
                results.replyText = replyTemplate;

                // Log success
                await this.logAction(executionId, 'Comment reply sent successfully');

            } catch (error: any) {
                await db.comment.update({
                    where: { id: comment.id },
                    data: { replyStatus: 'FAILED' }
                });
                throw error;
            }
        }

        // 4. Send DM with additional delay and safety
        if (config.dmMessage) {
            // Add extra delay between comment and DM
            const dmDelay = 5000 + Math.random() * 5000; // 5-10 seconds
            await this.delay(dmDelay);

            // Get user profile for personalization
            const userProfile = await api.getUserProfile(comment.userId);
            const username = userProfile?.username || 'there';

            // Personalize message
            const dmTemplate = InstagramSafetyChecker.getRandomTemplate(
                InstagramSafetyConfig.messageTemplates.dmTemplates
            );
            const personalizedIntro = InstagramSafetyChecker.personalizeMessage(
                dmTemplate,
                { username }
            );

            const fullMessage = `${personalizedIntro}\n\n${config.dmMessage}`;

            // Safety check
            const dmSafetyCheck = InstagramSafetyChecker.isMessageSafe(fullMessage);
            if (!dmSafetyCheck.safe) {
                throw new Error(`DM failed safety check: ${dmSafetyCheck.reason}`);
            }

            try {
                const message = {
                    text: fullMessage,
                    quick_replies: config.buttons
                        ?.filter((btn: any) => btn.enabled)
                        .map((btn: any) => ({
                            content_type: 'text',
                            title: btn.title,
                            payload: btn.url
                        }))
                };

                await api.sendDirectMessage(comment.userId, message);

                // Track action
                await this.actionTracker.trackAction(integration.id, 'dm_send');

                // Update comment DM status
                await db.comment.update({
                    where: { id: comment.id },
                    data: {
                        dmSent: true,
                        dmSentAt: new Date()
                    }
                });

                // Update DM counter
                const subscription = await db.subscription.findUnique({
                    where: { userId: integration.userId }
                });

                if (subscription) {
                    await db.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            currentDMCount: { increment: 1 }
                        }
                    });
                }

                results.dmSent = true;
                results.dmMessage = fullMessage;

                // Log success
                await this.logAction(executionId, 'DM sent successfully');

            } catch (error: any) {
                throw error;
            }
        }

        return results;
    }

    private static async executeCommentFilter(node: any, input: any) {
        const config = node.data.igUserCommentData;
        const comment = input;

        // Check include keywords
        if (config.includeKeywords && config.includeKeywords.length > 0) {
            const hasIncludeKeyword = config.includeKeywords.some(
                (keyword: string) => comment.text.toLowerCase().includes(keyword.toLowerCase())
            );

            if (!hasIncludeKeyword) {
                throw new Error('Comment does not match include keywords');
            }
        }

        // Check exclude keywords
        if (config.excludeKeywords && config.excludeKeywords.length > 0) {
            const hasExcludeKeyword = config.excludeKeywords.some(
                (keyword: string) => comment.text.toLowerCase().includes(keyword.toLowerCase())
            );

            if (hasExcludeKeyword) {
                throw new Error('Comment matches exclude keywords');
            }
        }

        return comment;
    }

    private static getExecutionOrder(definition: any): string[] {
        const order: string[] = [];
        const visited = new Set<string>();

        const visit = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const dependencies = definition.edges
                .filter((e: any) => e.target === nodeId)
                .map((e: any) => e.source);

            dependencies.forEach((dep: string) => visit(dep));
            order.push(nodeId);
        };

        definition.nodes.forEach((node: any) => visit(node.id));
        return order;
    }

    private static async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private static async logAction(executionId: string, message: string) {
        console.log(`[Execution ${executionId}] ${message}`);
    }

    private static async scheduleForLater(workflow: any, trigger: any) {
        // In production, use a job queue like BullMQ
        // For now, just log
        console.log('Workflow scheduled for next active period');
    }

    private static async scheduleForTomorrow(workflow: any, trigger: any) {
        // In production, use a job queue like BullMQ
        // For now, just log
        console.log('Workflow scheduled for tomorrow');
    }
}