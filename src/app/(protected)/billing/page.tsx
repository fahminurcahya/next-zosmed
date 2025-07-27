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
import { usePaymentHistory, useRecurringHistory, useSubscription, useSubscriptionActions } from "@/hooks/billing-hook";
import RecurringStatusCard from "./_components/recurring-status-card";
import EnableRecurringDialog from "./_components/enable-recurring-dialog";
import { boolean } from "zod";

type SubscriptionAction =
    | { type: "CANCEL"; reason?: string; feedback?: string }
    | { type: "RESUME" }
    | { type: "UPGRADE"; planId: string; discountCode?: string }

export default function BillingDashboardPage() {
    const router = useRouter();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");
    const [activeTab, setActiveTab] = useState<"payments" | "recurring">("payments");


    const { subscription, usage, isLoading: subLoading } = useSubscription();
    const { handleAction, isProcessing } = useSubscriptionActions();
    const [showEnableDialog, setShowEnableDialog] = useState(false);


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

    const {
        cycles,
        total: recurringTotal,
        hasMore: hasMoreCycles,
        isLoading: cyclesLoading,
        loadMore: loadMoreCycles,
        refresh: refreshCycles,
    } = useRecurringHistory(10);

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

            <RecurringStatusCard onOpenChange={setShowEnableDialog} />

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

            {/* Payment History with Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Payment History</span>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === "payments" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("payments")}
                            >
                                One-time Payments
                            </Button>
                            <Button
                                variant={activeTab === "recurring" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("recurring")}
                            >
                                Recurring History
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeTab === "payments" ? (
                        // One-time Payments Table
                        <>
                            {payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {format(payment.createdAt, "dd MMM yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.planName || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    }).format(payment.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {payment.invoiceUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.open(
                                                                    payment.invoiceUrl!,
                                                                    "_blank"
                                                                )
                                                            }
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-gray-600 py-8">
                                    No payment history found
                                </p>
                            )}
                            {hasMore && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={paymentsLoading}
                                    >
                                        {paymentsLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Load More"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Recurring Cycles Table
                        <>
                            {cycles.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Scheduled Date</TableHead>
                                            <TableHead>Cycle #</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Processed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cycles.map((cycle) => (
                                            <TableRow key={cycle.cycleId}>
                                                <TableCell>
                                                    {format(new Date(cycle.scheduledAt), "dd MMM yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    #{cycle.cycleNumber}
                                                </TableCell>
                                                <TableCell>
                                                    {new Intl.NumberFormat("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    }).format(cycle.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        cycle.status === 'SUCCEEDED' ? 'SUCCESS' : cycle.status
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {cycle.succeededAt && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {format(new Date(cycle.succeededAt), "dd MMM")}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-gray-600 py-8">
                                    No recurring payment history found
                                </p>
                            )}
                            {hasMoreCycles && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={loadMoreCycles}
                                        disabled={cyclesLoading}
                                    >
                                        {cyclesLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Load More"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
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
            <EnableRecurringDialog
                open={showEnableDialog}
                onOpenChange={setShowEnableDialog}
            />
        </div>
    );
}