"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CreditCard,
    Wallet,
    Building,
    QrCode,
    Store,
    Plus,
    CheckCircle,
    AlertCircle,
    Info,
    ChevronRight,
    RefreshCw,
    Clock,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { usePaymentMethods } from "@/hooks/payment-method-hook";
import { usePaymentChannels } from "@/hooks/payment-channel-hook";
import { formatCurrency, getCategoryInfo } from "@/types/payment-channel.type";
import { useRouter } from 'nextjs-toploader/app';

interface PaymentMethodSelectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selection: PaymentMethodSelectionResult) => void;
    isRecurring: boolean;
    amount: number;
    planName?: "FREE" | "STARTER" | "PRO";
}

export interface PaymentMethodSelectionResult {
    type: 'saved_method' | 'one_time_channel';
    methodId?: string;
    channelCode?: string;
    channelInfo?: any;
    paymentChannels?: string[];
}

const isConfigRecurring = process.env.CONFIG_RECURRING || false


const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
    isOpen,
    onClose,
    onSelect,
    isRecurring,
    amount,
    planName,
}) => {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<'saved' | 'onetime'>('saved');
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [selectedChannelCode, setSelectedChannelCode] = useState<string>('');

    // Hooks for data
    const { paymentMethods, hasActiveMethod, isLoading: methodsLoading } = usePaymentMethods();
    const { channelsWithFees, channelsByCategory, isLoading: channelsLoading } = usePaymentChannels({
        isRecurring: false, // For one-time payments
        amount,
        planName,
    });


    // Filter active payment methods for recurring
    const activePaymentMethods = useMemo(() => {
        return paymentMethods.filter(method => method.status === 'ACTIVE');
    }, [paymentMethods]);

    // Auto-select tab based on recurring preference and available methods
    React.useEffect(() => {
        if (isRecurring && isConfigRecurring) {
            setSelectedType('saved');
        } else if (!isRecurring) {
            setSelectedType('onetime');
        } else {
            // Recurring but no saved methods
            setSelectedType('saved');
        }
    }, [isRecurring, hasActiveMethod]);

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'EWALLET': return <Wallet className="h-4 w-4" />;
            case 'VIRTUAL_ACCOUNT':
            case 'DIRECT_DEBIT': return <Building className="h-4 w-4" />;
            case 'QR_CODE': return <QrCode className="h-4 w-4" />;
            case 'CREDIT_CARD': return <CreditCard className="h-4 w-4" />;
            default: return <CreditCard className="h-4 w-4" />;
        }
    };

    const getPaymentMethodLogo = (type: string, channelCode?: string) => {
        const logoMap: Record<string, string> = {
            'OVO': '🟣',
            'DANA': '🔵',
            'SHOPEEPAY': '🟠',
            'LINKAJA': '🔴',
            'BCA': '🔵',
            'BNI': '🟠',
            'BRI': '🔵',
            'MANDIRI': '🟡',
            'CARD': '💳'
        };
        return logoMap[channelCode || type] || '💳';
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
            'ACTIVE': { variant: 'success', icon: CheckCircle, label: 'Active' },
            'PENDING_ACTIVATION': { variant: 'secondary', icon: Clock, label: 'Pending' },
            'EXPIRED': { variant: 'secondary', icon: AlertCircle, label: 'Expired' },
            'FAILED': { variant: 'destructive', icon: AlertCircle, label: 'Failed' },
            'INACTIVE': { variant: 'secondary', icon: AlertCircle, label: 'Inactive' }
        };

        const config = statusConfig[status] || statusConfig['INACTIVE'];
        const Icon = config!.icon;

        return (
            <Badge variant={config!.variant} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {config!.label}
            </Badge>
        );
    };

    const handleConfirm = () => {
        if (selectedType === 'saved' && selectedMethodId) {
            const selectedMethod = activePaymentMethods.find(m => m.id === selectedMethodId);
            onSelect({
                type: 'saved_method',
                methodId: selectedMethodId,
                channelInfo: selectedMethod,
            });
        } else if (selectedType === 'onetime' && selectedChannelCode) {
            const selectedChannel = channelsWithFees.find((c: any) => c.channelCode === selectedChannelCode);
            onSelect({
                type: 'one_time_channel',
                channelCode: selectedChannelCode,
                channelInfo: selectedChannel,
            });
        }
        onClose();
    };

    const canProceed = (selectedType === 'saved' && selectedMethodId) ||
        (selectedType === 'onetime' && selectedChannelCode);

    if (methodsLoading || channelsLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>
                        {isRecurring
                            ? "Select a saved payment method for auto-renewal"
                            : "Select how you'd like to pay for this upgrade"
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Payment Type Tabs */}
                    <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
                        <TabsList
                            className={cn(
                                "grid w-full",
                                isConfigRecurring ? "grid-cols-2" : "grid-cols-1"
                            )}
                        >
                            {isConfigRecurring && <TabsTrigger
                                value="saved"
                                disabled={!hasActiveMethod}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Saved Methods ({activePaymentMethods.length})
                            </TabsTrigger>
                            }

                            <TabsTrigger
                                value="onetime"
                                disabled={isRecurring}
                                className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                One-time Payment
                            </TabsTrigger>
                        </TabsList>

                        {/* Saved Payment Methods Tab */}
                        <TabsContent value="saved" className="space-y-4">
                            {hasActiveMethod ? (
                                <>
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                            {isRecurring
                                                ? "Use your saved payment method for seamless auto-renewal"
                                                : "Use your saved payment method for quick checkout"
                                            }
                                        </AlertDescription>
                                    </Alert>

                                    <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId}>
                                        <div className="space-y-3">
                                            {activePaymentMethods.map((method) => (
                                                <div
                                                    key={method.id}
                                                    className={cn(
                                                        "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                                                        "hover:bg-gray-50 dark:hover:bg-gray-900",
                                                        selectedMethodId === method.id && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                    )}
                                                    onClick={() => setSelectedMethodId(method.id)}
                                                >
                                                    <RadioGroupItem value={method.id} id={method.id} />
                                                    <div className="flex-1">
                                                        <Label htmlFor={method.id} className="cursor-pointer">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-2xl">
                                                                        {getPaymentMethodLogo(method.type, method.channelCode || '')}
                                                                    </span>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">
                                                                                {method.displayName || `${method.type} Payment`}
                                                                            </span>
                                                                            {method.isDefault && (
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    Default
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {method.type} {method.channelCode && `• ${method.channelCode}`}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Added {formatDate(method.createdAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusBadge(method.status)}
                                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Saved Payment Methods</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add a payment method to enable quick payments and auto-renewal
                                    </p>
                                    <Button variant="outline" size="sm"
                                        onClick={() => router.push("/billing/payment-methods")}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Payment Method
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* One-time Payment Tab */}
                        <TabsContent value="onetime" className="space-y-4">
                            {!isRecurring && <>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Choose from available payment channels. You'll complete payment with your selected method.
                                    </AlertDescription>
                                </Alert>

                                <RadioGroup value={selectedChannelCode} onValueChange={setSelectedChannelCode}>
                                    <div className="space-y-4">
                                        {Object.entries(channelsByCategory).map(([category, channels]: any) => {
                                            const categoryInfo = getCategoryInfo(category as any);

                                            return (
                                                <div key={category}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge className={categoryInfo.color}>
                                                            {categoryInfo.label}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {channels.length} method{channels.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {channels.map((channel: any) => {
                                                            return (
                                                                <div
                                                                    key={channel.id}
                                                                    className={cn(
                                                                        "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all",
                                                                        "hover:bg-gray-50 dark:hover:bg-gray-900",
                                                                        selectedChannelCode === channel.channelCode && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                                    )}
                                                                    onClick={() => setSelectedChannelCode(channel.channelCode)}
                                                                >
                                                                    <RadioGroupItem value={channel.channelCode} id={channel.channelCode} />
                                                                    <div className="flex-1">
                                                                        <Label htmlFor={channel.channelCode} className="cursor-pointer">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    {channel.logo ? (
                                                                                        <div
                                                                                            className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-semibold"
                                                                                            style={{ backgroundColor: channel.backgroundColor || '#gray' }}
                                                                                        >
                                                                                            {channel.channelCode.slice(0, 2)}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="text-gray-600">
                                                                                            {getChannelIcon(channel.type)}
                                                                                        </div>
                                                                                    )}
                                                                                    <div>
                                                                                        <div className="font-medium">{channel.channelName}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RadioGroup>
                            </>
                            }
                            {!channelsWithFees.length && (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Payment Channels Available</h3>
                                    <p className="text-muted-foreground">
                                        Please contact support to enable payment channels.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Selected Method Summary */}
                    {/* {((selectedType === 'saved' && selectedMethodId) || (selectedType === 'onetime' && selectedChannelCode)) && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Selected Payment Method:</div>
                            {selectedType === 'saved' ? (
                                (() => {
                                    const method = activePaymentMethods.find(m => m.id === selectedMethodId);
                                    return method && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getPaymentMethodLogo(method.type, method.channelCode || '')}</span>
                                            <span>{method.displayName || `${method.type} Payment`}</span>
                                            {isRecurring && <Badge variant="secondary">Auto-renewal enabled</Badge>}
                                        </div>
                                    );
                                })()
                            ) : (
                                (() => {
                                    const channel = channelsWithFees.find((c: any) => c.channelCode === selectedChannelCode);
                                    return channel && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{getPaymentMethodLogo('', channel.channelCode)}</span>
                                                <span>{channel.channelName}</span>
                                            </div>
                                            <span className="font-medium">{formatCurrency(channel.totalAmount)}</span>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    )} */}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!canProceed}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentMethodSelection;