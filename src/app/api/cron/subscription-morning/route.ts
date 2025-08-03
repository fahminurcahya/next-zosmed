import { SubscriptionNotificationService } from "@/server/services/subscription-notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Verify cron job authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process morning notifications
        const result = await SubscriptionNotificationService.processMorningNotifications();

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Morning notification processing failed',
                    details: result.error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            type: 'morning_notifications',
            processed: result.processed,
            notifications: result.notifications,
            timestamp: new Date().toISOString(),
            summary: {
                expiringIn3Days: result.processed.expiringIn3Days,
                expiringToday: result.processed.expiringToday,
                inactiveNotifications: result.notifications.filter(n => n.type === 'inactive').length,
                totalNotificationsSent: result.processed.totalNotifications
            }
        });

    } catch (error) {
        console.error('Morning cron job error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET method for health check
export async function GET() {
    return NextResponse.json({
        message: 'Morning subscription notifications endpoint is healthy',
        type: 'morning_notifications',
        description: 'Processes: 3-day warnings, same-day expiry alerts, and inactive notifications',
        timestamp: new Date().toISOString()
    });
}