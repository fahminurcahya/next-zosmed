import crypto from "crypto";

export class WebhookVerifier {

    static verifySignature(
        payload: string,
        signature: string | null,
        appSecret: string
    ): boolean {
        if (!signature) {
            console.error("No signature provided");
            return false;
        }

        try {
            const expectedSignature = crypto
                .createHmac("sha256", appSecret)
                .update(payload)
                .digest("hex");

            const expectedSigWithPrefix = `sha256=${expectedSignature}`;

            // Constant time comparison to prevent timing attacks
            const signatureBuffer = Buffer.from(signature);
            const expectedBuffer = Buffer.from(expectedSigWithPrefix);

            if (signatureBuffer.length !== expectedBuffer.length) {
                return false;
            }

            return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
        } catch (error) {
            console.error("Signature verification error:", error);
            return false;
        }
    }

    /**
     * Verify webhook challenge for initial setup
     */
    static verifyChallenge(
        mode: string | null,
        token: string | null,
        expectedToken: string
    ): boolean {
        return mode === "subscribe" && token === expectedToken;
    }

    /**
     * Validate webhook payload structure
     */
    static validatePayload(data: any): boolean {
        // Basic structure validation
        if (!data || typeof data !== 'object') {
            return false;
        }

        if (!data.object || !Array.isArray(data.entry)) {
            return false;
        }

        // Validate each entry
        for (const entry of data.entry) {
            if (!entry.id || !entry.time || !Array.isArray(entry.changes)) {
                return false;
            }

            // Validate changes
            for (const change of entry.changes) {
                if (!change.field || !change.value) {
                    return false;
                }
            }
        }

        return true;
    }
}