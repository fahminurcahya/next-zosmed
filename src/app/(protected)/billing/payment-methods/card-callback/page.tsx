"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, CreditCard, XCircle, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function CardTokenCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get parameters from URL
    const tokenId = searchParams.get("token_id");
    const authentication3dsId = searchParams.get("authentication_3ds_id");
    const externalId = searchParams.get("external_id");
    const status = searchParams.get("status");

    // Process card token
    const processCardToken = api.paymentMethod.processCardToken.useMutation({
        onSuccess: () => {
            toast.success("Card added successfully!");
            setTimeout(() => {
                router.push("/billing/payment-methods");
            }, 2000);
        },
        onError: (error) => {
            setError(error.message || "Failed to process card");
            setIsProcessing(false);
        }
    });

    useEffect(() => {
        // Check if we have the required parameters
        if (status === 'failed') {
            setError("Card verification failed. Please try again.");
            setIsProcessing(false);
            return;
        }

        if (!tokenId || !externalId) {
            setError("Missing required information. Please try again.");
            setIsProcessing(false);
            return;
        }

        // Process the card token
        processCardToken.mutate({
            tokenId,
            authentication3dsId: authentication3dsId || undefined,
            externalId
        });
    }, [tokenId, authentication3dsId, externalId, status]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Card Setup Failed</h1>
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {error}
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => router.push("/billing/payment-methods")}
                                className="w-full"
                            >
                                Back to Payment Methods
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center">
                        {isProcessing ? (
                            <>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                                <h1 className="text-2xl font-bold mb-2">Processing Your Card</h1>
                                <p className="text-gray-600 mb-6">
                                    Please wait while we securely save your card for future payments...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold mb-2">Card Added Successfully!</h1>
                                <p className="text-gray-600 mb-6">
                                    Your card has been securely saved for auto-renewal.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting to payment methods...
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}