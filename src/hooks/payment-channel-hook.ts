import { api } from "@/trpc/react";
import { calculateTotalFee, type PaymentChannelUserView } from "@/types/payment-channel.type";

interface UsePaymentChannelsProps {
    planName?: "FREE" | "STARTER" | "PRO";
    isRecurring?: boolean;
    amount?: number;
}

export const usePaymentChannels = ({
    planName,
    isRecurring = false,
    amount,
}: UsePaymentChannelsProps = {}) => {
    const {
        data: channelsResponse,
        isLoading,
        error,
        refetch,
    } = api.paymentChannel.listForUser.useQuery({
        planName,
        isRecurring,
        amount,
    });

    const channels = channelsResponse?.data || [];

    // Group channels by category for better UX
    const channelsByCategory = channels.reduce((acc, channel) => {
        const category = channel.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(channel);
        return acc;
    }, {} as Record<string, PaymentChannelUserView[]>);

    // Calculate fees for each channel
    const channelsWithFees = channels.map((channel) => {
        const totalFee = amount ? calculateTotalFee(amount, channel.processingFee, channel.percentageFee) : 0;
        const totalAmount = amount ? amount + totalFee : 0;

        return {
            ...channel,
            calculatedFee: totalFee,
            totalAmount,
        };
    });

    // Get recommended channels (lowest fees first)
    const recommendedChannels = channelsWithFees
        .sort((a, b) => a.calculatedFee - b.calculatedFee)
        .slice(0, 3);

    // Transform to the format expected by PaymentMethodsPage
    const getChannelsForPaymentMethods = () => {
        const ewalletChannels = channels
            .filter(ch => ch.type === 'EWALLET')
            .map(ch => ({
                code: ch.xenditChannelCode || ch.channelCode,
                name: ch.channelName,
                logo: getChannelLogo(ch.channelCode),
                enabled: ch.isRecurringEnabled && isRecurring ? true : !isRecurring,
                requiresPhoneNumber: ['OVO', 'LINKAJA'].includes(ch.xenditChannelCode || ''),
            }));

        const directDebitChannels = channels
            .filter(ch => ch.type === 'DIRECT_DEBIT' || (ch.type === 'VIRTUAL_ACCOUNT' && isRecurring))
            .map(ch => ({
                code: ch.xenditChannelCode || ch.channelCode,
                name: ch.channelName,
                logo: getChannelLogo(ch.channelCode),
                enabled: ch.isRecurringEnabled,
            }));

        return {
            ewallet: {
                channels: ewalletChannels,
            },
            directDebit: {
                channels: directDebitChannels,
            },
        };
    };

    return {
        channels,
        channelsWithFees,
        channelsByCategory,
        recommendedChannels,
        isLoading,
        error,
        refetch,
        hasChannels: channels.length > 0,
        // For PaymentMethodsPage compatibility
        getChannelsForPaymentMethods,
    };
};

// Helper function to get channel logos
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
    };

    return logoMap[channelCode] || '💳';
};

// Admin hook tetap sama
export const usePaymentChannelsAdmin = (filters?: {
    includeInactive?: boolean;
    type?: any;
    category?: any;
    forOneTime?: boolean;
    forRecurring?: boolean;
    forPlan?: "FREE" | "STARTER" | "PRO";
}) => {
    const {
        data: channelsResponse,
        isLoading,
        error,
        refetch,
    } = api.paymentChannel.listAdmin.useQuery(filters || {});

    return {
        channels: channelsResponse?.data || [],
        isLoading,
        error,
        refetch,
    };
};