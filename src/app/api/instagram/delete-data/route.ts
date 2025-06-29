import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";

function verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.INSTAGRAM_APP_SECRET!)
        .update(payload)
        .digest("hex");

    return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-hub-signature-256");

        // Verify signature
        if (signature && !verifySignature(body, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const data = JSON.parse(body);
        console.log("Data deletion request:", data);

        // Parse signed request
        const signedRequest = data.signed_request;
        if (signedRequest) {
            const [encodedSig, payload] = signedRequest.split(".");
            const decodedPayload = JSON.parse(
                Buffer.from(payload, "base64").toString()
            );

            const instagramUserId = decodedPayload.user_id;

            // Delete all user data related to Instagram
            // 1. Find integration
            const integration = await db.integrations.findFirst({
                where: { instagramId: instagramUserId },
            });

            if (integration) {
                // 2. Delete related data
                await db.$transaction([
                    // Delete comments
                    db.comment.deleteMany({
                        where: { accountId: integration.id },
                    }),

                    // Delete DMs
                    db.dms.deleteMany({
                        where: {
                            OR: [
                                { senderId: instagramUserId },
                                { reciever: instagramUserId },
                            ],
                        },
                    }),

                    // Delete the integration itself
                    db.integrations.delete({
                        where: { id: integration.id },
                    }),
                ]);

                console.log(`Deleted all data for Instagram user: ${instagramUserId}`);
            }
        }

        // Return confirmation URL and code
        const confirmationCode = `${Date.now()}_delete_${data.user_id || "unknown"}`;

        return NextResponse.json({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status?code=${confirmationCode}`,
            confirmation_code: confirmationCode,
        });
    } catch (error) {
        console.error("Data deletion error:", error);
        return NextResponse.json(
            { error: "Data deletion processing failed" },
            { status: 500 }
        );
    }
}