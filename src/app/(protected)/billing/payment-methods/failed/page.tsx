"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { api } from "@/trpc/react";

export default function PaymentMethodFailedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const externalId = searchParams.get("external_id");
    const failureReason = searchParams.get("failure_reason");

    const [isRetrying, setIsRetrying] = useState(false);

    const getFailureMessage = (reason: string | null) => {
        const messages: Record<string, string> = {
            "USER_CANCELLED": "You cancelled the payment method setup.",
            "EXPIRED": "The session expired. Please try again.",
            "INVALID_CARD": "The card details were invalid. Please check and try again.",
            "INSUFFICIENT_BALANCE": "Insufficient balance in your account.",
            "DECLINED": "The payment method was declined.",
            "NETWORK_ERROR": "A network error occurred. Please try again.",
        };

        return messages[reason || ""] || "An error occurred while adding your payment method.";
    };

    const handleRetry = () => {
        router.push("/billing/payment-methods");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Payment Method Setup Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {getFailureMessage(failureReason)}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <h3 className="font-medium">What you can do:</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Check your payment details and try again</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Try a different payment method</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Contact your bank if the issue persists</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/billing")}
                            className="flex-1"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Billing
                        </Button>
                        <Button
                            onClick={handleRetry}
                            className="flex-1"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
