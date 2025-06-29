// Verify the request is from Instagram
import { db } from "@/server/db";
import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";


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
        console.log("Deauthorization request:", data);

        // Parse signed request
        const signedRequest = data.signed_request;
        if (signedRequest) {
            const [encodedSig, payload] = signedRequest.split(".");
            const decodedPayload = JSON.parse(
                Buffer.from(payload, "base64").toString()
            );

            const instagramUserId = decodedPayload.user_id;

            // Remove user's Instagram integration
            await db.integrations.deleteMany({
                where: {
                    instagramId: instagramUserId,
                },
            });

            console.log(`Removed Instagram integration for user: ${instagramUserId}`);
        }

        // Instagram expects a confirmation URL in response
        return NextResponse.json({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/deauthorized`,
            confirmation_code: `${Date.now()}_deauth_${data.user_id || "unknown"}`,
        });
    } catch (error) {
        console.error("Deauthorization error:", error);
        return NextResponse.json(
            { error: "Deauthorization processing failed" },
            { status: 500 }
        );
    }
}