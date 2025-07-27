'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    XCircle,
    RefreshCw,
    ArrowLeft,
    AlertTriangle,
    CreditCard,
    HelpCircle,
    Phone,
    Mail,
    MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { NextPage } from 'next';
import { api } from '@/trpc/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscriptionActions } from '@/hooks/billing-hook';

const BillingFailed: NextPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const external_id = searchParams.get('external_id');
    const failure_reason = searchParams.get('failure_reason');
    const amount = searchParams.get('amount');

    const [retryCount, setRetryCount] = useState(0);
    const [paymentDetails, setPaymentDetails] = useState<any>(null);
    const { handleAction, isProcessing: actionProcessing } = useSubscriptionActions();


    // Get payment details
    const { data: payment, isLoading } = api.billing.getPaymentByExternalId.useQuery(
        { externalId: external_id as string },
        {
            enabled: !!external_id,
        }
    );

    // Handle payment data changes
    useEffect(() => {
        if (payment) {
            setPaymentDetails(payment);
        }
    }, [payment]);




    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numAmount);
    };

    const getFailureReason = (reason: string) => {
        const reasons: Record<string, { title: string; description: string }> = {
            'INSUFFICIENT_BALANCE': {
                title: 'Insufficient Balance',
                description: 'Your account does not have enough balance to complete this transaction.'
            },
            'EXPIRED_CARD': {
                title: 'Card Expired',
                description: 'The card you used has expired. Please use a different card.'
            },
            'INVALID_CARD': {
                title: 'Invalid Card',
                description: 'The card details you entered are invalid. Please check and try again.'
            },
            'DECLINED_BY_BANK': {
                title: 'Declined by Bank',
                description: 'Your bank has declined this transaction. Please contact your bank or try a different payment method.'
            },
            'CANCELLED_BY_USER': {
                title: 'Payment Cancelled',
                description: 'The payment was cancelled during the process.'
            },
            'NETWORK_ERROR': {
                title: 'Network Error',
                description: 'A network error occurred during payment processing. Please try again.'
            },
            'TIMEOUT': {
                title: 'Payment Timeout',
                description: 'The payment process timed out. Please try again.'
            },
            'INVALID_AMOUNT': {
                title: 'Invalid Amount',
                description: 'The payment amount is invalid.'
            },
            'DUPLICATE_TRANSACTION': {
                title: 'Duplicate Transaction',
                description: 'This transaction has already been processed.'
            }
        };

        return reasons[reason?.toUpperCase()] || {
            title: 'Payment Failed',
            description: reason || 'An unknown error occurred during payment processing.'
        };
    };

    const handleRetryPayment = () => {
        if (!paymentDetails?.planId) {
            toast.error('Unable to retry payment. Plan information missing.');
            return;
        }
        setRetryCount(prev => prev + 1);
        handleAction({
            type: "UPGRADE",
            planId: paymentDetails.planId,
            discountCode: paymentDetails.discountCode || undefined,
        })
    };

    const handleContactSupport = () => {
        // You can customize this based on your support channels
        const supportMessage = `Hi, I need help with a failed payment. Payment ID: ${external_id}, Amount: ${formatCurrency(paymentDetails?.amount || amount as string)}`;
        const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(supportMessage)}`;
        window.open(whatsappUrl, '_blank');
    };

    const failureInfo = getFailureReason(
        paymentDetails?.status ||
        failure_reason as string ||
        'UNKNOWN'
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="text-center text-gray-600">
                                Loading payment details...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Failed Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600">
                        We couldn't process your payment. Don't worry, we're here to help you resolve this.
                    </p>
                </div>

                {/* Failure Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Payment ID</p>
                                <p className="font-mono text-sm">{external_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-medium text-lg">{formatCurrency(paymentDetails?.amount || amount as string)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Plan</p>
                                <p className="font-medium">{paymentDetails?.plan?.displayName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Attempted</p>
                                <p className="font-medium">
                                    {paymentDetails?.createdAt ? format(new Date(paymentDetails.createdAt), 'PPP p') : 'Just now'}
                                </p>
                            </div>
                        </div>

                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <div className="space-y-1">
                                    <p className="font-medium">{failureInfo.title}</p>
                                    <p className="text-sm">{failureInfo.description}</p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Troubleshooting Steps */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            How to Resolve This
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium">Try these solutions:</h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-medium">1</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Check your payment method</p>
                                            <p className="text-gray-600">Ensure your card has sufficient balance and is not expired</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-medium">2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Try a different payment method</p>
                                            <p className="text-gray-600">Use another card, bank transfer, or e-wallet</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-medium">3</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Contact your bank</p>
                                            <p className="text-gray-600">If the issue persists, your bank might be blocking the transaction</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-medium">4</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Clear browser cache</p>
                                            <p className="text-gray-600">Sometimes clearing cache and cookies can resolve payment issues</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={handleRetryPayment}
                            disabled={actionProcessing || retryCount >= 3}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${actionProcessing ? 'animate-spin' : ''}`} />
                            {actionProcessing ? 'Creating Payment...' : 'Try Again'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.push('/billing')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Billing
                        </Button>
                    </div>

                    {/* Contact Support Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleContactSupport}
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp Support
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('mailto:support@yourcompany.com', '_blank')}
                            className="flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            Email Support
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('tel:+6281234567890', '_blank')}
                            className="flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            Call Support
                        </Button>
                    </div>
                </div>

                {/* Retry Limit Warning */}
                {retryCount >= 3 && (
                    <Alert className="border-orange-200 bg-orange-50 mb-6">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <p className="font-medium">Maximum retry attempts reached</p>
                            <p className="text-sm">Please contact our support team for assistance or try again later with a different payment method.</p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alternative Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Available Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Choose from various payment options for your convenience:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 border rounded-lg text-center hover:bg-gray-50">
                                <div className="text-2xl mb-1">🏦</div>
                                <p className="text-sm font-medium">Bank Transfer</p>
                                <p className="text-xs text-gray-600">All major banks</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:bg-gray-50">
                                <div className="text-2xl mb-1">💳</div>
                                <p className="text-sm font-medium">Credit Card</p>
                                <p className="text-xs text-gray-600">Visa, Mastercard</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:bg-gray-50">
                                <div className="text-2xl mb-1">📱</div>
                                <p className="text-sm font-medium">E-Wallet</p>
                                <p className="text-xs text-gray-600">OVO, GoPay, DANA</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:bg-gray-50">
                                <div className="text-2xl mb-1">🏪</div>
                                <p className="text-sm font-medium">Retail</p>
                                <p className="text-xs text-gray-600">Alfamart, Indomaret</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingFailed;
