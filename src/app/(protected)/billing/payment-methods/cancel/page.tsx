"use client";

import { useEffect } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PaymentMethodCancelPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            router.push("/billing/payment-methods");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Setup Cancelled</h1>
                        <p className="text-gray-600 mb-6">
                            You cancelled the payment method setup. You can try again anytime.
                        </p>
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