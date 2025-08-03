import { useMemo, useCallback } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRecurringStatus } from "./billing-hook";

/**
 * Hook for payment method management
 */
export function usePaymentMethods() {
    const query = api.paymentMethod.list.useQuery();
    const utils = api.useUtils();

    const paymentMethods = useMemo(() => {
        if (!query.data) return [];
        return query.data.paymentMethods;
    }, [query.data]);

    const hasActiveMethod = useMemo(() => {
        return query.data?.hasActive || false;
    }, [query.data]);

    const defaultMethod = useMemo(() => {
        return query.data?.defaultMethod || null;
    }, [query.data]);

    const activeMethodsCount = useMemo(() => {
        return paymentMethods.filter(pm => pm.status === 'ACTIVE').length;
    }, [paymentMethods]);

    return {
        paymentMethods,
        hasActiveMethod,
        defaultMethod,
        activeMethodsCount,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Hook for payment method actions
 */
export function usePaymentMethodActions() {
    const utils = api.useUtils();

    const addMethod = api.paymentMethod.add.useMutation({
        onSuccess: (result) => {
            if (result.authUrl) {
                // Store setup info in session storage
                sessionStorage.setItem('payment_method_setup', JSON.stringify({
                    paymentMethodId: result.paymentMethodId,
                    externalId: result.externalId,
                    timestamp: Date.now()
                }));

                // Redirect to Xendit
                window.location.href = result.authUrl;
            } else {
                toast.error('Failed to get authorization URL');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add payment method');
        }
    });

    const setDefault = api.paymentMethod.setDefault.useMutation({
        onSuccess: () => {
            toast.success('Default payment method updated');
            utils.paymentMethod.list.invalidate();
            utils.billing.getRecurringStatus.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update default payment method');
        }
    });

    const removeMethod = api.paymentMethod.remove.useMutation({
        onSuccess: () => {
            toast.success('Payment method removed');
            utils.paymentMethod.list.invalidate();
            utils.billing.getRecurringStatus.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to remove payment method');
        }
    });

    const updateRecurringMethod = api.paymentMethod.updateRecurringPaymentMethod.useMutation({
        onSuccess: () => {
            toast.success('Recurring payment method updated');
            utils.billing.getRecurringStatus.invalidate();
            utils.paymentMethod.list.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update recurring payment method');
        }
    });

    return {
        addMethod: addMethod.mutateAsync,
        setDefault: setDefault.mutateAsync,
        removeMethod: removeMethod.mutateAsync,
        updateRecurringMethod: updateRecurringMethod.mutateAsync,
        isProcessing:
            addMethod.isPending ||
            setDefault.isPending ||
            removeMethod.isPending ||
            updateRecurringMethod.isPending,
    };
}

/**
 * Hook for available payment channels - UPDATED to use database
 */
export function usePaymentChannels() {
    // REPLACE the hardcoded getAvailableChannels with dynamic channels
    const query = api.paymentChannel.listForUser.useQuery({
        isRecurring: true, // Only get recurring-enabled channels
    });

    const channels = useMemo(() => {
        if (!query.data?.data) return null;

        const channelData = query.data.data;

        // Helper function to get channel logo
        const getChannelLogo = (channelCode: string): string => {
            const logoMap: Record<string, string> = {
                'OVO': '🟣',
                'DANA': '🔵',
                'SHOPEEPAY': '🟠',
                'LINKAJA': '🔴',
                'BCA': '🔵',
                'BNI': '🟠',
                'BRI': '🔵',
                'MANDIRI': '🟡',
                'PERMATA': '🟢',
                'QRIS': '📱',
                'BCA_ONEKLIK': '🏦',
                'CARD': '💳'
            };
            return logoMap[channelCode] || '💳';
        };

        // Transform database channels to expected format
        const ewalletChannels = channelData
            .filter(ch => ch.type === 'EWALLET' && ch.isRecurringEnabled)
            .map(ch => ({
                code: ch.xenditChannelCode || ch.channelCode,
                name: ch.channelName,
                logo: getChannelLogo(ch.xenditChannelCode || ch.channelCode),
                requiresPhoneNumber: ['OVO', 'LINKAJA'].includes(ch.xenditChannelCode || ''),
            }));

        const directDebitChannels = channelData
            .filter(ch => (ch.type === 'DIRECT_DEBIT' || ch.type === 'VIRTUAL_ACCOUNT') && ch.isRecurringEnabled)
            .map(ch => ({
                code: ch.xenditChannelCode || ch.channelCode,
                name: ch.channelName,
                logo: getChannelLogo(ch.xenditChannelCode || ch.channelCode),
                requiresPhoneNumber: false,
            }));

        return {
            card: {
                type: 'CARD',
                name: 'Credit/Debit Card',
                channels: [
                    { code: 'CARD', name: 'All Cards', logo: '💳' }
                ]
            },
            ewallet: {
                type: 'EWALLET',
                name: 'E-Wallet',
                channels: ewalletChannels,
            },
            directDebit: {
                type: 'DIRECT_DEBIT',
                name: 'Bank Transfer',
                channels: directDebitChannels,
            },
            all: [
                { code: 'CARD', name: 'All Cards', logo: '💳', type: 'CARD' },
                ...ewalletChannels.map(c => ({ ...c, type: 'EWALLET' })),
                ...directDebitChannels.map(c => ({ ...c, type: 'DIRECT_DEBIT' })),
            ]
        };
    }, [query.data]);

    return {
        channels,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}

/**
 * Hook to check if payment method is required
 */
export function usePaymentMethodRequired() {
    const { recurringStatus } = useRecurringStatus();
    const { hasActiveMethod } = usePaymentMethods();

    const isRequired = useMemo(() => {
        // Payment method is required if:
        // 1. User has active recurring but no payment method
        // 2. User is trying to enable recurring
        return recurringStatus?.status === 'ACTIVE' && !hasActiveMethod;
    }, [recurringStatus, hasActiveMethod]);

    const message = useMemo(() => {
        if (!isRequired) return null;

        return "Please add a payment method to continue with auto-renewal";
    }, [isRequired]);

    return {
        isRequired,
        message,
    };
}