import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    RefreshCw,
    Info,
    CreditCard,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Shield,
    Clock
} from 'lucide-react';

// Format date helper
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

interface AutoRenewalToggleProps {
    plan: {
        id: string;
        displayName: string;
        price: number;
        period: 'MONTHLY' | 'YEARLY';
    };
    currentRecurringStatus?: {
        status: string;
        nextChargeDate?: Date;
        paymentMethod?: string;
    };
    onEnableRecurring: (enabled: boolean) => Promise<any>;
    isProcessing?: boolean;
}

export default function AutoRenewalToggle({
    plan,
    currentRecurringStatus,
    onEnableRecurring,
    isProcessing = false
}: AutoRenewalToggleProps) {
    const [isEnabled, setIsEnabled] = useState(currentRecurringStatus?.status === 'ACTIVE');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

    const handleToggle = (checked: boolean) => {
        setPendingAction(checked ? 'enable' : 'disable');
        setShowConfirmDialog(true);
    };

    const handleConfirm = async () => {
        if (!pendingAction) return;

        try {
            const result = await onEnableRecurring(pendingAction === 'enable');

            if (result.activationUrl && pendingAction === 'enable') {
                // Redirect to Xendit for payment method setup
                window.location.href = result.activationUrl;
            } else {
                setIsEnabled(pendingAction === 'enable');
            }
        } catch (error) {
            console.error('Failed to update recurring:', error);
        }

        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Auto-Renewal Settings
                    </CardTitle>
                    <CardDescription>
                        Manage automatic subscription renewal for your {plan.displayName} plan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Toggle Section */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <Label htmlFor="auto-renewal" className="text-base font-medium cursor-pointer">
                                Enable Auto-Renewal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically renew every {plan.period.toLowerCase()} at {formatPrice(plan.price)}
                            </p>
                        </div>
                        <Switch
                            id="auto-renewal"
                            checked={isEnabled}
                            onCheckedChange={handleToggle}
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Status Display */}
                    {currentRecurringStatus && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">Status</span>
                                <Badge variant={currentRecurringStatus.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                    {currentRecurringStatus.status}
                                </Badge>
                            </div>

                            {currentRecurringStatus.nextChargeDate && (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Next Charge
                                    </span>
                                    <span className="text-sm">
                                        {formatDate(currentRecurringStatus.nextChargeDate)}
                                    </span>
                                </div>
                            )}

                            {currentRecurringStatus.paymentMethod && (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Method
                                    </span>
                                    <span className="text-sm">
                                        {currentRecurringStatus.paymentMethod}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Benefits */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Benefits of Auto-Renewal:</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Never lose access to your automation tools</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Seamless monthly payments without manual intervention</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Cancel anytime before the next billing cycle</span>
                            </li>
                        </ul>
                    </div>

                    {/* Info Alert */}
                    {isEnabled && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Auto-renewal is active. You'll be charged {formatPrice(plan.price)} on{' '}
                                {currentRecurringStatus?.nextChargeDate
                                    ? formatDate(currentRecurringStatus.nextChargeDate)
                                    : 'your next billing date'
                                }. You can disable it anytime.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Security Note */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payment</p>
                            <p className="text-blue-700 dark:text-blue-300">
                                Your payment method is securely stored with Xendit, our PCI-compliant payment partner
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction === 'enable' ? 'Enable' : 'Disable'} Auto-Renewal
                        </DialogTitle>
                        <DialogDescription>
                            {pendingAction === 'enable' ? (
                                <>
                                    You'll be redirected to securely link your payment method with Xendit.
                                    Your subscription will automatically renew every {plan.period.toLowerCase()}.
                                </>
                            ) : (
                                <>
                                    Your subscription will remain active until the end of the current billing period.
                                    You can re-enable auto-renewal anytime.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Plan</span>
                            <span className="font-medium">{plan.displayName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Billing Period</span>
                            <span className="font-medium">{plan.period}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Amount</span>
                            <span className="font-medium">{formatPrice(plan.price)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowConfirmDialog(false);
                                setPendingAction(null);
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className={pendingAction === 'disable' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `${pendingAction === 'enable' ? 'Enable' : 'Disable'} Auto-Renewal`
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}