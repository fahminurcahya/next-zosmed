"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
    AlertCircle,
    Zap,
    RefreshCw,
    XCircle,
    CheckCircle,
    Clock,
    Loader2,
    FileText,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UsageCard } from "./_components";
import { usePaymentHistory, useRecurringHistory, useSubscription, useSubscriptionActions } from "@/hooks/billing-hook";
import RecurringStatusCard from "./_components/recurring-status-card";
import EnableRecurringDialog from "./_components/enable-recurring-dialog";
import { usePaymentMethods } from "@/hooks/payment-method-hook";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from 'nextjs-toploader/app';



// Loading Skeleton Components
const SubscriptionCardSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

const UsageCardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const TableSkeleton = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 ml-auto" />
                </div>
            ))}
        </div>
    </div>
);

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export default function BillingDashboardPage() {
    const isDevelopmentmode = process.env.NODE_ENV === 'development'
    const isRecuring = process.env.CONFIG_RECURRING || false
    const router = useRouter();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");
    const [activeTab, setActiveTab] = useState<"payments" | "recurring">("payments");

    const { subscription, usage, isLoading: subLoading } = useSubscription();
    const { handleAction, isProcessing } = useSubscriptionActions();
    const { paymentMethods, hasActiveMethod, defaultMethod, isLoading: paymentMethodsLoading } = usePaymentMethods();
    const [showEnableDialog, setShowEnableDialog] = useState(false);

    const {
        payments,
        hasMore,
        isLoading: paymentsLoading,
        loadMore,
        refresh: refreshPayments,
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
            toast.success("Subscription cancelled successfully");
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    const handleResumeSubscription = async () => {
        try {
            await handleAction({
                type: "RESUME",
            });
            toast.success("Subscription resumed successfully");
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

    if (subLoading || paymentMethodsLoading) {
        return (
            <motion.div
                className="container mx-auto p-6 space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header Skeleton */}
                <motion.div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </motion.div>

                {/* Cards Skeleton */}
                <motion.div className="grid gap-6 md:grid-cols-2">
                    <SubscriptionCardSkeleton />
                    <UsageCardSkeleton />
                </motion.div>

                {/* Table Skeleton */}
                <motion.div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-32" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TableSkeleton />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container mx-auto p-6 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
                    <p className="text-gray-600">
                        Manage your subscription and view payment history
                    </p>
                </div>
                {isRecuring && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="outline"
                            onClick={() => router.push("/billing/payment-methods")}
                            className="flex items-center gap-2"
                        >
                            <CreditCard className="h-4 w-4" />
                            Payment Methods
                        </Button>
                    </motion.div>
                )}
            </motion.div>

            {/* Current Subscription */}
            <motion.div className="grid gap-6 md:grid-cols-2">
                <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Current Plan
                                <div className="flex items-center gap-2">
                                    <AnimatePresence>
                                        {subscription?.isActive && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                            >
                                                <Badge variant="success">Active</Badge>
                                            </motion.div>
                                        )}
                                        {subscription && subscription.planDisplayName.toLowerCase() !== "free" && !hasActiveMethod && isRecuring && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                            >
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    No Payment Method
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subscription ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
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
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ delay: 0.5, duration: 0.8 }}
                                            >
                                                <Progress
                                                    value={
                                                        ((30 - (subscription.daysRemaining || 0)) / 30) * 100
                                                    }
                                                />
                                            </motion.div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Renews on {format(new Date(subscription.currentPeriodEnd), "dd MMM yyyy", { locale: id })}
                                            </p>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {subscription.cancelAtPeriodEnd && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Your subscription will end on{" "}
                                                        {format(new Date(subscription.currentPeriodEnd!), "dd MMM yyyy", { locale: id })}
                                                    </AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-600 mb-4">No active subscription</p>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button onClick={() => router.push("/pricing")}>
                                            View Plans
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </CardContent>
                        {subscription && (
                            <CardFooter className="flex gap-2">
                                <AnimatePresence mode="wait">
                                    {subscription.cancelAtPeriodEnd ? (
                                        <motion.div
                                            key="resume"
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                onClick={handleResumeSubscription}
                                                disabled={isProcessing}
                                                className="w-full"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                )}
                                                Resume Subscription
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="actions"
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            className="flex gap-2 flex-1"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1"
                                            >
                                                <Button
                                                    onClick={() => router.push("/billing/upgrade")}
                                                    className="w-full"
                                                >
                                                    <Zap className="mr-2 h-4 w-4" />
                                                    Upgrade Plan

                                                </Button>
                                            </motion.div>
                                            {subscription.planDisplayName.toLowerCase() !== "free".toLowerCase() && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowCancelDialog(true)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isDevelopmentmode && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                try {
                                                    await handleAction({
                                                        type: "FREE",
                                                    });
                                                    toast.success("Successfully changed to Free plan");
                                                } catch (error) {
                                                    toast.error("Failed to change to Free plan");
                                                }
                                            }}
                                            disabled={isProcessing}
                                            className="text-xs px-2"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                "→ Free"
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </CardFooter>
                        )}
                    </Card>
                </motion.div>

                {/* Usage Stats */}
                {subscription && usage && (
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <UsageCard
                            subscription={subscription}
                            usage={usage}
                        />
                    </motion.div>
                )}
            </motion.div>

            {/* Recurring Status Card - Only show for non-free plans */}
            {subscription?.planDisplayName.toLowerCase() !== "free".toLowerCase() && isRecuring && (
                <motion.div>
                    <AnimatePresence>
                        {!hasActiveMethod && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>About Recurring Payments:</strong> To enable automatic recurring payments, you need to add a payment method first.
                                        This ensures your subscription continues uninterrupted without manual payments each month.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <RecurringStatusCard onOpenChange={setShowEnableDialog} />
                    </motion.div>
                </motion.div>
            )}

            {/* Payment History with Tabs */}
            <motion.div>
                <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Payment History</span>
                                <div className="flex gap-2">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant={activeTab === "payments" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveTab("payments")}
                                        >
                                            One-time Payments
                                        </Button>
                                    </motion.div>
                                    {isRecuring && (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                variant={activeTab === "recurring" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setActiveTab("recurring")}
                                            >
                                                Recurring History
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {activeTab === "payments" ? (
                                    <motion.div
                                        key="payments"
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                    >
                                        {paymentsLoading ? (
                                            <TableSkeleton />
                                        ) : payments.length > 0 ? (
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
                                                    {payments.map((payment, index) => (
                                                        <motion.tr
                                                            key={payment.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="hover:bg-gray-50"
                                                        >
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
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                    >
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
                                                                    </motion.div>
                                                                )}
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center py-8"
                                            >
                                                <p className="text-gray-600 mb-4">No payment history found</p>
                                                {!hasActiveMethod && subscription && subscription.planDisplayName.toLowerCase() !== "free" && (
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => router.push("/billing/payment-method")}
                                                        >
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            Add Payment Method
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                        {hasMore && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-4 text-center"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
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
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="recurring"
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                    >
                                        {cyclesLoading ? (
                                            <TableSkeleton />
                                        ) : cycles.length > 0 ? (
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
                                                    {cycles.map((cycle, index) => (
                                                        <motion.tr
                                                            key={cycle.cycleId}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="hover:bg-gray-50"
                                                        >
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
                                                        </motion.tr>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center py-8"
                                            >
                                                <p className="text-gray-600 mb-4">No recurring payment history found</p>
                                                {!hasActiveMethod && subscription && subscription.planDisplayName.toLowerCase() !== "free" && (
                                                    <div className="mt-4">
                                                        <p className="text-sm text-gray-500 mb-3">
                                                            Set up a payment method to enable automatic recurring payments
                                                        </p>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => router.push("/billing/payment-method")}
                                                            >
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Add Payment Method
                                                            </Button>
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                        {hasMoreCycles && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-4 text-center"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
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
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Cancel Subscription Dialog */}
            <AnimatePresence>
                {showCancelDialog && (
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <DialogContent asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Cancel Subscription</DialogTitle>
                                        <DialogDescription>
                                            We're sorry to see you go. Your subscription will remain active until the end of the current billing period.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="space-y-4 py-4"
                                    >
                                        <div>
                                            <Label>Why are you cancelling? (optional)</Label>
                                            <motion.select
                                                whileFocus={{ scale: 1.01 }}
                                                className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="too_expensive">Too expensive</option>
                                                <option value="not_using">Not using enough</option>
                                                <option value="missing_features">Missing features</option>
                                                <option value="switching_competitor">Switching to competitor</option>
                                                <option value="other">Other</option>
                                            </motion.select>
                                        </div>

                                        <div>
                                            <Label>Any feedback for us? (optional)</Label>
                                            <motion.div
                                                whileFocus={{ scale: 1.01 }}
                                            >
                                                <Textarea
                                                    value={cancelFeedback}
                                                    onChange={(e) => setCancelFeedback(e.target.value)}
                                                    placeholder="Let us know how we can improve..."
                                                    rows={4}
                                                    className="mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    <DialogFooter className="gap-2">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowCancelDialog(false)}
                                            >
                                                Keep Subscription
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
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
                                        </motion.div>
                                    </DialogFooter>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            <EnableRecurringDialog
                open={showEnableDialog}
                onOpenChange={setShowEnableDialog}
            />
        </motion.div>
    );
}