import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    RefreshCw,
    Calendar,
    CreditCard,
    Pause,
    Play,
    Settings,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    Info,
    Shield,
    ChevronRight
} from 'lucide-react';
import { useRecurringStatus, useSubscriptionActions } from '@/hooks/billing-hook';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EnableRecurringDialog from './enable-recurring-dialog';
import { useRouter } from 'next/navigation';

interface RecurringStatusCardProps {
    onManageClick?: () => void;
    showDetails?: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RecurringStatusCard({
    onManageClick,
    showDetails = true,
    onOpenChange,
}: RecurringStatusCardProps) {
    const router = useRouter();
    const { recurringStatus, hasActiveRecurring, isLoading, refetch } = useRecurringStatus();
    const { pauseRecurring, resumeRecurring, isProcessing } = useSubscriptionActions();


    // Format date helper
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(date));
    };

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate days until next charge
    const getDaysUntilCharge = (nextChargeDate: Date | string) => {
        const next = new Date(nextChargeDate);
        const today = new Date();
        const diffTime = next.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
            'ACTIVE': {
                variant: 'success',
                icon: CheckCircle,
                label: 'Active',
                color: 'text-green-600'
            },
            'PAUSED': {
                variant: 'warning',
                icon: Pause,
                label: 'Paused',
                color: 'text-yellow-600'
            },
            'PENDING_ACTIVATION': {
                variant: 'secondary',
                icon: Clock,
                label: 'Pending Activation',
                color: 'text-blue-600'
            },
            'INACTIVE': {
                variant: 'secondary',
                icon: XCircle,
                label: 'Inactive',
                color: 'text-gray-600'
            },
        };

        const config = variants[status] || variants.INACTIVE;
        const Icon = config!.icon;

        return (
            <Badge variant={config!.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config!.label}
            </Badge>
        );
    };

    // Handle pause/resume
    const handlePauseResume = async () => {
        try {
            if (recurringStatus?.status === 'ACTIVE') {
                await pauseRecurring();
            } else if (recurringStatus?.status === 'PAUSED') {
                const result = await resumeRecurring();
                if (result.activationUrl) {
                    window.location.href = result.activationUrl;
                }
            }
            refetch();
        } catch (error) {
            // Error handled by mutation
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Auto-Renewal Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No recurring plan
    if (!hasActiveRecurring || !recurringStatus) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Auto-Renewal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <RefreshCw className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-medium mb-1">No Auto-Renewal Active</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enable auto-renewal to automatically renew your subscription
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onOpenChange(true)}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Enable Auto-Renewal
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const daysUntilCharge = recurringStatus.nextChargeDate
        ? getDaysUntilCharge(recurringStatus.nextChargeDate)
        : null;

    return (
        <Card className="relative overflow-hidden">
            {/* Status indicator line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${recurringStatus.status === 'ACTIVE' ? 'bg-green-500' :
                recurringStatus.status === 'PAUSED' ? 'bg-yellow-500' :
                    'bg-gray-300'
                }`} />

            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Auto-Renewal
                    </span>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(recurringStatus.status)}
                        {onManageClick && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={refetch}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onManageClick}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Manage Settings
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Stats for Active Status */}
                {recurringStatus.status === 'ACTIVE' && daysUntilCharge !== null && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Next charge in
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {daysUntilCharge} {daysUntilCharge === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                )}

                {/* Plan Details */}
                {showDetails && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Plan</span>
                            <span className="text-sm font-medium">
                                {recurringStatus.plan?.displayName}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">Amount</span>
                            <div className="text-right">
                                <div className="text-sm font-medium">
                                    {formatCurrency(recurringStatus.amount)}
                                </div>
                                {recurringStatus.discountAmount && recurringStatus.discountAmount > 0 && (
                                    <div className="text-xs text-green-600">
                                        Save {formatCurrency(recurringStatus.discountAmount)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {recurringStatus.nextChargeDate && (
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Next Charge
                                </span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-sm cursor-help">
                                                {formatDate(recurringStatus.nextChargeDate)}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Automatic payment will be processed on this date</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}

                        {recurringStatus.paymentMethod && (
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Method
                                </span>
                                <span className="text-sm">
                                    {recurringStatus.paymentMethod}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Status-specific Messages */}
                {recurringStatus.status === 'ACTIVE' && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            Your subscription will automatically renew on {recurringStatus.nextChargeDate ? formatDate(recurringStatus.nextChargeDate) : 'the next billing date'}.
                        </AlertDescription>
                    </Alert>
                )}

                {recurringStatus.status === 'PAUSED' && (
                    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                        <Pause className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                            Auto-renewal is paused. Your subscription will not renew automatically.
                        </AlertDescription>
                    </Alert>
                )}

                {recurringStatus.status === 'PENDING_ACTIVATION' && (
                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                            Auto-renewal is pending activation. Please complete the payment method setup.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secured by Xendit</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {recurringStatus.status === 'ACTIVE' && (
                        <Button
                            variant="outline"
                            onClick={handlePauseResume}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause Auto-Renewal
                                </>
                            )}
                        </Button>
                    )}

                    {recurringStatus.status === 'PAUSED' && (
                        <Button
                            variant="outline"
                            onClick={handlePauseResume}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume Auto-Renewal
                                </>
                            )}
                        </Button>
                    )}

                    {recurringStatus.status === 'PENDING_ACTIVATION' && (
                        <Button
                            onClick={() => window.location.href = recurringStatus.activationUrl || '#'}
                            className="flex-1"
                        >
                            <ChevronRight className="h-4 w-4 mr-2" />
                            Complete Setup
                        </Button>
                    )}

                    {recurringStatus.status === 'ACTIVE' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = '/billing/payment-methods'}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Update Payment
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>

    );
}