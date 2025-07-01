import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { InstagramService } from "@/server/services/instagram-service";
import { FlexibleWorkflowExecutor } from "@/server/services/flexible-workflow-executor";

// Initialize services
const instagramService = new InstagramService();


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

        // Find integration by Instagram account ID
        const integration = await db.integration.findUnique({
            where: { accountId: instagramAccountId },
            include: { user: true }
        });

        if (!integration) {
            console.log(`No integration found for account ${instagramAccountId}`);
            continue;
        }

        // Process each change
        for (const change of entry.changes) {
            if (change.field === 'comments') {
                await handleCommentWebhook(integration, change.value);
            } else if (change.field === 'messages') {
                await handleMessageWebhook(integration, change.value);
            }
        }
    }
}

// Handle comment webhook
async function handleCommentWebhook(integration: any, commentData: any) {
    try {
        const { id: commentId, text, from, media } = commentData;
        // Save comment to database
        const comment = await db.comment.upsert({
            where: { commentId },
            update: {
                text,
                username: from.username,
            },
            create: {
                integrationId: integration.id,
                commentId,
                postId: media.id,
                userId: from.id,
                username: from.username,
                text,
            }
        });

        // Find active workflows for comment triggers
        const workflows = await db.workflow.findMany({
            where: {
                integrationId: integration.id,
                isActive: true,
                triggerType: 'COMMENT_RECEIVED'
            }
        });

        // Execute each workflow
        for (const workflow of workflows) {
            await FlexibleWorkflowExecutor.execute(workflow, {
                type: 'COMMENT_RECEIVED',
                data: comment
            });
        }

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
    } catch (error) {
        console.error("Error handling comment webhook:", error);
    }
}

async function handleMessageWebhook(integration: any, messageData: any) {
    const {
        sender: { id: senderId },
        recipient: { id: recipientId },
        timestamp,
        message
    } = messageData;

    // Skip if message is from the page itself
    if (senderId === recipientId) return;

    // Save message to database
    const directMessage = await db.directMessage.create({
        data: {
            integrationId: integration.id,
            messageId: message.mid,
            threadId: `t_${senderId}`, // Instagram doesn't provide thread ID in webhook
            senderId,
            senderUsername: 'Unknown', // Will be updated when fetching user profile
            text: message.text || '',
            timestamp: new Date(timestamp)
        }
    });

    // Find active workflows for DM triggers
    const workflows = await db.workflow.findMany({
        where: {
            integrationId: integration.id,
            isActive: true,
            triggerType: 'DM_RECEIVED'
        }
    });

    // Execute each workflow
    for (const workflow of workflows) {
        await FlexibleWorkflowExecutor.execute(workflow, {
            type: 'DM_RECEIVED',
            data: directMessage
        });
    }
}


