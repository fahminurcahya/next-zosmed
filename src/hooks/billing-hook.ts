// src/hooks/use-billing.ts

import { useMemo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import type {
    FormattedPlan,
    FormattedSubscription,
    PlanUpgradeEligibility,
    SubscriptionAction,
    PaymentHistoryFilter,
    DiscountValidation,
    UsageStatsResponse,
} from "@/types/billing.type";
import {
    formatPlan,
    formatSubscription,
    formatPayment,
    canUpgradeToPlan,
    calculateUsagePercentage,
    isUsageNearLimit,
} from "@/lib/billing";
import { toast } from "sonner";
import { addDays } from "date-fns";

export interface RecurringStatus {
    id: string;
    status: 'ACTIVE' | 'PAUSED' | 'INACTIVE' | 'PENDING_ACTIVATION';
    plan: any;
    amount: number;
    discountAmount?: number;
    paymentMethod?: string;
    activatedAt?: Date;
    nextChargeDate?: Date;
}

export interface RecurringAction {
    type: 'ENABLE' | 'DISABLE' | 'PAUSE' | 'RESUME';
    planId?: string;
}

/**
 * Hook for current subscription and usage
 */
export function useSubscription() {
    const query = api.billing.getCurrentSubscription.useQuery(undefined, {
        refetchInterval: 30000, // Refetch every 30 seconds for real-time usage
    });

    const formatted = useMemo(() => {
        if (!query.data) return null;
        return formatSubscription(query.data);
    }, [query.data]);

    const usage = useMemo(() => {
        if (!formatted || !query.data) return null;

        const accountsUsed = query.data?.user?.integration?.length || 0;
        const dmUsed = formatted.currentDMCount;
        const aiUsed = formatted.currentAICount;

        return {
            accounts: {
                used: accountsUsed,
                limit: formatted.maxAccounts,
                percentage: calculateUsagePercentage(accountsUsed, formatted.maxAccounts),
                nearLimit: isUsageNearLimit(accountsUsed, formatted.maxAccounts, 80),
                remaining: Math.max(0, formatted.maxAccounts - accountsUsed),
            },
            dm: {
                used: dmUsed,
                limit: formatted.maxDMPerMonth,
                percentage: calculateUsagePercentage(dmUsed, formatted.maxDMPerMonth),
                nearLimit: isUsageNearLimit(dmUsed, formatted.maxDMPerMonth, 80),
                remaining: Math.max(0, formatted.maxDMPerMonth - dmUsed),
                dailyAverage: Math.floor(dmUsed / new Date().getDate()),
            },
            ai: {
                used: aiUsed,
                limit: formatted.maxAIReplyPerMonth,
                percentage: calculateUsagePercentage(aiUsed, formatted.maxAIReplyPerMonth),
                nearLimit: isUsageNearLimit(aiUsed, formatted.maxAIReplyPerMonth, 80),
                remaining: Math.max(0, formatted.maxAIReplyPerMonth - aiUsed),
            },
            resetDate: formatted.dmResetDate,
            daysUntilReset: Math.max(0, Math.ceil(
                (new Date(formatted.dmResetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )),
        };
    }, [formatted, query.data]);

    const isLimited = useMemo(() => {
        if (!usage) return false;
        return usage.dm.percentage >= 100 ||
            usage.ai.percentage >= 100;
    }, [usage]);

    return {
        subscription: formatted,
        usage,
        isLimited,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for recurring subscription status
 */
export function useRecurringStatus() {
    const query = api.billing.getRecurringStatus.useQuery();
    const hasActiveQuery = api.billing.hasActiveRecurring.useQuery();

    return {
        recurringStatus: query.data,
        hasActiveRecurring: hasActiveQuery.data?.hasActive || false,
        isLoading: query.isLoading || hasActiveQuery.isLoading,
        isError: query.isError || hasActiveQuery.isError,
        error: query.error || hasActiveQuery.error,
        refetch: () => {
            query.refetch();
            hasActiveQuery.refetch();
        }
    };
}

/**
 * Hook for recurring history
 */
export function useRecurringHistory(limit = 10) {
    const [page, setPage] = useState(0);

    const query = api.billing.getRecurringHistory.useQuery({
        limit,
        offset: page * limit,
    });

    const loadMore = useCallback(() => {
        if (query.data?.hasMore) {
            setPage(prev => prev + 1);
        }
    }, [query.data?.hasMore]);

    const refresh = useCallback(() => {
        setPage(0);
        query.refetch();
    }, [query]);

    return {
        cycles: query.data?.cycles || [],
        total: query.data?.total || 0,
        hasMore: query.data?.hasMore || false,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        page,
        loadMore,
        refresh,
    };
}

/**
 * Hook for all available plans
 */
export function usePlans() {
    const query = api.plans.getActivePlans.useQuery();

    const formatted = useMemo(() => {
        if (!query.data) return [];
        // Pastikan setiap item memiliki properti yang dibutuhkan oleh formatPlan
        return query.data.map((plan: any) => ({
            ...plan,
            // Tambahkan properti default jika tidak ada, agar sesuai dengan tipe yang diharapkan formatPlan
            createdAt: plan.createdAt ?? new Date(),
            updatedAt: plan.updatedAt ?? new Date(),
            description: plan.description ?? "",
            isActive: plan.isActive ?? true,
            maxAccounts: plan.maxAccounts ?? 0,
            maxDMPerMonth: plan.maxDMPerMonth ?? 0,
            maxAIReplyPerMonth: plan.maxAIReplyPerMonth ?? 0,
            sortOrder: plan.sortOrder ?? 0,
            // Properti lain yang mungkin dibutuhkan oleh formatPlan bisa ditambahkan di sini
        })).map(formatPlan);
    }, [query.data]);

    const byCode = useMemo(() => {
        const map = new Map<string, FormattedPlan>();
        formatted.forEach(plan => {
            map.set(plan.code, plan);
        });
        return map;
    }, [formatted]);

    const getRecommendedPlan = useCallback((currentUsage?: number) => {
        if (!formatted.length) return null;

        // Find the cheapest plan that fits the usage
        const suitable = formatted
            .filter(plan => !currentUsage || plan.limits.maxDMPerMonth > currentUsage)
            .sort((a, b) => a.priceNumber - b.priceNumber);

        return suitable[0] || formatted[formatted.length - 1];
    }, [formatted]);

    return {
        plans: formatted,
        byCode,
        getRecommendedPlan,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for upgrade eligibility and plans
 */
export function useUpgradePlans() {
    const currentSubQuery = api.billing.getCurrentSubscription.useQuery();
    const plansQuery = api.billing.getUpgradePlans.useQuery();

    const eligibility = useMemo((): PlanUpgradeEligibility => {
        if (!currentSubQuery.data || !plansQuery.data) {
            return {
                canUpgrade: false,
                availablePlans: [],
                reason: "Loading subscription data...",
            };
        }

        const currentPlan = currentSubQuery.data.pricingPlan;
        if (!currentPlan) {
            return {
                canUpgrade: true,
                availablePlans: plansQuery.data.map(formatPlan),
            };
        }

        const formattedCurrent = formatPlan(currentPlan);
        const availablePlans = plansQuery.data
            .map(formatPlan)
            .filter(plan => {
                const { canUpgrade } = canUpgradeToPlan(
                    { price: currentPlan.price, name: currentPlan.name },
                    { price: plan.priceNumber, name: plan.code }
                );
                return canUpgrade;
            });

        return {
            canUpgrade: availablePlans.length > 0,
            availablePlans,
            currentPlan: formattedCurrent,
            reason: availablePlans.length === 0
                ? "You're already on the highest available plan"
                : undefined,
        };
    }, [currentSubQuery.data, plansQuery.data]);

    return {
        eligibility,
        isLoading: currentSubQuery.isLoading || plansQuery.isLoading,
        isError: currentSubQuery.isError || plansQuery.isError,
        error: currentSubQuery.error || plansQuery.error,
    };
}

/**
 * Hook for subscription actions (upgrade, cancel, resume)
 */
export function useSubscriptionActions() {
    const router = useRouter();
    const utils = api.useUtils();
    const [isEnablingRecurring, setIsEnablingRecurring] = useState(false);

    const createInvoice = api.billing.createInvoice.useMutation({
        onSuccess: (data) => {
            if (data.type === 'recurring') {
                sessionStorage.setItem('xendit_recurring', JSON.stringify(data));
                if (data.activationUrl) {
                    window.location.href = data.activationUrl;
                } else {
                    toast.error("Failed to get activation URL");
                }
            } else {
                sessionStorage.setItem('xendit_invoice', JSON.stringify(data));
                if ('invoiceUrl' in data && data.invoiceUrl) {
                    window.location.href = data.invoiceUrl;
                } else {
                    toast.error("Failed to get payment URL");
                }
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create payment");
            setIsEnablingRecurring(false);
        },
    });


    const cancel = api.billing.cancelSubscription.useMutation({
        onSuccess: (data) => {
            toast.success(
                data.endDate
                    ? `Subscription will end on ${new Date(data.endDate).toLocaleDateString('id-ID')}`
                    : "Subscription cancelled successfully"
            );
            utils.billing.getCurrentSubscription.invalidate();
            utils.billing.getRecurringStatus.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel subscription");
        },
    });


    const resume = api.billing.resumeSubscription.useMutation({
        onSuccess: () => {
            toast.success("Subscription resumed successfully");
            utils.billing.getCurrentSubscription.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to resume subscription");
        },
    });

    const pauseRecurring = api.billing.pauseRecurring.useMutation({
        onSuccess: (data) => {
            toast.success(data.message || "Auto-renewal paused successfully");
            utils.billing.getRecurringStatus.invalidate();
            utils.billing.hasActiveRecurring.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to pause auto-renewal");
        },
    });

    const resumeRecurring = api.billing.resumeRecurring.useMutation({
        onSuccess: (data) => {
            if (data.activationUrl) {
                toast.success("Redirecting to complete setup...");
                window.location.href = data.activationUrl;
            } else {
                toast.success(data.message || "Auto-renewal resumed successfully");
            }
            utils.billing.getRecurringStatus.invalidate();
            utils.billing.hasActiveRecurring.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to resume auto-renewal");
        },
    });

    const handleAction = useCallback(async (action: SubscriptionAction | RecurringAction) => {
        switch (action.type) {
            case "UPGRADE":
                const upgradeAction = action as SubscriptionAction & { type: "UPGRADE" };
                const enableRecurring = localStorage.getItem('preferRecurring') === 'true';
                setIsEnablingRecurring(enableRecurring);

                return createInvoice.mutateAsync({
                    planId: upgradeAction.planId,
                    discountCode: upgradeAction.discountCode,
                    enableRecurring,
                });
            case "CANCEL":
                return cancel.mutateAsync({
                    reason: action.reason,
                    feedback: action.feedback,
                });

            case "RESUME":
                return resume.mutateAsync();
            case "ENABLE":
                const enableAction = action as RecurringAction & { type: "ENABLE" };
                if (enableAction.planId) {
                    setIsEnablingRecurring(true);
                    return createInvoice.mutateAsync({
                        planId: enableAction.planId,
                        enableRecurring: true,
                        isReplace: true
                    });
                }
                break;

            case "DISABLE":
            case "PAUSE":
                return pauseRecurring.mutateAsync();
        }
    }, [createInvoice, cancel, resume, pauseRecurring, resumeRecurring]);

    const handleRecurringToggle = useCallback(async (enabled: boolean, planId?: string) => {
        if (enabled && planId) {
            return handleAction({ type: "ENABLE", planId });
        } else if (!enabled) {
            return handleAction({ type: "PAUSE" });
        }
    }, [handleAction]);

    return {
        handleAction,
        handleRecurringToggle,
        createInvoice: createInvoice.mutateAsync,
        cancel: cancel.mutateAsync,
        resume: resume.mutateAsync,
        pauseRecurring: pauseRecurring.mutateAsync,
        resumeRecurring: resumeRecurring.mutateAsync,
        isProcessing:
            createInvoice.isPending ||
            cancel.isPending ||
            resume.isPending ||
            pauseRecurring.isPending ||
            resumeRecurring.isPending ||
            isEnablingRecurring,
    };
}

/**
 * Hook for checking recurring eligibility
 */
export function useRecurringEligibility() {
    const { subscription } = useSubscription();
    const { recurringStatus } = useRecurringStatus();

    const eligibility = useMemo(() => {
        if (!subscription) {
            return {
                canEnableRecurring: false,
                reason: "No active subscription",
            };
        }
        if (subscription.plan === "FREE") {
            return {
                canEnableRecurring: false,
                reason: "Recurring not available for free plan",
            };
        }
        if (recurringStatus?.status === "ACTIVE") {
            return {
                canEnableRecurring: false,
                reason: "Recurring is already active",
                isActive: true,
            };
        }
        if (recurringStatus?.status === "PENDING_ACTIVATION") {
            return {
                canEnableRecurring: false,
                reason: "Recurring activation is pending",
                isPending: true,
            };
        }
        return {
            canEnableRecurring: true,
            reason: null,
        };
    }, [subscription, recurringStatus]);

    return eligibility;
}


/**
 * Hook for payment history
 */
export function usePaymentHistory(filter?: PaymentHistoryFilter) {
    const [page, setPage] = useState(0);
    const limit = filter?.limit || 10;

    const query = api.billing.getPaymentHistory.useQuery({
        limit,
        offset: page * limit,
    });

    const formatted = useMemo(() => {
        if (!query.data) return [];
        return query.data.payments.map(formatPayment);
    }, [query.data]);

    const stats = useMemo(() => {
        if (!formatted.length) return null;

        const total = formatted.reduce((sum, p) => sum + p.amount, 0);
        const successful = formatted.filter(p => p.status === "SUCCESS").length;
        const pending = formatted.filter(p => p.status === "PENDING").length;
        const failed = formatted.filter(p => p.status === "FAILED" || p.status === "EXPIRED").length;

        return {
            totalAmount: total,
            count: formatted.length,
            successful,
            pending,
            failed,
            averageAmount: total / formatted.length,
            successRate: (successful / formatted.length) * 100,
        };
    }, [formatted]);

    const loadMore = useCallback(() => {
        if (query.data?.hasMore) {
            setPage(prev => prev + 1);
        }
    }, [query.data?.hasMore]);

    const refresh = useCallback(() => {
        setPage(0);
        query.refetch();
    }, [query]);

    return {
        payments: formatted,
        stats,
        hasMore: query.data?.hasMore || false,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        page,
        loadMore,
        refresh,
    };
}

/**
 * Hook to persist recurring preference
 */
export function useRecurringPreference() {
    const [preferRecurring, setPreferRecurring] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('preferRecurring') === 'true';
        }
        return false;
    });

    const updatePreference = useCallback((value: boolean) => {
        setPreferRecurring(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferRecurring', value.toString());
        }
    }, []);

    return {
        preferRecurring,
        updatePreference,
    };
}


/**
 * Hook for discount validation
 */
export function useDiscountValidation(
    code: string,
    planId: string | null,
    enabled = true
) {
    const plansQuery = api.plans.getActivePlans.useQuery();
    const [debouncedCode, setDebouncedCode] = useState(code);

    // Debounce discount code input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCode(code);
        }, 500);

        return () => clearTimeout(timer);
    }, [code]);

    const plan = useMemo(() => {
        if (!planId || !plansQuery.data) return null;
        return plansQuery.data.find(p => p.id === planId);
    }, [planId, plansQuery.data]);

    const query = api.discount.validate.useQuery(
        {
            code: debouncedCode,
            plan: plan?.code || "",
            amount: Number(plan?.priceInt) || 0,
        },
        {
            enabled: enabled && !!debouncedCode && !!plan && debouncedCode.length >= 4,
            staleTime: 60000, // Cache for 1 minute
        }
    );

    return {
        validation: query.data as DiscountValidation | undefined,
        isValidating: query.isLoading && !!debouncedCode,
        error: query.error,
    };
}


/**
 * Hook for billing alerts and notifications
 */
export function useBillingAlerts() {
    const { subscription, usage, isLimited } = useSubscription();
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const alerts = useMemo(() => {
        const alerts: Array<{
            id: string;
            type: "warning" | "error" | "info";
            title: string;
            description: string;
            action?: { label: string; onClick: () => void };
        }> = [];

        if (!subscription || !usage) return alerts;

        // Usage limit alerts
        if (isLimited) {
            alerts.push({
                id: "usage-limit",
                type: "error",
                title: "Usage Limit Reached",
                description: "You've reached your plan limits. Upgrade to continue using the service.",
                action: { label: "Upgrade Now", onClick: () => window.location.href = "/billing/upgrade" },
            });
        } else if (usage.dm.nearLimit || usage.accounts.nearLimit) {
            alerts.push({
                id: "near-limit",
                type: "warning",
                title: "Approaching Usage Limit",
                description: `You're using ${Math.max(usage.dm.percentage, usage.accounts.percentage)}% of your plan. Consider upgrading soon.`,
                action: { label: "View Plans", onClick: () => window.location.href = "/billing/upgrade" },
            });
        }

        // Subscription ending alert
        if (subscription.cancelAtPeriodEnd && subscription.daysRemaining !== null && subscription.daysRemaining <= 7) {
            alerts.push({
                id: "subscription-ending",
                type: "warning",
                title: "Subscription Ending Soon",
                description: `Your subscription will end in ${subscription.daysRemaining} days.`,
                action: { label: "Resume Subscription", onClick: () => window.location.href = "/billing" },
            });
        }

        // Filter dismissed alerts
        return alerts.filter(alert => !dismissedAlerts.has(alert.id));
    }, [subscription, usage, isLimited, dismissedAlerts]);

    const dismissAlert = useCallback((alertId: string) => {
        setDismissedAlerts(prev => new Set(prev).add(alertId));
    }, []);

    return {
        alerts,
        dismissAlert,
    };
}

/**
 * Hook for subscription trial status
 */
export function useTrialStatus() {
    const { subscription } = useSubscription();

    const trialStatus = useMemo(() => {
        if (!subscription) return null;

        // Check if user is on free plan with limited time
        const isOnTrial = subscription.plan === "FREE" && subscription.currentPeriodEnd !== null;
        const trialDaysRemaining = isOnTrial && subscription.daysRemaining !== null
            ? subscription.daysRemaining
            : 0;

        return {
            isOnTrial,
            trialDaysRemaining,
            trialEndsAt: isOnTrial ? subscription.currentPeriodEnd : null,
            hasTrialExpired: isOnTrial && trialDaysRemaining <= 0,
        };
    }, [subscription]);

    return trialStatus;
}