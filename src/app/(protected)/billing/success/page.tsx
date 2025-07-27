'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    ArrowRight,
    CreditCard,
    User,
    Receipt,
    Loader2,
    Gift,
    Crown,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { NextPage } from 'next';
import { api } from '@/trpc/react';

const BillingSuccess: NextPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Ambil semua possible parameters dari URL
    const external_id = searchParams.get('external_id') || searchParams.get('id');
    const invoice_id = searchParams.get('invoice_id');

    const [finalPaymentData, setFinalPaymentData] = useState<any>(null);

    // 1. COBA CARI PAYMENT BERDASARKAN EXTERNAL_ID - SIMPLIFIED
    const externalIdQuery = api.billing.getPaymentByExternalId.useQuery(
        { externalId: external_id as string },
        {
            enabled: !!external_id,
            retry: false,
        }
    );

    // 2. JIKA TIDAK ADA, COBA BERDASARKAN INVOICE_ID - SIMPLIFIED  
    const invoiceIdQuery = api.billing.getPaymentByInvoiceId.useQuery(
        { invoiceId: invoice_id as string },
        {
            enabled: !externalIdQuery.data && !!invoice_id,
            retry: false,
        }
    );

    // 3. JIKA MASIH TIDAK ADA, COBA CARI PAYMENT TERBARU USER - SIMPLIFIED
    const latestPaymentQuery = api.billing.getPaymentHistory.useQuery(
        { limit: 1, offset: 0 },
        {
            enabled: !externalIdQuery.data && !invoiceIdQuery.data,
            retry: false,
        }
    );

    // Get current subscription
    const subscriptionQuery = api.billing.getCurrentSubscription.useQuery();

    // Effect untuk menentukan payment data yang akan digunakan
    useEffect(() => {
        let paymentData = null;

        if (externalIdQuery.data) {
            paymentData = externalIdQuery.data;
            console.log('Using payment from external_id:', paymentData);
        } else if (invoiceIdQuery.data) {
            paymentData = invoiceIdQuery.data;
            console.log('Using payment from invoice_id:', paymentData);
        } else if (latestPaymentQuery.data?.payments?.[0]) {
            paymentData = latestPaymentQuery.data.payments[0];
            console.log('Using latest payment:', paymentData);
        }

        if (paymentData) {
            setFinalPaymentData(paymentData);
        }
    }, [
        external_id,
        invoice_id,
        externalIdQuery.data,
        externalIdQuery.error,
        externalIdQuery.isPending,
        invoiceIdQuery.data,
        invoiceIdQuery.error,
        invoiceIdQuery.isPending,
        latestPaymentQuery.data,
        latestPaymentQuery.error,
        latestPaymentQuery.isPending,
    ]);

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numAmount);
    };

    const getPaymentMethodDisplay = (method?: string) => {
        if (!method) return 'N/A';

        const methods: Record<string, string> = {
            'BCA': 'Bank BCA',
            'BNI': 'Bank BNI',
            'BRI': 'Bank BRI',
            'MANDIRI': 'Bank Mandiri',
            'PERMATA': 'Bank Permata',
            'BSI': 'Bank BSI',
            'CREDIT_CARD': 'Credit Card',
            'DANA': 'DANA',
            'OVO': 'OVO',
            'GOPAY': 'GoPay',
            'SHOPEEPAY': 'ShopeePay',
            'LINKAJA': 'LinkAja',
            'QRIS': 'QRIS',
            'ALFAMART': 'Alfamart',
            'INDOMARET': 'Indomaret'
        };
        return methods[method.toUpperCase()] || method;
    };

    // Determine loading state
    const isPending = externalIdQuery.isPending && invoiceIdQuery.isPending && latestPaymentQuery.isPending;

    // LOADING STATE
    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-center text-gray-600">
                                Verifying your payment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // NO PAYMENT FOUND
    if (!finalPaymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900 mb-2">Payment Not Found</p>
                                <p className="text-sm text-gray-600 mb-4">
                                    We couldn't find your payment details. This might be because:
                                </p>
                                <ul className="text-sm text-gray-600 text-left space-y-1 mb-4">
                                    <li>• The payment is still being processed</li>
                                    <li>• The payment ID is incorrect</li>
                                    <li>• There was an error in the payment flow</li>
                                </ul>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => router.push('/billing')} variant="outline">
                                    Back to Billing
                                </Button>
                                <Button onClick={() => window.location.reload()}>
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // PAYMENT STILL PENDING
    if (finalPaymentData.status !== 'SUCCESS') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-900 mb-2">Payment Processing</p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Status: <span className="font-medium">{finalPaymentData.status}</span>
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Your payment is being processed. This usually takes a few minutes.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => router.push('/billing')} variant="outline">
                                    Back to Billing
                                </Button>
                                <Button onClick={() => window.location.reload()}>
                                    Refresh Status
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // PAYMENT SUCCESS - Show success page
    const planDetails = {
        name: finalPaymentData.plan?.displayName || finalPaymentData.plan?.name || 'Subscription Plan',
        color: 'bg-blue-100 text-blue-800',
        icon: '🚀'
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Payment Successful! 🎉
                    </h1>
                    <p className="text-gray-600">
                        Thank you for your payment. Your subscription is now active.
                    </p>
                </div>

                {/* Payment Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Payment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Payment ID</p>
                                <p className="font-mono text-sm">{finalPaymentData.externalId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-medium">{getPaymentMethodDisplay(finalPaymentData.paymentMethod)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount Paid</p>
                                <p className="font-medium text-lg">{formatCurrency(finalPaymentData.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Payment Date</p>
                                <p className="font-medium">
                                    {finalPaymentData.paidAt ? format(new Date(finalPaymentData.paidAt), 'PPP p') : 'Just now'}
                                </p>
                            </div>
                        </div>

                        {finalPaymentData.discountCode && finalPaymentData.discountAmount && (
                            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                                <Gift className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Discount Applied: {finalPaymentData.discountCode}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        You saved {formatCurrency(finalPaymentData.discountAmount)}!
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="w-5 h-5" />
                            Your Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Plan</span>
                            <Badge className={planDetails.color}>
                                <span className="mr-1">{planDetails.icon}</span>
                                {planDetails.name}
                            </Badge>
                        </div>

                        {subscriptionQuery.data && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Valid Until</span>
                                    <span className="font-medium">
                                        {subscriptionQuery.data.currentPeriodEnd ? format(new Date(subscriptionQuery.data.currentPeriodEnd), 'PPP') : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Days Remaining</span>
                                    <span className="font-medium text-blue-600">
                                        {subscriptionQuery.data.daysRemaining} days
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/billing')}
                        className="flex items-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        View Billing
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BillingSuccess;