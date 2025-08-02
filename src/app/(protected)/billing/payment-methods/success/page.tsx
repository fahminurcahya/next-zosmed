"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, CreditCard } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function PaymentMethodSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const externalId = searchParams.get("external_id");

    // Refetch payment methods to update the list
    const utils = api.useUtils();

    useEffect(() => {
        // Show success message
        toast.success("Payment method added successfully!");

        // Invalidate queries to refresh data
        utils.paymentMethod.list.invalidate();
        utils.billing.getRecurringStatus.invalidate();

        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            router.push("/billing/payment-methods");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router, utils]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Payment Method Added!</h1>
                        <p className="text-gray-600 mb-6">
                            Your payment method has been successfully linked for auto-renewal.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Redirecting to payment methods...
                        </div>
                        <Button
                            onClick={() => router.push("/billing/payment-methods")}
                            className="w-full"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            View Payment Methods
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}