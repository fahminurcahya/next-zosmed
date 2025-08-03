"use client";

import React, { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

import {
    CreditCard,
    Wallet,
    Building,
    Plus,
    MoreVertical,
    Check,
    Star,
    Trash2,
    RefreshCw,
    Shield,
    AlertCircle,
    Loader2,
    ChevronRight,
    Info,
    Clock,
    CheckCircle,
    ArrowLeft,
    ExternalLink,
    HelpCircle,
    AlertTriangle,
    Phone
} from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { usePaymentChannels, usePaymentMethodActions, usePaymentMethodRequired, usePaymentMethods } from '@/hooks/payment-method-hook';
import { useRecurringStatus } from '@/hooks/billing-hook';
import NotFoundPage from '@/app/not-found';
const isRecurring = process.env.CONFIG_RECURRING

export default function PaymentMethodsPage() {
    const router = useRouter();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedType, setSelectedType] = useState<'CARD' | 'EWALLET' | 'DIRECT_DEBIT'>('CARD');
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [setAsDefault, setSetAsDefault] = useState(false);
    const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);
    const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

    // Use custom hooks
    const {
        paymentMethods,
        hasActiveMethod,
        defaultMethod,
        activeMethodsCount,
        isLoading,
        refetch
    } = usePaymentMethods();


    const {
        addMethod,
        setDefault,
        removeMethod,
        isProcessing
    } = usePaymentMethodActions();

    const { recurringStatus } = useRecurringStatus();
    const { isRequired: paymentMethodRequired, message: requiredMessage } = usePaymentMethodRequired();
    const { channels, isLoading: channelsLoading } = usePaymentChannels();
    const getSelectedChannelInfo = () => {
        if (!channels) return null;
        const allChannels = [
            ...channels.ewallet.channels,
            ...channels.directDebit.channels
        ];
        return allChannels.find(ch => ch.code === selectedChannel);
    };
    // Check if selected channel requires phone number
    const selectedChannelInfo = getSelectedChannelInfo();
    const requiresPhoneNumber = selectedChannelInfo?.requiresPhoneNumber || false;

    const getChannelLogo = (type: string, channelCode?: string) => {
        // Try to get from selected channel info first
        if (selectedChannelInfo) {
            return selectedChannelInfo.logo;
        }

        // Fallback to existing logic
        const logoMap: Record<string, string> = {
            'OVO': '🟣',
            'DANA': '🔵',
            'SHOPEEPAY': '🟠',
            'LINKAJA': '🔴',
            'BCA_ONEKLIK': '🏦',
            'BRI': '🏦',
            'MANDIRI': '🏦',
            'BNI': '🏦',
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
            <Badge variant={config!.variant}>
                <Icon className="h-3 w-3 mr-1" />
                {config!.label}
            </Badge>
        );
    };

    const validatePhoneNumber = (phone: string): boolean => {
        // Indonesian phone number validation
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');

        // Convert to +62 format
        if (cleaned.startsWith('0')) {
            return '+62' + cleaned.substring(1);
        } else if (cleaned.startsWith('62')) {
            return '+' + cleaned;
        } else if (cleaned.startsWith('+62')) {
            return cleaned;
        }

        return '+62' + cleaned;
    };

    const handleAddMethod = async () => {
        if (!selectedChannel && selectedType !== 'CARD') {
            toast.error('Please select a payment channel');
            return;
        }

        // Validate phone number for channels that require it
        if (requiresPhoneNumber) {
            if (!phoneNumber.trim()) {
                toast.error('Phone number is required for ' + selectedChannel);
                return;
            }

            if (!validatePhoneNumber(phoneNumber)) {
                toast.error('Please enter a valid Indonesian phone number');
                return;
            }
        }

        try {
            const methodData: any = {
                type: selectedType,
                channelCode: selectedChannel || undefined,
                setAsDefault
            };

            // Add phone number for channels that require it
            if (requiresPhoneNumber && phoneNumber) {
                methodData.phoneNumber = formatPhoneNumber(phoneNumber);
            }

            await addMethod(methodData);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleSetDefault = async (paymentMethodId: string) => {
        try {
            await setDefault({ paymentMethodId });
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleRemoveMethod = async () => {
        if (!deleteMethodId) return;

        try {
            await removeMethod({ paymentMethodId: deleteMethodId });
            setDeleteMethodId(null);
        } catch (error) {
            // Error handled by hook
        }
    };

    const resetAddDialog = () => {
        setSelectedType('CARD');
        setSelectedChannel('');
        setPhoneNumber('');
        setSetAsDefault(false);
    };


    const handleChannelChange = (channelCode: string) => {
        setSelectedChannel(channelCode);

        // Clear phone number when switching to channels that don't require it
        if (!['OVO', 'LINKAJA'].includes(channelCode)) {
            setPhoneNumber('');
        }
    };

    if (!isRecurring) return <NotFoundPage />

    // Loading state
    if (isLoading || channelsLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    if (!channels) {
        return (
            <div className="container mx-auto p-6">
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                        Unable to load payment channels. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const hasRecurringActive = recurringStatus?.status === 'ACTIVE';

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/billing')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold">Payment Methods</h1>
                    </div>
                    <p className="text-gray-600 ml-11">
                        Manage your payment methods for subscriptions and auto-renewal
                    </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                </Button>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Methods</p>
                                <p className="text-2xl font-bold">{paymentMethods.length}</p>
                            </div>
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Methods</p>
                                <p className="text-2xl font-bold">{activeMethodsCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Auto-Renewal</p>
                                <p className="text-2xl font-bold">
                                    {hasRecurringActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <RefreshCw className={cn(
                                "h-8 w-8",
                                hasRecurringActive ? "text-green-500" : "text-gray-400"
                            )} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            {!hasActiveMethod && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                        You don't have any active payment methods. Add one to enable auto-renewal for your subscription.
                    </AlertDescription>
                </Alert>
            )}

            {paymentMethodRequired && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>{requiredMessage}</AlertDescription>
                </Alert>
            )}

            {/* Payment Methods List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Payment Methods</h2>

                {paymentMethods.map((method) => (
                    <Card key={method.id} className={cn(
                        "relative transition-all hover:shadow-md",
                        method.isDefault && "ring-2 ring-blue-500"
                    )}>
                        {method.isDefault && (
                            <div className="absolute -top-3 left-4">
                                <Badge variant="default" className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    Default
                                </Badge>
                            </div>
                        )}

                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {getChannelLogo(method.type, method!.channelCode!)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {method.displayName || 'Payment Method'}
                                        </div>
                                        <p className="text-sm font-normal text-muted-foreground mt-1">
                                            {method.type} {method.channelCode && `• ${method.channelCode}`}
                                        </p>
                                    </div>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(method.status)}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                onClick={() => setViewDetailsId(method.id)}
                                            >
                                                <Info className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            {method.status === 'ACTIVE' && !method.isDefault && (
                                                <DropdownMenuItem
                                                    onClick={() => handleSetDefault(method.xenditPaymentMethodId)}
                                                >
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Set as Default
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeleteMethodId(method.xenditPaymentMethodId)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Added</p>
                                    <p className="font-medium">{formatDate(method.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Used</p>
                                    <p className="font-medium">{formatDate(method.lastUsedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{method.status.toLowerCase()}</p>
                                </div>
                            </div>

                            {method.status === 'PENDING_ACTIVATION' && (
                                <Alert className="mt-4">
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                        This payment method is pending activation. Please complete the setup process.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {paymentMethods.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                                Add a payment method to enable auto-renewal for your subscription
                            </p>
                            <Button onClick={() => setShowAddDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Payment Method
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Security Info */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                            <h3 className="font-semibold">Your Payment Information is Secure</h3>
                            <p className="text-sm text-muted-foreground">
                                All payment methods are securely stored with Xendit, our PCI-compliant payment partner.
                                We never store your full card numbers or sensitive payment details.
                            </p>
                            <a
                                href="https://www.xendit.co/en/security/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                Learn more about Xendit security
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Payment Method Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetAddDialog();
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Choose a payment method for automatic subscription renewal
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Payment Type Selection */}
                        <Tabs value={selectedType} onValueChange={(v) => {
                            setSelectedType(v as any);
                            setSelectedChannel('');
                            setPhoneNumber('');
                        }}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="EWALLET">
                                    <Wallet className="h-4 w-4 mr-2" />
                                    E-Wallet
                                </TabsTrigger>
                                <TabsTrigger value="DIRECT_DEBIT">
                                    <Building className="h-4 w-4 mr-2" />
                                    Bank
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="EWALLET" className="space-y-4">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Select your preferred e-wallet. You'll be redirected to link your account.
                                    </AlertDescription>
                                </Alert>

                                <RadioGroup value={selectedChannel} onValueChange={handleChannelChange}>
                                    <div className="grid gap-3">
                                        {channels.ewallet.channels.map((channel) => (
                                            <div
                                                key={channel.code}
                                                className={cn(
                                                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                                                    "hover:bg-gray-50 dark:hover:bg-gray-900",
                                                    selectedChannel === channel.code && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                )}
                                                onClick={() => handleChannelChange(channel.code)}
                                            >
                                                <RadioGroupItem value={channel.code} id={channel.code} />
                                                <Label htmlFor={channel.code} className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{channel.logo}</span>
                                                            <div>
                                                                <span className="font-medium">{channel.name}</span>
                                                                {/* UPDATE: Dynamic phone number requirement */}
                                                                {channel.requiresPhoneNumber && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Phone number required
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>

                                {/* Phone Number Input for OVO/LinkAja */}
                                {requiresPhoneNumber && (
                                    <div className="space-y-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="08123456789 or +628123456789"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className={cn(
                                                phoneNumber && !validatePhoneNumber(phoneNumber) && "border-red-500"
                                            )}
                                        />
                                        {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                                            <p className="text-sm text-red-600">
                                                Please enter a valid Indonesian phone number
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Enter your {selectedChannel} registered phone number.
                                            Supports formats: 08xxx, +628xxx, or 628xxx
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="DIRECT_DEBIT" className="space-y-4">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        Connect your bank account for automatic deductions. Secure and convenient.
                                    </AlertDescription>
                                </Alert>

                                <RadioGroup value={selectedChannel} onValueChange={handleChannelChange}>
                                    <div className="grid gap-3">
                                        {channels.directDebit.channels.map((channel) => (
                                            <div
                                                key={channel.code}
                                                className={cn(
                                                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                                                    "hover:bg-gray-50 dark:hover:bg-gray-900",
                                                    selectedChannel === channel.code && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                )}
                                                onClick={() => handleChannelChange(channel.code)}
                                            >
                                                <RadioGroupItem value={channel.code} id={channel.code} />
                                                <Label htmlFor={channel.code} className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{channel.logo}</span>
                                                            <span className="font-medium">{channel.name}</span>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </TabsContent>
                        </Tabs>

                        <Separator />

                        {/* Set as Default Option */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="setAsDefault"
                                checked={setAsDefault}
                                onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="setAsDefault" className="text-sm font-medium cursor-pointer">
                                    Set as default payment method
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    This payment method will be used for all future auto-renewal charges
                                </p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>What happens next?</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• You'll be redirected to Xendit's secure page</li>
                                    <li>• Complete the payment method setup</li>
                                    {requiresPhoneNumber && (
                                        <li>• Verify your {selectedChannel} account with the provided phone number</li>
                                    )}
                                    <li>• You'll be redirected back here when done</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddDialog(false);
                                resetAddDialog();
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMethod}
                            disabled={
                                isProcessing ||
                                (selectedType !== 'CARD' && !selectedChannel) ||
                                (requiresPhoneNumber && (!phoneNumber || !validatePhoneNumber(phoneNumber)))
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Continue to Xendit
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteMethodId} onOpenChange={() => setDeleteMethodId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Payment Method</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this payment method?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                            If this payment method is being used for active subscriptions,
                            you'll need to add another payment method first.
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteMethodId(null)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveMethod}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                'Remove Payment Method'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            {viewDetailsId && (
                <Dialog open={!!viewDetailsId} onOpenChange={() => setViewDetailsId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Payment Method Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {(() => {
                                const method = paymentMethods.find(m => m.id === viewDetailsId);
                                if (!method) return null;

                                return (
                                    <>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Type</span>
                                                <span className="font-medium">{method.type}</span>
                                            </div>
                                            {method.channelCode && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Channel</span>
                                                    <span className="font-medium">{method.channelCode}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status</span>
                                                {getStatusBadge(method.status)}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Added</span>
                                                <span className="font-medium">{formatDate(method.createdAt)}</span>
                                            </div>
                                            {method.activatedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Activated</span>
                                                    <span className="font-medium">{formatDate(method.activatedAt)}</span>
                                                </div>
                                            )}
                                            {method.lastUsedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Last Used</span>
                                                    <span className="font-medium">{formatDate(method.lastUsedAt)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Default</span>
                                                <span className="font-medium">{method.isDefault ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Payment Method ID</span>
                                                <span className="font-mono text-xs">{method.xenditPaymentMethodId}</span>
                                            </div>
                                        </div>

                                        {method.failureCode && (
                                            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <AlertDescription>
                                                    <strong>Failure Reason:</strong> {method.failureCode}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setViewDetailsId(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}