import { db } from "@/server/db";
import { generateId } from "@/lib/utils";

interface WebhookLogData {
    payload: any;
    headers: Record<string, string>;
    source: string;
}

export class WebhookLogger {
    /**
     * Log incoming webhook event
     */
    static async logIncomingWebhook(data: WebhookLogData): Promise<string> {
        const eventId = generateId();

        try {
            await db.webhookEvent.create({
                data: {
                    id: eventId,
                    source: data.source,
                    status: 'received',
                    payload: JSON.stringify(data.payload),
                    headers: JSON.stringify(data.headers),
                    receivedAt: new Date()
                }
            });

            console.log(`📝 Webhook logged: ${eventId}`);
            return eventId;
        } catch (error) {
            console.error("Failed to log webhook:", error);
            // Still return eventId even if logging fails
            return eventId;
        }
    }

    /**
     * Update webhook processing status
     */
    static async updateWebhookStatus(
        eventId: string,
        status: 'processed' | 'failed',
        errorMessage?: string
    ): Promise<void> {
        try {
            await db.webhookEvent.update({
                where: { id: eventId },
                data: {
                    status,
                    processedAt: new Date(),
                    errorMessage
                }
            });
        } catch (error) {
            console.error(`Failed to update webhook status for ${eventId}:`, error);
        }
    }

    /**
     * Log webhook processing details
     */
    static async logProcessingDetails(
        eventId: string,
        details: {
            integrationId?: string;
            workflowIds?: string[];
            actionsPerformed?: Record<string, number>;
            errors?: string[];
        }
    ): Promise<void> {
        try {
            await db.webhookEvent.update({
                where: { id: eventId },
                data: {
                    metadata: JSON.stringify(details)
                }
            });
        } catch (error) {
            console.error(`Failed to log processing details for ${eventId}:`, error);
        }
    }

    /**
     * Clean up old webhook logs
     */
    static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        try {
            const result = await db.webhookEvent.deleteMany({
                where: {
                    receivedAt: {
                        lt: cutoffDate
                    }
                }
            });

            console.log(`🧹 Cleaned up ${result.count} old webhook logs`);
            return result.count;
        } catch (error) {
            console.error("Failed to cleanup webhook logs:", error);
            return 0;
        }
    }

    /**
     * Get webhook statistics
     */
    static async getStats(hours: number = 24): Promise<{
        total: number;
        processed: number;
        failed: number;
        avgProcessingTime: number;
    }> {
        const since = new Date();
        since.setHours(since.getHours() - hours);

        try {
            const [total, processed, failed, avgTime] = await Promise.all([
                db.webhookEvent.count({
                    where: { receivedAt: { gte: since } }
                }),
                db.webhookEvent.count({
                    where: {
                        receivedAt: { gte: since },
                        status: 'processed'
                    }
                }),
                db.webhookEvent.count({
                    where: {
                        receivedAt: { gte: since },
                        status: 'failed'
                    }
                }),
                db.$queryRaw<Array<{ avg_time: number }>>`
                    SELECT AVG(EXTRACT(EPOCH FROM ("processedAt" - "receivedAt"))) as avg_time
                    FROM "webhook_event"
                    WHERE "receivedAt" >= ${since}
                    AND "processedAt" IS NOT NULL
                `
            ]);

            return {
                total,
                processed,
                failed,
                avgProcessingTime: avgTime[0]?.avg_time || 0
            };
        } catch (error) {
            console.error("Failed to get webhook stats:", error);
            return {
                total: 0,
                processed: 0,
                failed: 0,
                avgProcessingTime: 0
            };
        }
    }
}