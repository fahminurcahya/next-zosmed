// server/services/flexible-workflow-executor.ts
import { db } from '@/server/db';
import { InstagramAPI } from './instagram-api';
import { InMemoryRateLimiter, RateLimiter } from './rate-limiter';
import { InstagramSafetyChecker, InstagramSafetyConfig } from '@/server/config/instagram-safety';
import { ActionTracker } from './action-tracker';
import type { WorkflowDefinition } from '@/types/workflow-definition.type';

export class FlexibleWorkflowExecutor {
    private static rateLimiter = new InMemoryRateLimiter();
    private static actionTracker = new ActionTracker();

    static async execute(workflow: any, trigger: { type: string; data: any }) {
        const definition: WorkflowDefinition = JSON.parse(workflow.definition);
        const safetySettings = definition.safetySettings;

        // Check if safety is completely disabled
        if (!safetySettings?.enabled) {
            console.warn(`[Workflow ${workflow.id}] Running in UNSAFE mode - no limits applied`);
            await this.executeUnsafe(workflow, trigger, definition);
            return;
        }

        // Execute with custom safety settings
        await this.executeWithCustomSafety(workflow, trigger, definition);
    }

    // Unsafe execution - no limits, no delays (customer's risk)
    private static async executeUnsafe(
        workflow: any,
        trigger: any,
        definition: WorkflowDefinition
    ) {
        const execution = await db.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                userId: workflow.userId,
                trigger: JSON.stringify(trigger),
                status: 'RUNNING',
                startedAt: new Date(),
                definition: JSON.stringify(definition)
            }
        });

        try {
            const executionOrder = this.getExecutionOrder(definition);
            let previousOutputs = trigger.data;

            for (const nodeId of executionOrder) {
                const node = definition.nodes.find(n => n.id === nodeId);
                if (!node) continue;

                const phase = await db.executionPhase.create({
                    data: {
                        workflowExecutionId: execution.id,
                        userId: workflow.userId,
                        number: executionOrder.indexOf(nodeId) + 1,
                        node: nodeId,
                        name: node.data.type,
                        status: 'RUNNING',
                        startedAt: new Date(),
                        inputs: JSON.stringify(previousOutputs)
                    }
                });

                try {
                    // Execute without any safety checks
                    const output = await this.executeNodeUnsafe(
                        node,
                        previousOutputs,
                        workflow.integrationId
                    );

                    await db.executionPhase.update({
                        where: { id: phase.id },
                        data: {
                            status: 'SUCCESS',
                            completedAt: new Date(),
                            outputs: JSON.stringify(output)
                        }
                    });

                    previousOutputs = output;

                } catch (error: any) {
                    await db.executionPhase.update({
                        where: { id: phase.id },
                        data: {
                            status: 'FAILED',
                            completedAt: new Date(),
                            errorMessage: error.message
                        }
                    });
                    throw error;
                }
            }

            await this.completeExecution(execution.id, workflow.id, 'SUCCESS');

        } catch (error) {
            await this.completeExecution(execution.id, workflow.id, 'FAILED');
            throw error;
        }
    }

    // Execute with custom safety settings
    private static async executeWithCustomSafety(
        workflow: any,
        trigger: any,
        definition: WorkflowDefinition
    ) {
        const safetySettings = definition.safetySettings!;

        // Check active hours if enabled
        if (safetySettings.activeHours?.enabled) {
            const now = new Date();
            const hour = now.getHours();
            const start = safetySettings.activeHours.startHour || 9;
            const end = safetySettings.activeHours.endHour || 22;

            if (hour < start || hour >= end) {
                console.log('Outside active hours, delaying execution');
                // In production, queue for later
                return;
            }
        }

        // Get rate limits (custom or recommended)
        const limits = this.getRateLimits(safetySettings);

        // Check daily limits if enabled
        if (safetySettings.useRecommendedLimits || safetySettings.customLimits) {
            const dailyStats = await this.actionTracker.getDailyStats(workflow.integrationId);

            if (dailyStats.comments >= limits.commentsPerDay ||
                dailyStats.dms >= limits.dmsPerDay) {
                console.log('Daily limits reached');
                return;
            }
        }

        // Execute with safety
        const execution = await db.workflowExecution.create({
            data: {
                workflowId: workflow.id,
                userId: workflow.userId,
                trigger: JSON.stringify(trigger),
                status: 'RUNNING',
                startedAt: new Date(),
                definition: JSON.stringify(definition)
            }
        });

        try {
            const executionOrder = this.getExecutionOrder(definition);
            let previousOutputs = trigger.data;

            for (const nodeId of executionOrder) {
                const node = definition.nodes.find(n => n.id === nodeId);
                if (!node) continue;

                const output = await this.executeNodeWithSafety(
                    node,
                    previousOutputs,
                    workflow.integrationId,
                    execution.id,
                    safetySettings,
                    limits
                );

                previousOutputs = output;
            }

            await this.completeExecution(execution.id, workflow.id, 'SUCCESS');

        } catch (error) {
            await this.completeExecution(execution.id, workflow.id, 'FAILED');
            throw error;
        }
    }

    private static async executeNodeWithSafety(
        node: any,
        input: any,
        integrationId: string,
        executionId: string,
        safetySettings: any,
        limits: any
    ) {
        const integration = await db.integration.findUnique({
            where: { id: integrationId }
        });

        if (!integration) throw new Error('Integration not found');

        switch (node.data.type) {
            case 'IG_USER_COMMENT':
                return this.executeCommentFilter(node, input);

            case 'IG_SEND_MSG':
                return this.executeSendMessageWithSafety(
                    node,
                    input,
                    integration,
                    executionId,
                    safetySettings,
                    limits
                );

            default:
                throw new Error(`Unknown node type: ${node.data.type}`);
        }
    }

    private static async executeSendMessageWithSafety(
        node: any,
        input: any,
        integration: any,
        executionId: string,
        safetySettings: any,
        limits: any
    ) {
        const config = node.data.igReplyData;
        const comment = input;
        const nodeOverrides = config.safetyOverride || {};

        // Check rate limits if not skipped
        if (safetySettings.useRecommendedLimits || safetySettings.customLimits) {
            const canReply = await this.rateLimiter.checkLimit(
                integration.id,
                'comment_reply',
                {
                    maxRequests: limits.commentsPerHour,
                    windowMs: 60 * 60 * 1000
                }
            );

            if (!canReply) {
                throw new Error('Comment rate limit exceeded');
            }

            const canDM = await this.rateLimiter.checkLimit(
                integration.id,
                'dm_send',
                {
                    maxRequests: limits.dmsPerHour,
                    windowMs: 60 * 60 * 1000
                }
            );

            if (!canDM) {
                throw new Error('DM rate limit exceeded');
            }
        }

        // Apply delay if enabled and not skipped
        if (safetySettings.delays?.enabled && !nodeOverrides.skipDelay) {
            const delay = nodeOverrides.customDelay ||
                this.getRandomDelay(
                    safetySettings.delays.minDelay || 5000,
                    safetySettings.delays.maxDelay || 15000
                );
            console.log(`Applying ${delay}ms delay`);
            await this.delay(delay);
        }

        const api = new InstagramAPI(integration.accessToken);
        const results: any = {};

        // Reply to comment
        if (config.publicReplies && config.publicReplies.length > 0) {
            const replyText = config.publicReplies[
                Math.floor(Math.random() * config.publicReplies.length)
            ];

            // Content safety check if enabled and not skipped
            if (safetySettings.contentSafety?.enabled &&
                !nodeOverrides.skipContentCheck) {
                const safetyCheck = this.checkContentSafety(
                    replyText,
                    safetySettings.contentSafety
                );
                if (!safetyCheck.safe) {
                    throw new Error(`Content safety: ${safetyCheck.reason}`);
                }
            }

            try {
                await api.replyToComment(comment.commentId, replyText);
                await this.actionTracker.trackAction(integration.id, 'comment_reply');

                await db.comment.update({
                    where: { id: comment.id },
                    data: {
                        isReplied: true,
                        repliedAt: new Date(),
                        replyText: replyText,
                        replyStatus: 'SUCCESS'
                    }
                });

                results.commentReplied = true;
            } catch (error) {
                console.error('Comment reply failed:', error);
            }
        }

        // Send DM with custom delay
        if (config.dmMessage) {
            if (safetySettings.delays?.enabled) {
                const dmDelay = safetySettings.delays.betweenCommentAndDm || 5000;
                await this.delay(dmDelay);
            }

            // Content check for DM
            if (safetySettings.contentSafety?.enabled &&
                !nodeOverrides.skipContentCheck) {
                const safetyCheck = this.checkContentSafety(
                    config.dmMessage,
                    safetySettings.contentSafety
                );
                if (!safetyCheck.safe) {
                    throw new Error(`DM content safety: ${safetyCheck.reason}`);
                }
            }

            try {
                await api.sendDirectMessage(comment.userId, {
                    text: config.dmMessage,
                    quick_replies: config.buttons?.filter((b: any) => b.enabled)
                });

                await this.actionTracker.trackAction(integration.id, 'dm_send');

                await db.comment.update({
                    where: { id: comment.id },
                    data: {
                        dmSent: true,
                        dmSentAt: new Date()
                    }
                });

                // Update subscription counter
                const subscription = await db.subscription.findUnique({
                    where: { userId: integration.userId }
                });

                if (subscription) {
                    await db.subscription.update({
                        where: { id: subscription.id },
                        data: { currentDMCount: { increment: 1 } }
                    });
                }

                results.dmSent = true;
            } catch (error) {
                console.error('DM send failed:', error);
            }
        }

        return results;
    }

    // Execute node without any safety checks (for unsafe mode)
    private static async executeNodeUnsafe(
        node: any,
        input: any,
        integrationId: string
    ) {
        const integration = await db.integration.findUnique({
            where: { id: integrationId }
        });

        if (!integration) throw new Error('Integration not found');

        switch (node.data.type) {
            case 'IG_USER_COMMENT':
                return this.executeCommentFilter(node, input);

            case 'IG_SEND_MSG':
                const config = node.data.igReplyData;
                const comment = input;
                const api = new InstagramAPI(integration.accessToken);
                const results: any = {};

                // No delays, no checks, just execute
                if (config.publicReplies && config.publicReplies.length > 0) {
                    const replyText = config.publicReplies[0];
                    await api.replyToComment(comment.commentId, replyText);
                    await db.comment.update({
                        where: { id: comment.id },
                        data: {
                            isReplied: true,
                            repliedAt: new Date(),
                            replyText: replyText,
                            replyStatus: 'SUCCESS'
                        }
                    });
                    results.commentReplied = true;
                }

                if (config.dmMessage) {
                    await api.sendDirectMessage(comment.userId, {
                        text: config.dmMessage,
                        quick_replies: config.buttons?.filter((b: any) => b.enabled)
                    });
                    await db.comment.update({
                        where: { id: comment.id },
                        data: {
                            dmSent: true,
                            dmSentAt: new Date()
                        }
                    });
                    results.dmSent = true;
                }

                return results;

            default:
                throw new Error(`Unknown node type: ${node.data.type}`);
        }
    }

    private static getRateLimits(safetySettings: any) {
        if (safetySettings.useRecommendedLimits) {
            return InstagramSafetyConfig.rateLimits;
        }

        if (safetySettings.customLimits) {
            return {
                commentsPerHour: safetySettings.customLimits.commentsPerHour || 25,
                commentsPerDay: safetySettings.customLimits.commentsPerDay || 200,
                dmsPerHour: safetySettings.customLimits.dmsPerHour || 20,
                dmsPerDay: safetySettings.customLimits.dmsPerDay || 100
            };
        }

        return InstagramSafetyConfig.rateLimits;
    }

    private static checkContentSafety(message: string, settings: any) {
        const checks: any = { safe: true };

        if (settings.checkBannedPhrases) {
            const bannedCheck = InstagramSafetyChecker.isMessageSafe(message);
            if (!bannedCheck.safe) return bannedCheck;
        }

        if (settings.maxMentions !== undefined) {
            const mentions = (message.match(/@[\w.]+/g) || []).length;
            if (mentions > settings.maxMentions) {
                return { safe: false, reason: `Too many mentions (${mentions})` };
            }
        }

        if (settings.maxHashtags !== undefined) {
            const hashtags = (message.match(/#[\w]+/g) || []).length;
            if (hashtags > settings.maxHashtags) {
                return { safe: false, reason: `Too many hashtags (${hashtags})` };
            }
        }

        if (settings.maxUrls !== undefined) {
            const urls = (message.match(/https?:\/\/[^\s]+/g) || []).length;
            if (urls > settings.maxUrls) {
                return { safe: false, reason: `Too many URLs (${urls})` };
            }
        }

        return { safe: true };
    }

    private static executeCommentFilter(node: any, input: any) {
        const config = node.data.igUserCommentData;
        const comment = input;

        if (config.includeKeywords && config.includeKeywords.length > 0) {
            const hasIncludeKeyword = config.includeKeywords.some(
                (keyword: string) => comment.text.toLowerCase().includes(keyword.toLowerCase())
            );
            if (!hasIncludeKeyword) {
                throw new Error('Comment does not match include keywords');
            }
        }

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

    private static async completeExecution(
        executionId: string,
        workflowId: string,
        status: 'SUCCESS' | 'FAILED'
    ) {
        await db.workflowExecution.update({
            where: { id: executionId },
            data: {
                status,
                completedAt: new Date()
            }
        });

        await db.workflow.update({
            where: { id: workflowId },
            data: {
                lastRunAt: new Date(),
                lastRunStatus: status,
                totalRuns: { increment: 1 },
                ...(status === 'SUCCESS' && { successfulRuns: { increment: 1 } })
            }
        });
    }

    private static getExecutionOrder(definition: WorkflowDefinition): string[] {
        const order: string[] = [];
        const visited = new Set<string>();

        const visit = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const dependencies = definition.edges
                .filter(e => e.target === nodeId)
                .map(e => e.source);

            dependencies.forEach(dep => visit(dep));
            order.push(nodeId);
        };

        definition.nodes.forEach(node => visit(node.id));
        return order;
    }

    private static getRandomDelay(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private static async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}