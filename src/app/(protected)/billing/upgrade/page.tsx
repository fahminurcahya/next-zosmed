"use client";

import { useState, useMemo } from "react";
import { useRouter } from 'nextjs-toploader/app';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Check,
    X,
    Zap,
    Loader2,
    CreditCard,
    Tag,
    ArrowRight,
    Info,
    Shield,
    Wallet,
    Building,
    QrCode,
    TrendingUp,
    ChevronRight,
    AlertCircle,
    Store,
    RefreshCw,
    CheckCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    useSubscription,
    useUpgradePlans,
    useSubscriptionActions,
    useDiscountValidation,
    useRecurringStatus,
    useRecurringPreference,
    useRecurringEligibility,
} from "@/hooks/billing-hook";
import {
    groupPaymentMethods,
    calculateXenditFees,
    formatXenditCurrency,
    XENDIT_CHANNEL_NAMES,
    XENDIT_CHANNEL_LOGOS,
} from "@/lib/xendit";
import type { XenditChannelCode } from "@/types/xendit.type";
import { DiscountInput, PlanCard, PlanComparisonTable, UsageCard } from "../_components";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PaymentMethodSelection, { type PaymentMethodSelectionResult } from "../_components/payment-method-selection";

// Default animation variants
const containerVariants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const slideVariants = {
    hidden: {
        opacity: 0,
        x: -20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

// Skeleton Components
const HeaderSkeleton = () => (
    <motion.div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
    </motion.div>
);

const CurrentPlanSkeleton = () => (
    <motion.div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-50">
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardContent>
        </Card>

        {/* Usage Card Skeleton */}
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="text-right">
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                ))}
                <Skeleton className="h-4 w-48" />
            </CardContent>
        </Card>
    </motion.div>
);

const ViewToggleSkeleton = () => (
    <motion.div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-48" />
    </motion.div>
);

const PlanCardsSkeleton = () => (
    <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
            <Card key={i} className="relative">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <Skeleton className="h-6 w-24 mb-2" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </motion.div>
);

