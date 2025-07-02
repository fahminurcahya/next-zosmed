import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { InstagramService } from "@/server/services/instagram-service";
import { FlexibleWorkflowExecutor } from "@/server/services/flexible-workflow-executor";
import { WebhookVerifier } from "@/server/services/webhook-verifier";
import { WebhookLogger } from "@/server/services/webhook-logger";
import { WebhookProcessor } from "@/server/services/webhook-processor";

// Initialize services
const instagramService = new InstagramService();

// Constants
const WEBHOOK_VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN!;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;


// Handle GET request for webhook verification
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        // Verify the webhook
        if (WebhookVerifier.verifyChallenge(mode, token, WEBHOOK_VERIFY_TOKEN)) {
            console.log("✅ Webhook verified successfully!");
            return new NextResponse(challenge, { status: 200 });
        }

        console.error("❌ Webhook verification failed", { mode, token });
        return NextResponse.json(
            { error: "Failed verification" },
            { status: 403 }
        );
    } catch (error) {
        console.error("Webhook verification error:", error);
        return NextResponse.json(
            { error: "Verification error" },
            { status: 500 }
        );
    }
}

// Handle POST request for webhook events
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let webhookEventId: string | null = null;

    try {
        // 1. Get request body and headers
        const body = await request.text();
        const signature = (await headers()).get("x-hub-signature-256");

        // 2. Verify signature in production
        if (process.env.NODE_ENV === "production") {
            const isValid = WebhookVerifier.verifySignature(body, signature, APP_SECRET);
            if (!isValid) {
                console.error("❌ Invalid webhook signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }
        }



        // 3. Parse webhook data
        const webhookData = JSON.parse(body);
        if (!WebhookVerifier.validatePayload(webhookData)) {
            console.error("❌ Invalid payload structure");
            return NextResponse.json(
                { error: "Invalid payload structure" },
                { status: 400 }
            );
        }

        // 4. Log webhook event
        webhookEventId = await WebhookLogger.logIncomingWebhook({
            payload: webhookData,
            headers: Object.fromEntries((await headers()).entries()),
            source: 'instagram'
        });


        // 5. Process webhook asynchronously
        // Using Promise to not block the response
        WebhookProcessor.process(webhookData, webhookEventId)
            .then(() => {
                console.log(`✅ Webhook ${webhookEventId} processed successfully`);
                WebhookLogger.updateWebhookStatus(webhookEventId!, 'processed');
            })
            .catch((error) => {
                console.error(`❌ Webhook ${webhookEventId} processing failed:`, error);
                WebhookLogger.updateWebhookStatus(webhookEventId!, 'failed', error.message);
            });

        // Return immediately to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}