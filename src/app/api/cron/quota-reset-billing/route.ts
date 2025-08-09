import { QuotaResetService } from "@/server/services/quota-reset-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Verify cron job authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process billing cycle quota resets
        const result = await QuotaResetService.processBillingCycleResets();

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Billing cycle quota reset failed',
                    details: result.error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            type: 'billing_cycle_quota_reset',
            processed: result.processed,
            resets: result.resets,
            timestamp: new Date().toISOString(),
            summary: {
                totalUsersReset: result.processed.totalResets,
                resetType: 'billing_cycle',
                message: `Successfully reset quota for ${result.processed.totalResets} users based on their billing cycle`
            }
        });

    } catch (error) {
        console.error('Billing cycle quota reset cron error:', error);
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
        message: 'Billing cycle quota reset endpoint is healthy',
        type: 'billing_cycle_quota_reset',
        description: 'Resets quota based on individual user billing cycles',
        timestamp: new Date().toISOString()
    });
}