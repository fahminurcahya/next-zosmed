// src/server/services/workflow/combined-actions-executor.ts
import { ActionTracker } from "@/server/services/action-tracker";
import { InstagramAPI } from "@/server/services/instagram-api";
import { db } from "@/server/db";
import type { IGReplyData, ExecutionResult } from "@/types/app-node.type";
import { generateId } from "@/lib/utils";

interface ExecutionContext {
    comment: any;
    integration: any;
    workflowId: string;
}

export class CombinedActionsExecutor {
    constructor(
        private actionTracker: ActionTracker,
        private integrationId: string
    ) { }

    /**
     * Execute reply action with Combined Actions limits
     */
    async executeReplyAction(
        nodeData: IGReplyData,
        context: ExecutionContext
    ): Promise<ExecutionResult> {
        const errors: string[] = [];
        let commentsPerformed = 0;
        let dmsPerformed = 0;

        // Get safety config
        const safetyConfig = nodeData.safetyConfig;

        // Log execution start
        console.log(`🎯 Starting Combined Actions execution for comment ${context.comment.id}`);
        console.log(`Safety: ${safetyConfig?.enabled ? 'ON' : 'OFF'}, Mode: ${safetyConfig?.mode || 'N/A'}`);

        // Check if safety is enabled
        if (!safetyConfig?.enabled) {
            console.warn('⚠️ Safety disabled - proceeding without limits');
        }

        // Get combined limits
        const limits = safetyConfig?.combinedLimits || {
            maxActionsPerHour: 25,
            maxActionsPerDay: 200,
            delayBetweenActions: [5, 15],
            commentToDmDelay: [8, 25]
        };

        const actionTypes = safetyConfig?.actionTypes || {
            enableCommentReply: true,
            enableDMReply: true
        };

        try {
            // Get current stats before execution
            const statsBefore = await this.actionTracker.getCombinedStats(this.integrationId);
            console.log(`📊 Current usage - Hour: ${statsBefore.hourly.total}, Day: ${statsBefore.daily.total}`);

            // Create Instagram API instance
            const api = new InstagramAPI(context.integration.accessToken);

            // Step 1: Comment Reply
            if (actionTypes.enableCommentReply && nodeData.publicReplies.length > 0) {
                console.log(`💬 Attempting comment reply...`);

                const canComment = await this.checkCanPerformAction('comment_reply', limits, actionTypes);

                if (!canComment.allowed) {
                    errors.push(`Comment skipped: ${canComment.reason}`);
                    console.log(`⚠️ ${canComment.reason}`);
                } else {
                    try {
                        // Pick random reply template
                        const replyText = this.pickRandomReply(nodeData.publicReplies);

                        // Apply content safety checks
                        const contentCheck = this.checkContentSafety(replyText, safetyConfig?.contentRules);
                        if (!contentCheck.safe) {
                            throw new Error(contentCheck.reason);
                        }

                        // Send comment reply
                        await api.replyToComment(context.comment.commentId, replyText);

                        // Record the action
                        await this.actionTracker.recordCombinedAction(
                            this.integrationId,
                            'comment_reply',
                            {
                                commentId: context.comment.commentId,
                                template: replyText
                            }
                        );

                        // Mark comment as replied
                        await db.comment.update({
                            where: { id: context.comment.id },
                            data: {
                                isReplied: true,
                                repliedAt: new Date()
                            }
                        });

                        commentsPerformed++;
                        console.log(`✅ Comment reply sent: "${replyText.substring(0, 50)}..."`);

                        // Apply delay if safety enabled
                        if (safetyConfig?.enabled) {
                            await this.randomDelay(limits.delayBetweenActions);
                        }
                    } catch (error: any) {
                        errors.push(`Comment reply failed: ${error.message}`);
                        console.error(`❌ Comment reply error:`, error);
                    }
                }
            }

            // Step 2: DM Send
            if (actionTypes.enableDMReply && nodeData.dmMessage) {
                console.log(`📨 Attempting DM send...`);

                // Extra delay if comment was sent (comment->DM sequence)
                if (commentsPerformed > 0 && safetyConfig?.enabled) {
                    console.log('⏳ Applying comment-to-DM delay...');
                    await this.randomDelay(limits.commentToDmDelay);
                }

                const canDM = await this.checkCanPerformAction('dm_send', limits, actionTypes);

                if (!canDM.allowed) {
                    errors.push(`DM skipped: ${canDM.reason}`);
                    console.log(`⚠️ ${canDM.reason}`);
                } else {
                    try {
                        // Prepare DM message with buttons
                        const dmPayload = this.prepareDMPayload(
                            nodeData.dmMessage,
                            nodeData.buttons
                        );

                        // Apply content safety checks
                        const contentCheck = this.checkContentSafety(nodeData.dmMessage, safetyConfig?.contentRules);
                        if (!contentCheck.safe) {
                            throw new Error(contentCheck.reason);
                        }

                        // Send DM
                        await api.sendDirectMessage(
                            context.comment.userId,
                            dmPayload
                        );

                        // Record the action
                        await this.actionTracker.recordCombinedAction(
                            this.integrationId,
                            'dm_send',
                            {
                                userId: context.comment.userId,
                                hasButtons: nodeData.buttons.filter(b => b.enabled).length > 0
                            }
                        );

                        // Save OUTGOING DM record
                        await db.directMessage.create({
                            data: {
                                integrationId: context.integration.id,
                                messageId: generateId('msg'), // Generate our own ID
                                threadId: `t_${context.comment.userId}`,
                                direction: 'OUTGOING',
                                senderId: context.integration.accountId,
                                senderUsername: context.integration.accountUsername,
                                recipientId: context.comment.userId,
                                recipientUsername: context.comment.username,
                                text: nodeData.dmMessage,
                                timestamp: new Date(),
                                deliveryStatus: 'SENT',
                                workflowExecutionId: context.workflowId,
                                triggeredByCommentId: context.comment.commentId,
                                metadata: {
                                    buttons: nodeData.buttons.filter(b => b.enabled),
                                    triggeredBy: 'comment_workflow'
                                }
                            }
                        });

                        dmsPerformed++;
                        console.log(`✅ DM sent to @${context.comment.username}`);

                    } catch (error: any) {
                        errors.push(`DM send failed: ${error.message}`);
                        console.error(`❌ DM send error:`, error);
                    }
                }
            }

            // Get stats after execution
            const statsAfter = await this.actionTracker.getCombinedStats(this.integrationId);
            console.log(
                `📊 Updated usage - Hour: ${statsAfter.hourly.total}/${limits.maxActionsPerHour}, ` +
                `Day: ${statsAfter.daily.total}/${limits.maxActionsPerDay}`
            );

            return {
                success: commentsPerformed > 0 || dmsPerformed > 0,
                actionsPerformed: {
                    comments: commentsPerformed,
                    dms: dmsPerformed
                },
                errors: errors.length > 0 ? errors : undefined,
                budgetUsed: {
                    hourly: statsAfter.hourly.total,
                    daily: statsAfter.daily.total
                }
            };

        } catch (error: any) {
            console.error('❌ Execution error:', error);
            return {
                success: false,
                actionsPerformed: { comments: 0, dms: 0 },
                errors: [error.message],
                budgetUsed: { hourly: 0, daily: 0 }
            };
        }
    }

