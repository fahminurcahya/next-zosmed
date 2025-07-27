import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    CreditCard,
    Info,
    Loader2,
    RefreshCw,
    Shield,
    Zap,
    Clock,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import { useSubscription, useSubscriptionActions } from '@/hooks/billing-hook';

interface EnableRecurringDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EnableRecurringDialog({
    open,
    onOpenChange
}: EnableRecurringDialogProps) {
    const [agreed, setAgreed] = useState(false);
    const { subscription, usage } = useSubscription();
    const { handleAction, isProcessing } = useSubscriptionActions();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate next billing date
    const getNextBillingDate = () => {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
    };

    // Calculate remaining quota value (if any)
    const calculateRemainingValue = () => {
        if (!subscription || !usage) return 0;

        // Calculate days remaining in current period
        const percentageRemaining = subscription.daysRemaining || 0;

        // Calculate unused quota value
        const unusedValue = subscription.price * percentageRemaining;
        return Math.round(unusedValue);
    };

    const handleEnableRecurring = async () => {
        if (!subscription || !agreed) return;

        try {
            await handleAction({
                type: 'ENABLE',
                planId: subscription.planId
            });
            onOpenChange(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    if (!subscription) return null;

    const remainingValue = calculateRemainingValue();
    const nextBillingDate = getNextBillingDate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Enable Auto-Renewal
                    </DialogTitle>
                    <DialogDescription>
                        Set up automatic renewal for your subscription to ensure uninterrupted service
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Current Plan Summary */}
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Your Current Plan
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Plan</span>
                                    <span className="font-medium">{subscription.planDisplayName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="font-medium">{formatCurrency(subscription.price)}</span>
                                </div>
                                {subscription.currentPeriodEnd && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Current Period Ends</span>
                                        <span className="text-sm">{formatDate(subscription.currentPeriodEnd)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Notice about Quota */}
                    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                            <strong>Important:</strong> When you enable auto-renewal, your current billing cycle will be replaced.
                            {' '}Your new billing cycle will start immediately after payment setup.
                        </AlertDescription>
                    </Alert>

                    {/* Current Usage */}
                    {usage && (
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Current Usage This Period
                                </h3>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Instagram Accounts</span>
                                            <span>{usage.accounts.used} / {usage.accounts.limit}</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${usage.accounts.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>DMs Sent</span>
                                            <span>{usage.dm.used} / {usage.dm.limit}</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all"
                                                style={{ width: `${usage.dm.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    {usage.ai.limit > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>AI Replies</span>
                                                <span>{usage.ai.used} / {usage.ai.limit}</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 transition-all"
                                                    style={{ width: `${usage.ai.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-3">
                                    <Info className="h-3 w-3 inline mr-1" />
                                    Usage will reset when auto-renewal is activated
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Auto-Renewal Benefits */}
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Benefits of Auto-Renewal
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Never Lose Access</p>
                                        <p className="text-sm text-muted-foreground">
                                            Your automation will continue running without interruption
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Automatic Payments</p>
                                        <p className="text-sm text-muted-foreground">
                                            No need to manually renew
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Flexible Control</p>
                                        <p className="text-sm text-muted-foreground">
                                            Pause or cancel auto-renewal anytime from your dashboard
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                What Happens Next?
                            </h3>
                            <ol className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="font-medium text-blue-600">1.</span>
                                    <span>You'll be redirected to Xendit to securely link your payment method</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-medium text-blue-600">2.</span>
                                    <span>Choose from e-wallets, bank transfers, or credit cards</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-medium text-blue-600">3.</span>
                                    <span>Your first charge will be immediately deducted {formatCurrency(subscription.price)}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-medium text-blue-600">4.</span>
                                    <span>Subsequent charges will occur automatically</span>
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <Shield className="h-4 w-4 text-gray-600" />
                        <p className="text-sm text-gray-600">
                            Your payment information is securely processed by Xendit, our PCI-compliant payment partner
                        </p>
                    </div>

                    <Separator />

                    {/* Agreement Checkbox */}
                    <div className="flex items-start space-x-2">
                        <Switch
                            id="agreement"
                            checked={agreed}
                            onCheckedChange={setAgreed}
                        />
                        <div className="space-y-1">
                            <Label
                                htmlFor="agreement"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                I understand and agree
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                I understand that enabling auto-renewal will start a new billing cycle immediately
                                and any remaining quota from my current period will be replaced.
                                I can cancel auto-renewal anytime.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnableRecurring}
                        disabled={!agreed || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Enable Auto-Renewal
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}