// src/server/services/webhook/processors/message-processor.ts
import { db } from "@/server/db";
import { WorkflowTriggerType } from "@prisma/client";
import { Redis } from "@upstash/redis";

interface MessageData {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: number;
    message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
            type: string;
            payload: {
                url?: string;
            };
        }>;
    };
}

export class MessageProcessor {
    private static redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    /**
     * Process incoming message webhook
     */
    static async process(
        integration: any,
        messageData: MessageData,
        webhookEventId: string
    ): Promise<void> {
        const { sender, recipient, timestamp, message } = messageData;

        // Skip if message is from the page itself (echo)
        if (sender.id === recipient.id) {
            console.log("Skipping echo message");
            return;
        }

        if (!message?.mid) {
            console.log("No message ID found");
            return;
        }

        console.log(`📨 Processing DM ${message.mid} from sender ${sender.id}`);

        try {
            // 1. Deduplicate
            const isDuplicate = await this.checkDuplicate(message.mid);
            if (isDuplicate) {
                console.log(`Message ${message.mid} already processed, skipping`);
                return;
            }

            // 2. Save message to database
            const directMessage = await db.directMessage.create({
                data: {
                    integrationId: integration.id,
                    messageId: message.mid,
                    threadId: `t_${sender.id}`, // Instagram doesn't provide thread ID in webhook
                    senderId: sender.id,
                    senderUsername: 'Unknown', // Will be updated when fetching user profile
                    text: message.text || '',
                    timestamp: new Date(timestamp),
                    attachments: message.attachments ? JSON.stringify(message.attachments) : null
                }
            });

            console.log(`💾 DM saved: ${directMessage.id}`);

            // 3. Find active workflows for DM triggers
            const workflows = await db.workflow.findMany({
                where: {
                    integrationId: integration.id,
                    isActive: true,
                    triggerType: WorkflowTriggerType.DM_RECEIVED
                }
            });

            console.log(`Found ${workflows.length} active workflows for DM trigger`);

            // 4. Execute workflows
            for (const workflow of workflows) {
                await this.executeWorkflow(workflow, directMessage, integration);
            }

        } catch (error) {
            console.error(`Error processing message ${message.mid}:`, error);
            throw error;
        }
    }

    /**
     * Check if message was already processed
     */
    private static async checkDuplicate(messageId: string): Promise<boolean> {
        const key = `processed_message:${messageId}`;
        const exists = await this.redis.get(key);

        if (exists) {
            return true;
        }

        // Mark as processed with 24 hour TTL
        await this.redis.set(key, "1", { ex: 86400 });
        return false;
    }

    /**
     * Execute workflow for DM
     */
    private static async executeWorkflow(
        workflow: any,
        message: any,
        integration: any
    ): Promise<void> {
        try {
            console.log(`🚀 Executing workflow ${workflow.id} for DM ${message.id}`);

            // Parse workflow definition
            const definition = JSON.parse(workflow.definition);

            // Find DM trigger node
            const triggerNode = definition.nodes.find(
                (n: any) => n.data.type === 'IG_USER_DM'
            );

            if (!triggerNode) {
                console.log('No DM trigger node found');
                return;
            }

            // Check keyword filters
            const matchesFilters = await this.checkKeywordFilters(
                message,
                triggerNode.data.igUserDMData
            );

            if (!matchesFilters) {
                console.log('Message does not match keyword filters');
                return;
            }

            // Log execution
            await db.workflowExecution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    trigger: JSON.stringify({
                        type: 'IG_USER_DM',
                        messageId: message.messageId,
                        senderId: message.senderId
                    }),
                    status: 'SUCCESS',
                    startedAt: new Date(),
                    completedAt: new Date(),
                    definition: workflow.definition
                }
            });

            console.log(`✅ DM workflow executed for message ${message.id}`);

        } catch (error) {
            console.error(`DM workflow execution error:`, error);

            await db.workflowExecution.create({
                data: {
                    workflowId: workflow.id,
                    userId: workflow.userId,
                    trigger: JSON.stringify({
                        type: 'IG_USER_DM',
                        messageId: message.messageId
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
     * Check if message matches keyword filters
     */
    private static async checkKeywordFilters(
        message: any,
        filterConfig: any
    ): Promise<boolean> {
        if (!filterConfig || !message.text) return true;

        const text = message.text.toLowerCase();

        // Check include keywords
        if (filterConfig.includeKeywords?.length > 0) {
            const hasIncludeKeyword = filterConfig.includeKeywords.some(
                (keyword: string) => text.includes(keyword.toLowerCase())
            );
            if (!hasIncludeKeyword) {
                return false;
            }
        }

        return true;
    }
}