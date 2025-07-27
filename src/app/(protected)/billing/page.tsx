"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    CreditCard,
    Calendar,
    AlertCircle,
    Download,
    Zap,
    RefreshCw,
    XCircle,
    CheckCircle,
    Clock,
    Loader2,
    DollarSign,
    FileText,
    TrendingUp,
    MoreHorizontal,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UsageCard } from "./_components";
import { usePaymentHistory, useSubscription, useSubscriptionActions } from "@/hooks/billing-hook";

type SubscriptionAction =
    | { type: "CANCEL"; reason?: string; feedback?: string }
    | { type: "RESUME" }
    | { type: "UPGRADE"; planId: string; discountCode?: string }

export default function BillingDashboardPage() {
    const router = useRouter();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");

    const { subscription, usage, isLoading: subLoading } = useSubscription();

    const { handleAction, isProcessing } = useSubscriptionActions();

    const {
        payments,
        stats,
        hasMore,
        isLoading: paymentsLoading,
        isError: paymentsError,
        loadMore,
        refresh: refreshPayments,
        page
    } = usePaymentHistory({ limit: 10 });

    const handleCancelSubscription = async () => {
        try {
            await handleAction({
                type: "CANCEL",
                reason: cancelReason,
                feedback: cancelFeedback,
            });
            setShowCancelDialog(false);
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    const handleResumeSubscription = async () => {
        try {
            await handleAction({
                type: "RESUME",
            });
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            SUCCESS: { variant: "success", icon: CheckCircle, text: "Paid" },
            PENDING: { variant: "warning", icon: Clock, text: "Pending" },
            EXPIRED: { variant: "secondary", icon: XCircle, text: "Expired" },
            FAILED: { variant: "destructive", icon: XCircle, text: "Failed" },
        };

        const config = variants[status] || variants.PENDING;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant as any} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.text}
            </Badge>
        );
    };

    if (subLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
                <p className="text-gray-600">
                    Manage your subscription and view payment history
                </p>
            </div>

            {/* Current Subscription */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Current Plan
                            {subscription?.isActive && (
                                <Badge variant="success">Active</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {subscription.planDisplayName || subscription.plan}
                                    </h3>
                                    <p className="text-gray-600">
                                        Rp {subscription.price.toLocaleString("id-ID") || 0}/month
                                    </p>
                                </div>

                                {subscription.currentPeriodEnd && (
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Billing cycle</span>
                                            <span>{subscription.daysRemaining} days remaining</span>
                                        </div>
                                        <Progress
                                            value={
                                                ((30 - (subscription.daysRemaining || 0)) / 30) * 100
                                            }
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Renews on {format(new Date(subscription.currentPeriodEnd), "dd MMM yyyy", { locale: id })}
                                        </p>
                                    </div>
                                )}

                                {subscription.cancelAtPeriodEnd && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Your subscription will end on{" "}
                                            {format(new Date(subscription.currentPeriodEnd!), "dd MMM yyyy", { locale: id })}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600 mb-4">No active subscription</p>
                                <Button onClick={() => router.push("/pricing")}>
                                    View Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {subscription && (
                        <CardFooter className="flex gap-2">
                            {subscription.cancelAtPeriodEnd ? (
                                <Button
                                    variant="outline"
                                    onClick={handleResumeSubscription}
                                    disabled={isProcessing}
                                    className="flex-1"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Resume Subscription
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => router.push("/billing/upgrade")}
                                        className="flex-1"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Upgrade Plan
                                    </Button>
                                    {subscription.planDisplayName.toLowerCase() !== "free".toLowerCase() &&
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowCancelDialog(true)}
                                        >
                                            Cancel
                                        </Button>
                                    }
                                </>
                            )}
                        </CardFooter>
                    )}
                </Card>

                {/* Usage Stats */}
                {subscription && usage && (
                    <UsageCard
                        subscription={subscription}
                        usage={usage}
                    />
                )}

            </div>

            {/* Payment Statistics */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.count}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                            </div>
                            <p className="text-2xl font-bold">{Math.round(stats.successRate)}%</p>
                            <p className="text-xs text-gray-500">
                                {stats.successful} of {stats.count} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <p className="text-sm font-medium text-gray-500">Status Overview</p>
                            </div>
                            <div className="space-y-1 mt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Success: {stats.successful}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-600">Pending: {stats.pending}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Failed: {stats.failed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>Your recent transactions</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshPayments}
                            disabled={paymentsLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${paymentsLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {paymentsError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600 mb-2">Failed to load payment history</p>
                            <Button variant="outline" onClick={refreshPayments}>
                                Try Again
                            </Button>
                        </div>
                    ) : payments.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {format(new Date(payment.createdAt), "dd MMM yyyy", { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{payment.planName} Plan</p>
                                                    {payment.discountCode && (
                                                        <p className="text-sm text-gray-500">
                                                            Discount: {payment.discountCode}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        Rp {payment.amount.toLocaleString("id-ID")}
                                                    </p>
                                                    {payment.discountAmount && (
                                                        <p className="text-sm text-green-600">
                                                            -Rp {payment.discountAmount.toLocaleString("id-ID")}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell>
                                                {payment.invoiceUrl && payment.status === "SUCCESS" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(payment.invoiceUrl!, "_blank")}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {payment.status === "PENDING" && (
                                                    <div className="flex gap-2">
                                                        {payment.invoiceUrl && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(payment.invoiceUrl!, "_blank")}
                                                                className="text-blue-600 hover:text-blue-700"
                                                            >
                                                                <CreditCard className="h-4 w-4 mr-1" />
                                                                Continue Payment
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="flex justify-center mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={paymentsLoading}
                                    >
                                        {paymentsLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                                Load More
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Pagination Info */}
                            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                                <span>
                                    Showing {payments.length} payments
                                    {stats && ` of ${stats.count} total`}
                                </span>
                                {page > 0 && (
                                    <span>Page {page + 1}</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {paymentsLoading ? (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                "No payment history yet"
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancel Subscription Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            We're sorry to see you go. Your subscription will remain active until the end of the current billing period.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Why are you cancelling? (optional)</Label>
                            <select
                                className="w-full mt-2 p-2 border rounded-md"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">Select a reason</option>
                                <option value="too_expensive">Too expensive</option>
                                <option value="not_using">Not using enough</option>
                                <option value="missing_features">Missing features</option>
                                <option value="switching_competitor">Switching to competitor</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <Label>Any feedback for us? (optional)</Label>
                            <Textarea
                                value={cancelFeedback}
                                onChange={(e) => setCancelFeedback(e.target.value)}
                                placeholder="Let us know how we can improve..."
                                rows={4}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                "Cancel Subscription"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}