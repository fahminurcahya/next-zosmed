// src/app/api/webhooks/xendit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { xenditService } from "@/server/services/xendit-service";
import type { XenditWebhookEvent } from "@/server/services/xendit-service";
import { db } from "@/server/db";
import { xenditPaymentMethodService } from "@/server/services/xendit-payment-method-service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const webhookData = JSON.parse(body);

        const headersList = await headers();
        const xCallbackToken = headersList.get("x-callback-token");
        const xWebhookId = headersList.get("x-webhook-id");

        if (process.env.NODE_ENV === "production") {
            const isValid = xenditService.verifyWebhookNotification(
                process.env.XENDIT_WEBHOOK_TOKEN!,
                body,
                xCallbackToken || undefined
            );

            if (!isValid) {
                console.error("Invalid webhook token");
                return NextResponse.json(
                    { error: "Invalid webhook token" },
                    { status: 401 }
                );
            }
        }

        const event: XenditWebhookEvent = {
            id: xWebhookId || `webhook_${Date.now()}`,
            created: new Date().toISOString(),
            businessId: process.env.XENDIT_BUSINESS_ID || "",
            statusEvent: webhookData.status || headersList.get("x-callback-event") || webhookData.data?.status || "",
            event: webhookData.event,
            data: webhookData,
        };

        console.log(`Received Xendit webhook: ${event.statusEvent}`, {
            webhookId: event.id,
            eventStatus: event.statusEvent,
            dataId: webhookData.id,
            event: event.event
        });

        await xenditService.handleWebhook(event);

        if (process.env.STORE_WEBHOOK_EVENTS === "true") {
            await db.webhookEvent.create({
                data: {
                    source: "xendit",
                    status: "processed",
                    payload: body,
                    headers: JSON.stringify(Object.fromEntries(headersList.entries())),
                    metadata: JSON.stringify({
                        event: event.event,
                        statusEvent: event.statusEvent,
                        webhookId: event.id,
                        processedAt: new Date().toISOString(),
                    }),
                    processedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            received: true,
            webhookId: event.id,
            event: event.statusEvent,
        });
    } catch (error: any) {
        console.error("Webhook processing error:", error);

        if (process.env.STORE_WEBHOOK_EVENTS === "true") {
            const failedHeaders = await headers();
            await db.webhookEvent.create({
                data: {
                    source: "xendit",
                    status: "failed",
                    payload: await req.text(),
                    headers: JSON.stringify(Object.fromEntries(failedHeaders.entries())),
                    errorMessage: error.message,
                },
            });
        }

        return NextResponse.json(
            { error: "Webhook processing failed", message: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    const invoiceId = searchParams.get("invoiceId");

    if (!action) {
        return NextResponse.json({
            message: "Xendit webhook test endpoint",
            availableActions: [
                "simulate-payment",
                "test-webhook-token",
                "list-recent-webhooks",
            ],
            usage: {
                simulatePayment: "/api/webhooks/xendit?action=simulate-payment&invoiceId=xxx",
                testToken: "/api/webhooks/xendit?action=test-webhook-token",
                listWebhooks: "/api/webhooks/xendit?action=list-recent-webhooks",
            },
        });
    }

    switch (action) {
        case "simulate-payment":
            if (!invoiceId) {
                return NextResponse.json(
                    { error: "invoiceId is required" },
                    { status: 400 }
                );
            }

            try {
                const result = await xenditService.simulatePayment(invoiceId);
                return NextResponse.json(result);
            } catch (error: any) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

        case "test-webhook-token":
            const testToken = process.env.XENDIT_WEBHOOK_TOKEN;
            return NextResponse.json({
                tokenConfigured: !!testToken,
                tokenLength: testToken?.length || 0,
                message: testToken
                    ? "Webhook token is configured"
                    : "Webhook token is not configured",
            });

        case "list-recent-webhooks":
            try {
                const webhooks = await db.webhookEvent.findMany({
                    where: { source: "xendit" },
                    orderBy: { receivedAt: "desc" },
                    take: 10,
                });

                return NextResponse.json({
                    count: webhooks.length,
                    webhooks: webhooks.map((w: any) => ({
                        id: w.id,
                        status: w.status,
                        receivedAt: w.receivedAt,
                        processedAt: w.processedAt,
                        error: w.errorMessage,
                        metadata: w.metadata ? JSON.parse(w.metadata as string) : null,
                    })),
                });
            } catch (error: any) {
                return NextResponse.json(
                    { error: "Failed to fetch webhooks" },
                    { status: 500 }
                );
            }

        default:
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
    }
}