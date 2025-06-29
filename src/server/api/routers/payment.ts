// src/server/api/routers/payment.ts
import { z } from "zod";
import { XenditPaymentService } from "@/server/services/xendit-payment";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const paymentRouter = createTRPCRouter({
    createInvoice: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                amount: z.number(),
                description: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { userId, amount, description } = input;

            const invoice = await XenditPaymentService.createInvoice({
                externalId: `inv-${userId}-${Date.now()}`,
                amount,
                description,
                payerEmail: `${userId}@example.com`,
                redirectUrl: "https://yourdomain.com/success",
            });

            // Optionally simpan invoice ke database di sini

            return {
                invoiceUrl: invoice.invoice_url,
                id: invoice.id,
            };
        }),
});
