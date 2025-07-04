import { db } from "@/server/db";
import { WorkflowTriggerType } from "@prisma/client";
import { CommentProcessor } from "./comment-processor";
import { MessageProcessor } from "./message-processor";

interface WebhookEntry {
    id: string;
    time: number;
    changes: Array<{
        field: string;
        value: any;
    }>;
}

interface WebhookData {
    object: string;
    entry: WebhookEntry[];
}

export class WebhookProcessor {
    /**
     * Main entry point for processing webhook data
     */
    static async process(data: WebhookData, eventId: string): Promise<void> {
        console.log(`🔄 Processing webhook event ${eventId}`);

        // Only process Instagram webhooks
        if (data.object !== 'instagram') {
            console.log(`Ignoring non-Instagram webhook: ${data.object}`);
            return;
        }

        // Process each entry
        for (const entry of data.entry) {
            await this.processEntry(entry, eventId);
        }
    }

    /**
     * Process a single webhook entry
     */
    private static async processEntry(entry: WebhookEntry, eventId: string): Promise<void> {
        const instagramAccountId = entry.id;

        // Find integration
        const integration = await db.integration.findUnique({
            where: { accountId: instagramAccountId },
            include: {
                user: true,
                workflows: {
                    where: { isActive: true }
                }
            }
        });

        if (!integration) {
            console.log(`No integration found for account ${instagramAccountId}`);
            return;
        }

        // Process each change
        for (const change of entry.changes) {
            await this.processChange(integration, change, eventId);
        }
    }

    /**
     * Process a single change from webhook
     */
    private static async processChange(
        integration: any,
        change: { field: string; value: any },
        eventId: string
    ): Promise<void> {
        console.log(`Processing ${change.field} change for integration ${integration.id}`);

        try {
            switch (change.field) {
                case 'comments':
                    await CommentProcessor.process(integration, change.value, eventId);
                    break;

                case 'messages':
                    await MessageProcessor.process(integration, change.value, eventId);
                    break;

                default:
                    console.log(`Unhandled webhook field: ${change.field}`);
            }
        } catch (error) {
            console.error(`Error processing ${change.field}:`, error);

            // Log error but continue processing other changes
            await db.webhookError.create({
                data: {
                    webhookEventId: eventId,
                    integrationId: integration.id,
                    field: change.field,
                    error: error instanceof Error ? error.message : String(error),
                    payload: JSON.stringify(change.value)
                }
            });
        }
    }
}