    /**
     * Check if action can be performed
     */
    private async checkCanPerformAction(
        actionType: 'comment_reply' | 'dm_send',
        limits: any,
        actionTypes: any
    ): Promise<{ allowed: boolean; reason?: string }> {
        return await this.actionTracker.canPerformCombinedAction(
            this.integrationId,
            actionType,
            {
                maxActionsPerHour: limits.maxActionsPerHour,
                maxActionsPerDay: limits.maxActionsPerDay,
                delayBetweenActions: limits.delayBetweenActions,
                commentToDmDelay: limits.commentToDmDelay,
                actionTypes
            }
        );
    }

    /**
     * Check content safety rules
     */
    private checkContentSafety(
        content: string,
        rules?: { maxMentions?: number; maxHashtags?: number }
    ): { safe: boolean; reason?: string } {
        if (!rules) return { safe: true };

        // Check mentions
        if (rules.maxMentions !== undefined) {
            const mentions = (content.match(/@[\w.]+/g) || []).length;
            if (mentions > rules.maxMentions) {
                return {
                    safe: false,
                    reason: `Too many mentions (${mentions}/${rules.maxMentions})`
                };
            }
        }

        // Check hashtags
        if (rules.maxHashtags !== undefined) {
            const hashtags = (content.match(/#[\w]+/g) || []).length;
            if (hashtags > rules.maxHashtags) {
                return {
                    safe: false,
                    reason: `Too many hashtags (${hashtags}/${rules.maxHashtags})`
                };
            }
        }

        return { safe: true };
    }

    /**
     * Pick random reply from templates
     */
    private pickRandomReply(templates: string[]): string {
        const reply = templates[Math.floor(Math.random() * templates.length)];
        if (reply === undefined) {
            throw new Error("No templates available to pick from");
        }
        return reply
    }

    /**
     * Prepare DM payload with buttons
     */
    private prepareDMPayload(message: string, buttons: any[]) {
        const activeButtons = buttons.filter(b => b.enabled);

        if (activeButtons.length === 0) {
            return { text: message };
        }

        // Instagram Messenger format
        return {
            text: message,
            quick_replies: activeButtons.map(btn => ({
                content_type: "web_url",
                title: btn.title,
                url: btn.url,
                webview_height_ratio: "full"
            }))
        };
    }

    /**
     * Random delay helper
     */
    private async randomDelay(range: [number, number]): Promise<void> {
        const [min, max] = range;
        const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
        console.log(`⏱️ Waiting ${delay / 1000}s before next action...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}