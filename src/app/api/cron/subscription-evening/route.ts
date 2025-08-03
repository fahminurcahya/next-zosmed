import { SubscriptionNotificationService } from "@/server/services/subscription-notification-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Verify cron job authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process evening status updates
        const result = await SubscriptionNotificationService.processEveningStatusUpdates();

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Evening status update processing failed',
                    details: result.error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            type: 'evening_status_updates',
            processed: result.processed,
            notifications: result.notifications,
            timestamp: new Date().toISOString(),
            summary: {
                markedPastDue: result.processed.markedPastDue,
                markedInactive: result.processed.markedInactive,
                totalStatusUpdates: result.processed.markedPastDue + result.processed.markedInactive,
                pastDueNotificationsSent: result.notifications.filter(n => n.type === 'past_due').length
            }
        });

    } catch (error) {
        console.error('Evening cron job error:', error);
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
        message: 'Evening subscription status updates endpoint is healthy',
        type: 'evening_status_updates',
        description: 'Processes: ACTIVE → PAST_DUE and PAST_DUE → INACTIVE status changes',
        timestamp: new Date().toISOString()
    });
}