const OrderSummarySkeleton = () => (
    <motion.div className="grid lg:grid-cols-2 gap-6">
        {/* Discount Code Card Skeleton */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-48" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </CardContent>
        </Card>

        {/* Order Summary Card Skeleton */}
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-44" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>

                        <div className="h-px bg-gray-200" />

                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    </motion.div>
);

const FAQSkeleton = () => (
    <motion.div>
        <Card className="mt-8">
            <CardHeader>
                <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-80" />
                                <Skeleton className="h-4 w-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

const FullPageSkeleton = () => (
    <motion.div
        className="container mx-auto p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
    >
        <HeaderSkeleton />
        <CurrentPlanSkeleton />
        <ViewToggleSkeleton />
        <PlanCardsSkeleton />
        <OrderSummarySkeleton />
        <FAQSkeleton />
    </motion.div>
);

export default function UpgradePlanPage() {
    const isRecurring = process.env.CONFIG_RECURRING || false

    const router = useRouter();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [comparisonMode, setComparisonMode] = useState(false);
    const { subscription, usage, isLoading: subLoading } = useSubscription();
    const { eligibility, isLoading: plansLoading } = useUpgradePlans();
    const { handleAction, handleRecurringToggle, isProcessing } = useSubscriptionActions();
    const { validation, isValidating } = useDiscountValidation(
        discountCode,
        selectedPlanId,
        !!discountCode && !!selectedPlanId
    );
    const { recurringStatus, hasActiveRecurring } = useRecurringStatus();
    const { preferRecurring, updatePreference } = useRecurringPreference();
    const recurringEligibility = useRecurringEligibility();
    const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodSelectionResult | null>(null);

    const selectedPlan = useMemo(() => {
        if (!selectedPlanId || !eligibility) return null;
        return eligibility.availablePlans.find(p => p.id === selectedPlanId);
    }, [selectedPlanId, eligibility]);

    const finalPrice = useMemo(() => {
        if (!selectedPlan) return 0;
        const basePrice = selectedPlan.priceNumber;
        if (validation?.valid && validation.calculation) {
            return validation.calculation.finalAmount;
        }
        return basePrice;
    }, [selectedPlan, validation]);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlanId(planId);
    };

    const handleUpgrade = async () => {
        if (!selectedPlanId) {
            toast.error("Please select a plan");
            return;
        }
        setShowPaymentMethodDialog(true);
    };

    const handlePaymentMethodSelect = async (selection: PaymentMethodSelectionResult) => {
        setSelectedPaymentMethod(selection);

        try {
            // Store recurring preference
            updatePreference(preferRecurring);

            // Store payment method selection in sessionStorage for the billing hook to use
            sessionStorage.setItem('selectedPaymentMethod', JSON.stringify(selection));

            // Use existing billing flow
            await handleAction({
                type: "UPGRADE",
                planId: selectedPlanId!,
                discountCode: validation?.valid ? discountCode : undefined,
            });
        } catch (error) {
            console.error("Upgrade failed:", error);
        } finally {
            setShowPaymentMethodDialog(false);
        }
    };

    const xenditFees = useMemo(() => {
        return calculateXenditFees(finalPrice);
    }, [finalPrice]);

    if (subLoading || plansLoading) {
        return <FullPageSkeleton />;
    }

    if (!eligibility?.canUpgrade) {
        return (
            <motion.div
                className="container mx-auto p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {eligibility?.reason || "No upgrade plans available"}
                        </AlertDescription>
                    </Alert>
                </motion.div>
                <motion.div

                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/billing")}
                    >
                        Back to Billing
                    </Button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container mx-auto p-6 space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
                <p className="text-gray-600">
                    Choose a plan that fits your automation needs
                </p>
            </motion.div>

            {/* Current Usage Alert */}
            <AnimatePresence>
                {subscription && usage && (usage.accounts.nearLimit || usage.dm.nearLimit) && (
                    <motion.div

                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <Alert variant="warning">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You're approaching your usage limits. Upgrading will give you more room to grow.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Plan & Usage */}
            {subscription && usage && (
                <motion.div

                    className="grid md:grid-cols-2 gap-6 mb-8"
                >
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <Card className="bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-lg">Current Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-2xl font-bold">{subscription.planDisplayName}</h3>
                                        <p className="text-gray-600">
                                            {formatXenditCurrency(subscription.price)} / month
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>• {subscription.maxAccounts} Instagram accounts</p>
                                        <p>• {subscription.maxDMPerMonth.toLocaleString()} DM/month</p>
                                        {subscription.hasAIReply && (
                                            <p>• {subscription.maxAIReplyPerMonth?.toLocaleString()} AI replies</p>
                                        )}
                                    </div>
                                    {subscription.daysRemaining !== null && (
                                        <Badge variant="secondary">
                                            {subscription.daysRemaining} days remaining
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <UsageCard subscription={subscription} usage={usage} />
                    </motion.div>
                </motion.div>
            )}

            {/* View Toggle */}
            <motion.div className="flex justify-end mb-6">
                <Tabs value={comparisonMode ? "compare" : "cards"} onValueChange={(v) => setComparisonMode(v === "compare")}>
                    <TabsList>
                        <TabsTrigger value="cards">Card View</TabsTrigger>
                        <TabsTrigger value="compare">Compare Plans</TabsTrigger>
                    </TabsList>
                </Tabs>
            </motion.div>

            {/* Plans Display */}
            <motion.div>
                <AnimatePresence mode="wait">
                    {comparisonMode ? (
                        <motion.div
                            key="comparison"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <PlanComparisonTable
                                plans={eligibility.availablePlans}
                                selectedPlanId={selectedPlanId}
                                onSelectPlan={setSelectedPlanId}
                                currentPlanId={eligibility.currentPlan?.id}
                                className="mb-6"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cards"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                        >
                            {eligibility.availablePlans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -8 }}
                                >
                                    <PlanCard
                                        plan={plan}
                                        isSelected={selectedPlanId === plan.id}
                                        onSelect={() => setSelectedPlanId(plan.id)}
                                        showComparison
                                        comparisonPrice={subscription?.price || 0}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Order Summary */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {isRecurring && (
                            <motion.div
                                whileHover={{ y: -2 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <RefreshCw className="h-5 w-5" />
                                            Auto-Renewal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Auto-Renewal Toggle */}
                                        {recurringEligibility.canEnableRecurring && (
                                            <>
                                                <motion.div
                                                    className="p-4 border rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <Label
                                                                htmlFor="auto-renewal"
                                                                className="text-base font-medium flex items-center gap-2"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                                Enable Auto-Renewal
                                                            </Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Automatically renew your subscription every {selectedPlan.period.toLowerCase()}
                                                            </p>
                                                        </div>
                                                        <motion.div
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Switch
                                                                id="auto-renewal"
                                                                checked={preferRecurring}
                                                                onCheckedChange={updatePreference}
                                                                disabled={isProcessing}
                                                            />
                                                        </motion.div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {preferRecurring && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <Alert className="mt-3">
                                                                    <Info className="h-4 w-4" />
                                                                    <AlertDescription>
                                                                        You'll be redirected to securely link your payment method with Xendit.
                                                                        You can cancel auto-renewal anytime from your billing dashboard.
                                                                    </AlertDescription>
                                                                </Alert>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                                <Separator />
                                            </>
                                        )}

                                        <motion.div>
                                            {recurringEligibility.reason}
                                        </motion.div>

                                        {/* Already has recurring */}
                                        <AnimatePresence>
                                            {hasActiveRecurring && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Alert>
                                                        <CheckCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            You already have auto-renewal enabled. It will continue with your new plan.
                                                        </AlertDescription>
                                                    </Alert>
                                                    <Separator />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Discount & Order Summary Section */}
                        <motion.div

                            className="grid lg:grid-cols-2 gap-6"
                        >
                            {/* Discount Code */}
                            <motion.div
                                whileHover={{ y: -2 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Tag className="h-5 w-5" />
                                            Have a Discount Code?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <DiscountInput
                                            value={discountCode}
                                            onChange={setDiscountCode}
                                            validation={validation}
                                            isValidating={isValidating}
                                            disabled={!selectedPlan}
                                        />
                                        {!selectedPlan && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Select a plan to apply discount code
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Order Summary */}
                            <motion.div
                                whileHover={{ y: -2 }}
                            >
                                <Card className={cn("transition-all", selectedPlan ? "ring-2 ring-blue-500" : "opacity-60")}>
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedPlan ? (
                                            <motion.div

                                                className="space-y-4"
                                            >
                                                <div>
                                                    <h4 className="font-semibold mb-2">{selectedPlan.displayName} Plan</h4>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>• {selectedPlan.limits.maxAccounts} Instagram accounts</p>
                                                        <p>• {selectedPlan.limits.maxDMPerMonth.toLocaleString()} DM/month</p>
                                                        {selectedPlan.limits.maxAIReplyPerMonth > 0 && (
                                                            <p>• {selectedPlan.limits.maxAIReplyPerMonth.toLocaleString()} AI replies</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Plan Price</span>
                                                        <span>{formatXenditCurrency(selectedPlan.priceNumber)}</span>
                                                    </div>

                                                    <AnimatePresence>
                                                        {validation?.valid && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="flex justify-between text-green-600"
                                                            >
                                                                <span>Discount ({validation.discount?.value}%)</span>
                                                                <span>
                                                                    -{formatXenditCurrency(validation.calculation?.discountAmount || 0)}
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Payment Processing Fee</span>
                                                        <span>{formatXenditCurrency(xenditFees.totalFee)}</span>
                                                    </div>

                                                    <Separator />

                                                    <div className="flex justify-between font-bold text-lg">
                                                        <span>Total Amount</span>
                                                        <span>{formatXenditCurrency(xenditFees.totalAmount)}</span>
                                                    </div>
                                                </div>

                                                <Alert>
                                                    <Info className="h-4 w-4" />
                                                    <AlertDescription className="text-sm">
                                                        Your new plan will start immediately. Unused time from your current plan
                                                        will be credited as a proration discount.
                                                    </AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>Select a plan to see order summary</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    {selectedPlan && (
                                        <CardFooter>
                                            <motion.div
                                                className="w-full"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    className="w-full"
                                                    size="lg"
                                                    onClick={handleUpgrade}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Select Payment Method
                                                            <ArrowRight className="ml-2 h-5 w-5" />
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </CardFooter>
                                    )}
                                </Card>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Method Selection Dialog */}
            <PaymentMethodSelection
                isOpen={showPaymentMethodDialog}
                onClose={() => setShowPaymentMethodDialog(false)}
                onSelect={handlePaymentMethodSelect}
                isRecurring={preferRecurring}
                amount={xenditFees.totalAmount}
                planName={selectedPlan?.code as any}
            />

            {/* FAQ Section */}
            <motion.div>
                <motion.div
                    whileHover={{ y: -2 }}
                >
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What happens to my current subscription?</AccordionTrigger>
                                    <AccordionContent>
                                        When your payment is successful, your new plan takes effect immediately.
                                        <span className="block mt-1">
                                            Any usage limits (quota) will be **reset according to the new plan**, and previously used quota will also follow the new plan's limits.
                                        </span>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                                    <AccordionContent>
                                        We accept various payment methods through Xendit:
                                        <ul className="mt-2 space-y-1 text-sm">
                                            <li>• Bank Transfer (BCA, BNI, BRI, Mandiri, etc)</li>
                                            <li>• E-Wallets (OVO, DANA, ShopeePay, LinkAja)</li>
                                            <li>• QRIS (scan QR code with any e-wallet)</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is Auto-Renewal?</AccordionTrigger>
                                    <AccordionContent>
                                        Auto-renewal allows your subscription to automatically renew each billing cycle without manual payment.
                                        <span className="font-semibold text-red-500 block mt-2">
                                            Currently, auto-renewal is not yet available. You will need to manually renew your subscription each period.
                                        </span>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Can I cancel Auto-Renewal?</AccordionTrigger>
                                    <AccordionContent>
                                        Since auto-renewal is currently unavailable, there is no need to cancel.
                                        Once auto-renewal becomes available, you will be able to pause or cancel it anytime from your billing dashboard.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger>Can I enable auto-renewal?</AccordionTrigger>
                                    <AccordionContent>
                                        Auto-renewal is currently <span className="font-semibold">not available</span>.
                                        You can manually renew your subscription each billing cycle.
                                        When you successfully make a payment, your quota and usage limits will be **reset according to your plan**.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}