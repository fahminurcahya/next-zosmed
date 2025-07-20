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
import { Separator } from "@/components/ui/separator";
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
    TrendingUp,
    RefreshCw,
    XCircle,
    CheckCircle,
    Clock,
    Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BillingDashboardPage() {
    const router = useRouter();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");

    // Queries
    const subscriptionQuery = api.billing.getCurrentSubscription.useQuery();
    const paymentHistoryQuery = api.billing.getPaymentHistory.useQuery({
        limit: 10,
    });

    // Mutations
    const cancelMutation = api.billing.cancelSubscription.useMutation({
        onSuccess: () => {
            toast.success("Subscription cancelled successfully");
            setShowCancelDialog(false);
            subscriptionQuery.refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const resumeMutation = api.billing.resumeSubscription.useMutation({
        onSuccess: () => {
            toast.success("Subscription resumed successfully");
            subscriptionQuery.refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const subscription = subscriptionQuery.data;
    const payments = paymentHistoryQuery.data?.payments || [];

    const handleCancelSubscription = () => {
        cancelMutation.mutate({
            reason: cancelReason,
            feedback: cancelFeedback,
        });
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

    if (subscriptionQuery.isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-8">
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
                                        {subscription.pricingPlan?.displayName || subscription.plan}
                                    </h3>
                                    <p className="text-gray-600">
                                        Rp {subscription.pricingPlan?.price.toLocaleString("id-ID") || 0}/month
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
                                    onClick={() => resumeMutation.mutate()}
                                    className="flex-1"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
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
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    )}
                </Card>

                {/* Usage Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Usage</CardTitle>
                        <CardDescription>This month's usage</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm">Instagram Accounts</span>
                                <span className="text-sm font-medium">
                                    {subscription?.user?.integration?.length || 0} / {subscription?.maxAccounts || 1}
                                </span>
                            </div>
                            <Progress
                                value={
                                    ((subscription?.user?.integration?.length || 0) / (subscription?.maxAccounts || 1)) * 100
                                }
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm">Auto DM Sent</span>
                                <span className="text-sm font-medium">
                                    {subscription?.currentDMCount.toLocaleString() || 0} / {subscription?.maxDMPerMonth.toLocaleString() || 0}
                                </span>
                            </div>
                            <Progress
                                value={
                                    ((subscription?.currentDMCount || 0) / (subscription?.maxDMPerMonth || 1)) * 100
                                }
                            />
                        </div>

                        {subscription?.hasAIReply && (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm">AI Replies Used</span>
                                    <span className="text-sm font-medium">
                                        0 / {subscription?.maxAIReplyPerMonth || 0}
                                    </span>
                                </div>
                                <Progress value={0} />
                            </div>
                        )}

                        <Separator />

                        <div className="text-sm text-gray-600">
                            <p>Usage resets on: {subscription?.dmResetDate ? format(new Date(subscription.dmResetDate), "dd MMM yyyy") : "-"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length > 0 ? (
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
                                                <p className="font-medium">{payment.plan?.displayName} Plan</p>
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
                                            {payment.xenditInvoiceUrl && payment.status === "SUCCESS" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(payment.xenditInvoiceUrl!, "_blank")}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No payment history yet
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
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}