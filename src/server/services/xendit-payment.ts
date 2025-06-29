// src/server/services/xendit-payment.ts
import axios from "axios";

const XENDIT_API_KEY = process.env.XENDIT_API_KEY || "";

export class XenditPaymentService {
    static async createInvoice({
        externalId,
        amount,
        description,
        payerEmail,
        redirectUrl,
        expiryMinutes = 60,
    }: {
        externalId: string;
        amount: number;
        description: string;
        payerEmail: string;
        redirectUrl: string;
        expiryMinutes?: number;
    }) {
        const expiryDate = new Date(Date.now() + expiryMinutes * 60000).toISOString();

        const response = await axios.post(
            "https://api.xendit.co/v2/invoices",
            {
                external_id: externalId,
                payer_email: payerEmail,
                description,
                amount,
                success_redirect_url: redirectUrl,
                expiry_date: expiryDate,
            },
            {
                auth: {
                    username: XENDIT_API_KEY,
                    password: "",
                },
            }
        );

        return response.data;
    }

    static verifyCallback(headers: any) {
        const token = headers["x-callback-token"];
        return token === process.env.XENDIT_CALLBACK_TOKEN;
    }
}
