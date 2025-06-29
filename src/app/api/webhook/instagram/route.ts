import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { InstagramService } from "@/server/services/instagram-service";
import { WorkflowExecutor } from "@/server/services/workflow-executor";

// Initialize services
const instagramService = new InstagramService();
const workflowExecutor = new WorkflowExecutor(db, instagramService);

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.INSTAGRAM_APP_SECRET!)
        .update(payload)
        .digest("hex");

    return signature === `sha256=${expectedSignature}`;
}


// Handle GET request for webhook verification
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Check if this is a webhook verification request
    if (mode === "subscribe" && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
        console.log("Webhook verified successfully!");
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: "Failed verification" }, { status: 403 });
}
// Handle POST request for webhook events
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = (await headers()).get("x-hub-signature-256");

        // Verify webhook signature in production
        if (process.env.NODE_ENV === "production") {
            if (!signature || !verifySignature(body, signature)) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        }

        const data = JSON.parse(body);
        console.log("Webhook received:", JSON.stringify(data, null, 2));

        // Process webhook asynchronously
        processWebhook(data).catch(console.error);

        // Return immediately to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

// Process webhook data
async function processWebhook(data: any) {
    for (const entry of data.entry) {
        const instagramAccountId = entry.id;

        // Find integration
        const integration = await db.integrations.findFirst({
            where: { instagramId: instagramAccountId },
            include: { User: true },
        });

        if (!integration) {
            console.error("Integration not found for Instagram account:", instagramAccountId);
            continue;
        }

        // Handle changes (comments, mentions, etc)
        if (entry.changes) {
            for (const change of entry.changes) {
                if (change.field === "comments") {
                    await handleCommentWebhook(change.value, integration);
                }
            }
        }

        // Handle messaging
        if (entry.messaging) {
            for (const message of entry.messaging) {
                await handleMessageWebhook(message, integration);
            }
        }
    }
}

// Handle comment webhook
async function handleCommentWebhook(commentData: any, integration: any) {
    try {
        console.log("Processing comment webhook:", commentData);

        // Check if comment already processed
        const existingComment = await db.comment.findUnique({
            where: { commentId: commentData.id },
        });

        if (existingComment?.isReplied) {
            console.log("Comment already processed:", commentData.id);
            return;
        }

        // Get full comment details if needed
        let fullCommentData = commentData;
        if (!commentData.from || !commentData.media) {
            fullCommentData = await instagramService.getCommentDetails(
                commentData.id,
                integration.token
            );
        }

        // Save or update comment
        await db.comment.upsert({
            where: { commentId: fullCommentData.id },
            update: {
                text: fullCommentData.text,
            },
            create: {
                commentId: fullCommentData.id,
                postId: fullCommentData.media.id,
                userId: fullCommentData.from.id,
                username: fullCommentData.from.username,
                text: fullCommentData.text,
                accountId: integration.id,
            },
        });

        // Execute workflow
        await workflowExecutor.executeCommentWorkflow(
            {
                commentId: fullCommentData.id,
                postId: fullCommentData.media.id,
                userId: fullCommentData.from.id,
                username: fullCommentData.from.username,
                text: fullCommentData.text,
                instagramAccountId: integration.instagramId,
            },
            integration
        );
    } catch (error) {
        console.error("Error handling comment webhook:", error);
    }
}

// Handle message webhook
async function handleMessageWebhook(messageData: any, integration: any) {
    try {
        console.log("Processing message webhook:", messageData);

        // Handle DM workflows here if needed
        // Similar to comment handling but for DMs
    } catch (error) {
        console.error("Error handling message webhook:", error);
    }
}


