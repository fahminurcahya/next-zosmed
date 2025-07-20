import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentStatusCheckerProps {
    externalId?: string;
    invoiceId?: string;
    onStatusChange?: (status: string, data?: any) => void;
    autoRefresh?: boolean;
    refreshInterval?: number; // in seconds
}

export function PaymentStatusChecker({
    externalId,
    invoiceId,
    onStatusChange,
    autoRefresh = true,
    refreshInterval = 10
}: PaymentStatusCheckerProps) {
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [checkCount, setCheckCount] = useState(0);

    const { data: status, isLoading, refetch } = api.billing.verifyPaymentStatus.useQuery(
        { externalId, invoiceId },
        {
            enabled: !!(externalId || invoiceId),
            refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
        }
    );

    // Handle status changes
    useEffect(() => {
        if (status) {
            setLastChecked(new Date());
            setCheckCount(prev => prev + 1);
            onStatusChange?.(status.status, status);
        }
    }, [status, onStatusChange]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'FAILED':
            case 'EXPIRED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'Payment Successful';
            case 'FAILED':
                return 'Payment Failed';
            case 'EXPIRED':
                return 'Payment Expired';
            case 'PENDING':
                return 'Payment Pending';
            case 'NOT_FOUND':
                return 'Payment Not Found';
            default:
                return 'Checking Status...';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'FAILED':
            case 'EXPIRED':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    if (isLoading && !status) {
        return (
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-blue-800">Checking payment status...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentStatus = status?.status || 'UNKNOWN';

    return (
        <Card className={`border ${getStatusColor(currentStatus)}`}>
            <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(currentStatus)}
                        <div>
                            <p className="font-medium">{getStatusText(currentStatus)}</p>
                            <p className="text-sm opacity-75">
                                Last checked: {lastChecked.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {autoRefresh && (
                            <span className="text-xs opacity-60">
                                Auto-refresh: {refreshInterval}s
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Refresh'
                            )}
                        </Button>
                    </div>
                </div>

                {checkCount > 1 && (
                    <p className="text-xs opacity-60 mt-2">
                        Checked {checkCount} times
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// components/billing/PaymentSummary.tsx
interface PaymentSummaryProps {
    payment: any;
    plan?: any;
    showDetails?: boolean;
}

export function PaymentSummary({ payment, plan, showDetails = true }: PaymentSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">
                                {plan?.displayName || 'Subscription Plan'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Payment ID: {payment.externalId}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">
                                {formatCurrency(payment.amount)}
                            </p>
                            {payment.discountAmount > 0 && (
                                <p className="text-sm text-green-600">
                                    Saved: {formatCurrency(payment.discountAmount)}
                                </p>
                            )}
                        </div>
                    </div>

                    {showDetails && (
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${payment.status === 'SUCCESS' ? 'text-green-600' :
                                    payment.status === 'FAILED' ? 'text-red-600' :
                                        payment.status === 'PENDING' ? 'text-yellow-600' :
                                            'text-gray-600'
                                    }`}>
                                    {payment.status}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Created:</span>
                                <span>{formatDate(payment.createdAt)}</span>
                            </div>

                            {payment.paidAt && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Paid:</span>
                                    <span>{formatDate(payment.paidAt)}</span>
                                </div>
                            )}

                            {payment.paymentMethod && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Method:</span>
                                    <span>{payment.paymentMethod}</span>
                                </div>
                            )}

                            {payment.discountCode && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount Code:</span>
                                    <span className="font-mono">{payment.discountCode}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// components/billing/RetryPaymentButton.tsx
interface RetryPaymentButtonProps {
    originalExternalId: string;
    discountCode?: string;
    onRetryStart?: () => void;
    onRetrySuccess?: (data: any) => void;
    onRetryError?: (error: any) => void;
    disabled?: boolean;
    className?: string;
}

export function RetryPaymentButton({
    originalExternalId,
    discountCode,
    onRetryStart,
    onRetrySuccess,
    onRetryError,
    disabled = false,
    className = ''
}: RetryPaymentButtonProps) {
    const retryPayment = api.billing.retryPayment.useMutation({
        onMutate: () => {
            onRetryStart?.();
        },
        onSuccess: (data) => {
            onRetrySuccess?.(data);
            if (data.invoiceUrl) {
                window.location.href = data.invoiceUrl;
            }
        },
        onError: (error) => {
            onRetryError?.(error);
        }
    });

    return (
        <Button
            onClick={() => retryPayment.mutate({
                originalExternalId,
                discountCode
            })}
            disabled={disabled || retryPayment.isPending}
            className={className}
        >
            {retryPayment.isPending ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Payment...
                </>
            ) : (
                <>
                    <Loader2 className="w-4 h-4 mr-2" />
                    Try Again
                </>
            )}
        </Button>
    );
}

// utils/payment-status.ts
export const PaymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    ABANDONED: 'ABANDONED',
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export const getPaymentStatusInfo = (status: PaymentStatusType) => {
    switch (status) {
        case PaymentStatus.SUCCESS:
            return {
                label: 'Successful',
                color: 'green',
                description: 'Payment completed successfully',
                icon: CheckCircle,
            };
        case PaymentStatus.FAILED:
            return {
                label: 'Failed',
                color: 'red',
                description: 'Payment failed to process',
                icon: XCircle,
            };
        case PaymentStatus.PENDING:
            return {
                label: 'Pending',
                color: 'yellow',
                description: 'Payment is being processed',
                icon: Clock,
            };
        case PaymentStatus.EXPIRED:
            return {
                label: 'Expired',
                color: 'gray',
                description: 'Payment link has expired',
                icon: XCircle,
            };
        case PaymentStatus.ABANDONED:
            return {
                label: 'Abandoned',
                color: 'gray',
                description: 'Payment was abandoned by user',
                icon: XCircle,
            };
        default:
            return {
                label: 'Unknown',
                color: 'gray',
                description: 'Unknown payment status',
                icon: Clock,
            };
    }
};

// hooks/usePaymentPolling.ts
import { useEffect, useRef } from 'react';
import { api } from '@/trpc/react';

export function usePaymentPolling(
    externalId: string | undefined,
    onStatusChange: (status: string, data?: any) => void,
    options: {
        interval?: number;
        maxAttempts?: number;
        stopOnStatus?: string[];
    } = {}
) {
    const {
        interval = 10000, // 10 seconds
        maxAttempts = 30, // 5 minutes total
        stopOnStatus = ['SUCCESS', 'FAILED', 'EXPIRED']
    } = options;

    const attemptsRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { refetch, data } = api.billing.verifyPaymentStatus.useQuery(
        { externalId },
        {
            enabled: false,
        }
    );

    // Handle status changes
    React.useEffect(() => {
        if (data) {
            attemptsRef.current += 1;
            onStatusChange(data.status, data);

            // Stop polling if we reach max attempts or final status
            if (
                attemptsRef.current >= maxAttempts ||
                stopOnStatus.includes(data.status)
            ) {
                stopPolling();
            }
        }
    }, [data, maxAttempts, stopOnStatus, onStatusChange]);

    const startPolling = () => {
        if (intervalRef.current) return; // Already polling

        attemptsRef.current = 0;
        intervalRef.current = setInterval(() => {
            refetch();
        }, interval);

        // Initial check
        refetch();
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (externalId) {
            startPolling();
        }

        return () => {
            stopPolling();
        };
    }, [externalId]);

    return {
        startPolling,
        stopPolling,
        attempts: attemptsRef.current,
        isPolling: !!intervalRef.current
    };
}