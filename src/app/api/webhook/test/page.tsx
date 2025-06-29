"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function WebhookTestPage() {
    const [webhookUrl, setWebhookUrl] = useState("");
    const [verifyToken, setVerifyToken] = useState("");
    const [testResult, setTestResult] = useState<any>(null);

    const testWebhookVerification = async () => {
        try {
            const response = await fetch(
                `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_challenge_123`
            );

            const result = await response.text();

            if (response.ok && result === "test_challenge_123") {
                toast.success("Webhook verification successful!");
                setTestResult({ success: true, response: result });
            } else {
                toast.error("Webhook verification failed");
                setTestResult({ success: false, response: result });
            }
        } catch (error) {
            toast.error("Failed to test webhook");
            setTestResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    };

    const testWebhookEvent = async () => {
        const testPayload = {
            entry: [
                {
                    id: "123456789", // Instagram account ID
                    time: Date.now(),
                    changes: [
                        {
                            field: "comments",
                            value: {
                                id: "test_comment_123",
                                text: "Test comment from webhook",
                                from: {
                                    id: "test_user_123",
                                    username: "testuser"
                                },
                                media: {
                                    id: "test_media_123"
                                }
                            }
                        }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Note: In real webhook, Instagram sends x-hub-signature-256
                },
                body: JSON.stringify(testPayload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Webhook event sent successfully!");
                setTestResult({ success: true, response: result });
            } else {
                toast.error("Webhook event failed");
                setTestResult({ success: false, response: result });
            }
        } catch (error) {
            toast.error("Failed to send webhook event");
            setTestResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    };

    return (
        <div className="container max-w-2xl py-8">
            <h1 className="text-2xl font-bold mb-6">Webhook Test Tool</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Test Instagram Webhook</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                            id="webhook-url"
                            placeholder="https://your-ngrok-url.ngrok.io/api/webhooks/instagram"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="verify-token">Verify Token</Label>
                        <Input
                            id="verify-token"
                            placeholder="my_instagram_webhook_verify_token_2024"
                            value={verifyToken}
                            onChange={(e) => setVerifyToken(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={testWebhookVerification}>
                            Test Verification
                        </Button>
                        <Button onClick={testWebhookEvent} variant="outline">
                            Test Event
                        </Button>
                    </div>

                    {testResult && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <pre className="text-sm">
                                {JSON.stringify(testResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}