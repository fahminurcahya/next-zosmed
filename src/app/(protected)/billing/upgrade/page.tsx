"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    useSubscription,
    useUpgradePlans,
    useSubscriptionActions,
    useDiscountValidation,
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

export default function UpgradePlanPage() {
    const router = useRouter();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
    const { subscription, usage, isLoading: subLoading } = useSubscription();
    const { eligibility, isLoading: plansLoading } = useUpgradePlans();
    const { handleAction, isProcessing: actionProcessing } = useSubscriptionActions();
    const { validation, isValidating } = useDiscountValidation(
        discountCode,
        selectedPlanId,
        !!discountCode && !!selectedPlanId
    );

    // Queries
    const paymentMethodsQuery = api.billing.getPaymentMethods.useQuery();

    // Mutations
    const createInvoiceMutation = api.billing.createInvoice.useMutation({
        onSuccess: (data) => {
            // Show payment method selection if multiple methods available
            if (data.availableBanks?.length || data.availableEwallets?.length) {
                setShowPaymentDialog(true);
                sessionStorage.setItem('xendit_invoice', JSON.stringify(data));
            } else {
                // Redirect directly to Xendit payment page
                window.location.href = data.invoiceUrl;
            }
        },
        onError: (error) => {
            toast.error(error.message);
            setIsProcessing(false);
        },
    });

    const selectedPlan = eligibility.availablePlans.find(p => p.id === selectedPlanId);

    const finalPrice = useMemo(() => {
        if (!selectedPlan) return 0;

        const basePrice = selectedPlan.priceNumber;
        if (validation?.valid && validation.calculation) {
            return validation.calculation.finalAmount;
        }

        return basePrice;
    }, [selectedPlan, validation]);

    const xenditFees = useMemo(() => {
        return calculateXenditFees(finalPrice);
    }, [finalPrice]);

    const handleUpgrade = () => {
        if (!selectedPlanId) {
            toast.error("Please select a plan");
            return;
        }

        if (selectedPaymentMethods.length === 0) {
            // Show payment method selection dialog
            setShowPaymentDialog(true);
        } else {
            processPayment();
        }
    };

    const processPayment = async () => {
        if (!selectedPlanId || !subscription) return;

        setIsProcessing(true);

        try {
            // Create one-time invoice
            await createInvoiceMutation.mutateAsync({
                planId: selectedPlanId,
                discountCode: discountCode || undefined,
                paymentMethods: selectedPaymentMethods.length > 0 ? selectedPaymentMethods : undefined,
            });
        } catch (error) {
            setIsProcessing(false);
        }
    };

    const groupedPaymentMethods = useMemo(() => {
        if (!paymentMethodsQuery.data) return [];
        return groupPaymentMethods(paymentMethodsQuery.data as any);
    }, [paymentMethodsQuery.data]);

    if (subLoading || plansLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!eligibility.canUpgrade) {
        return (
            <div className="container max-w-4xl mx-auto p-6">
                <Card className="text-center py-12">
                    <CardContent>
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold mb-2">{eligibility.reason}</h2>
                        <Button onClick={() => router.push("/billing")} className="mt-4">
                            View Current Plan
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-2 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
                <p className="text-gray-600">
                    Unlock more features and grow your Instagram automation
                </p>
            </div>

            {/* Current Usage Alert */}
            {subscription && usage && (usage.accounts.nearLimit || usage.dm.nearLimit) && (
                <Alert className="mb-8" variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You're approaching your usage limits. Upgrading will give you more room to grow.
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Plan & Usage */}
            {subscription && usage && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                    <UsageCard subscription={subscription} usage={usage} />
                </div>
            )}

            {/* View Toggle */}
            <div className="flex justify-end mb-6">
                <Tabs value={comparisonMode ? "compare" : "cards"} onValueChange={(v) => setComparisonMode(v === "compare")}>
                    <TabsList>
                        <TabsTrigger value="cards">Card View</TabsTrigger>
                        <TabsTrigger value="compare">Compare Plans</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Plans Display */}
            {comparisonMode ? (
                <PlanComparisonTable
                    plans={eligibility.availablePlans}
                    selectedPlanId={selectedPlanId}
                    onSelectPlan={setSelectedPlanId}
                    currentPlanId={eligibility.currentPlan?.id}
                    className="mb-6"
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {eligibility.availablePlans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isSelected={selectedPlanId === plan.id}
                            onSelect={() => setSelectedPlanId(plan.id)}
                            showComparison
                            comparisonPrice={subscription?.price || 0}
                        />
                    ))}
                </div>
            )}

            {/* Discount & Order Summary Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Discount Code */}
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

                {/* Order Summary */}
                <Card className={cn("transition-all", selectedPlan ? "ring-2 ring-blue-500" : "opacity-60")}>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedPlan ? (
                            <div className="space-y-4">
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

                                    {validation?.valid && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({validation.discount?.value}%)</span>
                                            <span>
                                                -{formatXenditCurrency(validation.calculation?.discountAmount || 0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Payment Processing Fee</span>
                                        <span>{formatXenditCurrency(xenditFees.totalFee)}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Amount</span>
                                        <span>{formatXenditCurrency(finalPrice + xenditFees.totalFee)}</span>
                                    </div>
                                </div>



                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        Your new plan will start immediately. Unused time from your current plan
                                        will be credited as a proration discount.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Select a plan to see order summary</p>
                            </div>
                        )}
                    </CardContent>
                    {selectedPlan && (
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleUpgrade}
                                disabled={isProcessing || actionProcessing}
                            >
                                {isProcessing || actionProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Continue to Payment
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Payment Method Selection Dialog */}
            <PaymentMethodDialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
                plan={selectedPlan}
                finalPrice={finalPrice + xenditFees.totalFee}
                fees={xenditFees}
                discountApplied={validation?.valid}
                discountDescription={validation?.discount?.description}
                paymentMethods={groupedPaymentMethods}
                selectedMethods={selectedPaymentMethods}
                onSelectMethods={setSelectedPaymentMethods}
                onConfirm={processPayment}
                isProcessing={isProcessing}
            />

            {/* FAQ Section */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What happens to my current subscription?</AccordionTrigger>
                            <AccordionContent>
                                Your new plan takes effect immediately after payment. Any unused time from your
                                current subscription will be calculated as a proration credit and applied to your
                                new subscription.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                            <AccordionContent>
                                We accept various payment methods through Xendit:
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Bank Transfer (BCA, BNI, BRI, Mandiri, etc)</li>
                                    <li>• E-Wallets (OVO, DANA, ShopeePay, LinkAja)</li>
                                    <li>• Retail Outlets (Alfamart, Indomaret)</li>
                                    <li>• QRIS (scan QR code with any e-wallet)</li>
                                    <li>• Credit/Debit Cards</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Are there any additional fees?</AccordionTrigger>
                            <AccordionContent>
                                Yes, there's a small payment processing fee that varies by payment method:
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Admin fee: Rp 5,000</li>
                                    <li>• Credit card: 2.9% of transaction</li>
                                    <li>• E-wallet: 1.5% of transaction</li>
                                    <li>• Bank transfer: Rp 4,000</li>
                                    <li>• QRIS: 0.7% of transaction</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can I enable auto-renewal?</AccordionTrigger>
                            <AccordionContent>
                                Yes! When you check the "Enable auto-renewal" option, we'll save your payment
                                method securely with Xendit. Your subscription will automatically renew each month
                                without you having to manually pay. You can cancel auto-renewal anytime from your
                                billing settings.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

// Payment Method Dialog Component
interface PaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: any;
    finalPrice: number;
    fees: any;
    discountApplied?: boolean;
    discountDescription?: string;
    paymentMethods: any[];
    selectedMethods: string[];
    onSelectMethods: (methods: string[]) => void;
    onConfirm: () => void;
    isProcessing: boolean;
}

function PaymentMethodDialog({
    open,
    onOpenChange,
    plan,
    finalPrice,
    fees,
    discountApplied,
    discountDescription,
    paymentMethods,
    selectedMethods,
    onSelectMethods,
    onConfirm,
    isProcessing,
}: PaymentMethodDialogProps) {
    const [selectedTab, setSelectedTab] = useState("recommended");

    const recommendedMethods = ["BCA", "OVO", "QRIS"];

    const handleMethodToggle = (method: string) => {
        if (selectedMethods.includes(method)) {
            onSelectMethods(selectedMethods.filter(m => m !== method));
        } else {
            onSelectMethods([...selectedMethods, method]);
        }
    };

    const handleQuickSelect = (methods: string[]) => {
        onSelectMethods(methods);
    };


    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) {
                    onSelectMethods([]);
                }
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose Payment Methods</DialogTitle>
                    <DialogDescription>
                        Select one or more payment methods for your invoice. Customers can choose
                        their preferred method when paying.
                    </DialogDescription>
                </DialogHeader>

                {plan && (
                    <div className="space-y-6">
                        {/* Plan Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{plan.displayName} Plan</h4>
                            <div className="flex justify-between items-center">
                                <span>Total Amount:</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{formatXenditCurrency(finalPrice)}</p>
                                    {discountApplied && (
                                        <p className="text-sm text-green-600">{discountDescription}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Includes {formatXenditCurrency(fees.totalFee)} processing fee
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Selection */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(recommendedMethods)}
                            >
                                Select Recommended
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(["BCA", "BNI", "BRI", "MANDIRI"])}
                            >
                                All Major Banks
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickSelect(["OVO", "DANA", "SHOPEEPAY", "LINKAJA"])}
                            >
                                All E-Wallets
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSelectMethods([])}
                            >
                                Clear All
                            </Button>
                        </div>

                        {/* Payment Methods Tabs */}
                        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                                <TabsTrigger value="all">All Methods</TabsTrigger>
                            </TabsList>

                            <TabsContent value="recommended" className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Most popular payment methods with instant confirmation
                                </p>
                                <div className="grid gap-3">
                                    {recommendedMethods.map(method => (
                                        <PaymentMethodItem
                                            key={method}
                                            method={method}
                                            selected={selectedMethods.includes(method)}
                                            onToggle={() => handleMethodToggle(method)}
                                            recommended
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="all" className="space-y-4">
                                {paymentMethods.map(group => (
                                    <div key={group.type}>
                                        <h4 className="font-medium mb-3">{group.displayName}</h4>
                                        <div className="grid gap-2">
                                            {group.methods.map((method: any) => (
                                                <PaymentMethodItem
                                                    key={method.info.channelCode}
                                                    method={method.info.channelCode}
                                                    selected={selectedMethods.includes(method.info.channelCode)}
                                                    onToggle={() => handleMethodToggle(method.info.channelCode)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>

                        {/* Selected Methods Summary */}
                        {selectedMethods.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm font-medium mb-2">
                                    Selected Payment Methods ({selectedMethods.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMethods.map(method => (
                                        <Badge key={method} variant="secondary">
                                            {XENDIT_CHANNEL_NAMES[method as XenditChannelCode] || method}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Note */}
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                All payments are processed securely by Xendit. We never store your
                                payment details on our servers.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isProcessing || selectedMethods.length === 0}
                        className="min-w-[120px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Create Invoice
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Payment Method Item Component
interface PaymentMethodItemProps {
    method: string;
    selected: boolean;
    onToggle: () => void;
    recommended?: boolean;
    supportsRecurring?: boolean;
}

function PaymentMethodItem({
    method,
    selected,
    onToggle,
    recommended,
    supportsRecurring
}: PaymentMethodItemProps) {
    const name = XENDIT_CHANNEL_NAMES[method as XenditChannelCode] || method;
    const logo = XENDIT_CHANNEL_LOGOS[method as XenditChannelCode];

    const getIcon = () => {
        if (method.includes("CARD")) return <CreditCard className="h-5 w-5" />;
        if (["OVO", "DANA", "SHOPEEPAY", "LINKAJA", "GCASH", "GRABPAY"].includes(method)) return <Wallet className="h-5 w-5" />;
        if (["BCA", "BNI", "BRI", "MANDIRI", "PERMATA", "BSI", "BJB", "CIMB"].includes(method)) return <Building className="h-5 w-5" />;
        if (["ALFAMART", "INDOMARET", "7ELEVEN"].includes(method)) return <Store className="h-5 w-5" />;
        if (method === "QRIS") return <QrCode className="h-5 w-5" />;
        return <CreditCard className="h-5 w-5" />;
    };

    return (
        <label
            className={cn(
                "flex items-center p-3 rounded-lg border cursor-pointer transition-all",
                selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            )}
        >
            <Checkbox
                checked={selected}
                onCheckedChange={onToggle}
                className="mr-3"
            />
            <div className="flex items-center flex-1">
                <div className="mr-3 text-gray-600">
                    {logo ? (
                        <img src={logo} alt={name} className="h-8 w-8 object-contain" />
                    ) : (
                        getIcon()
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{name}</p>
                    {recommended && (
                        <p className="text-xs text-gray-500">Recommended • Instant confirmation</p>
                    )}
                    {supportsRecurring && (
                        <p className="text-xs text-green-600">Supports auto-renewal</p>
                    )}
                </div>
            </div>
        </label>
    );
}