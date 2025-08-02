import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { getCategoryInfo, getChannelTypeInfo, SUBSCRIPTION_PLANS, type PaymentChannelData, type PaymentChannelFormData } from "@/types/payment-channel.type";
import { PaymentCategory, PaymentChannelType } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


interface PaymentChannelFormProps {
    channel?: PaymentChannelData;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentChannelForm: React.FC<PaymentChannelFormProps> = ({
    channel,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<PaymentChannelFormData>({
        channelCode: channel?.channelCode || "",
        channelName: channel?.channelName || "",
        type: channel?.type || PaymentChannelType.VIRTUAL_ACCOUNT,
        category: channel?.category || PaymentCategory.BANK_TRANSFER,
        isActive: channel?.isActive ?? true,
        isOneTimeEnabled: channel?.isOneTimeEnabled ?? true,
        isRecurringEnabled: channel?.isRecurringEnabled ?? false,
        logo: channel?.logo || "",
        backgroundColor: channel?.backgroundColor || "",
        textColor: channel?.textColor || "",
        sortOrder: channel?.sortOrder || 0,
        minAmount: channel?.minAmount || undefined,
        maxAmount: channel?.maxAmount || undefined,
        processingFee: channel?.processingFee || undefined,
        percentageFee: channel?.percentageFee || undefined,
        allowedForPlans: channel?.allowedForPlans || [],
        description: channel?.description || "",
        customerMessage: channel?.customerMessage || "",
        xenditChannelCode: channel?.xenditChannelCode || "",
        metadata: channel?.metadata || {},
    });

    const createMutation = api.paymentChannel.create.useMutation();
    const updateMutation = api.paymentChannel.update.useMutation();

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Reset form data when channel changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                channelCode: channel?.channelCode || "",
                channelName: channel?.channelName || "",
                type: channel?.type || PaymentChannelType.VIRTUAL_ACCOUNT,
                category: channel?.category || PaymentCategory.BANK_TRANSFER,
                isActive: channel?.isActive ?? true,
                isOneTimeEnabled: channel?.isOneTimeEnabled ?? true,
                isRecurringEnabled: channel?.isRecurringEnabled ?? false,
                logo: channel?.logo || "",
                backgroundColor: channel?.backgroundColor || "",
                textColor: channel?.textColor || "",
                sortOrder: channel?.sortOrder || 0,
                minAmount: channel?.minAmount || undefined,
                maxAmount: channel?.maxAmount || undefined,
                processingFee: channel?.processingFee || undefined,
                percentageFee: channel?.percentageFee || undefined,
                allowedForPlans: channel?.allowedForPlans || [],
                description: channel?.description || "",
                customerMessage: channel?.customerMessage || "",
                xenditChannelCode: channel?.xenditChannelCode || "",
                metadata: channel?.metadata || {},
            });
        }
    }, [channel, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (channel) {
                await updateMutation.mutateAsync({
                    id: channel.id,
                    ...formData,
                });
                toast.success("Payment channel updated successfully");
            } else {
                await createMutation.mutateAsync(formData);
                toast.success("Payment channel created successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save payment channel");
        }
    };

    const handlePlanToggle = (planValue: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            allowedForPlans: checked
                ? [...prev.allowedForPlans, planValue]
                : prev.allowedForPlans.filter(p => p !== planValue)
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {channel ? "Edit Payment Channel" : "Add Payment Channel"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure payment channel settings for your application.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="channelCode">Channel Code *</Label>
                            <Input
                                id="channelCode"
                                value={formData.channelCode}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    channelCode: e.target.value.toUpperCase()
                                }))}
                                placeholder="BCA, OVO, QRIS, etc."
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="channelName">Channel Name *</Label>
                            <Input
                                id="channelName"
                                value={formData.channelName}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    channelName: e.target.value
                                }))}
                                placeholder="BCA Virtual Account"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>

                    {/* Type and Category */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: PaymentChannelType) =>
                                    setFormData(prev => ({ ...prev, type: value }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PaymentChannelType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getChannelTypeInfo(type).label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: PaymentCategory) =>
                                    setFormData(prev => ({ ...prev, category: value }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PaymentCategory).map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {getCategoryInfo(category).label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </motion.div>

                    {/* Availability Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="space-y-4"
                    >
                        <Label className="text-base font-medium">Availability</Label>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, isActive: checked }))
                                    }
                                    disabled={isLoading}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isOneTimeEnabled"
                                    checked={formData.isOneTimeEnabled}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, isOneTimeEnabled: checked }))
                                    }
                                    disabled={isLoading}
                                />
                                <Label htmlFor="isOneTimeEnabled">One-time Payment</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isRecurringEnabled"
                                    checked={formData.isRecurringEnabled}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, isRecurringEnabled: checked }))
                                    }
                                    disabled={isLoading}
                                />
                                <Label htmlFor="isRecurringEnabled">Recurring Payment</Label>
                            </div>
                        </div>
                    </motion.div>

                    {/* Display Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo URL</Label>
                                <Input
                                    id="logo"
                                    value={formData.logo}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        logo: e.target.value
                                    }))}
                                    placeholder="/icons/bca.svg"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    min="0"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        sortOrder: parseInt(e.target.value) || 0
                                    }))}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="backgroundColor">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="backgroundColor"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            backgroundColor: e.target.value
                                        }))}
                                        placeholder="#0066cc"
                                        disabled={isLoading}
                                    />
                                    {formData.backgroundColor && (
                                        <div
                                            className="w-10 h-10 rounded border border-input flex-shrink-0"
                                            style={{ backgroundColor: formData.backgroundColor }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="textColor">Text Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="textColor"
                                        value={formData.textColor}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            textColor: e.target.value
                                        }))}
                                        placeholder="#ffffff"
                                        disabled={isLoading}
                                    />
                                    {formData.textColor && (
                                        <div
                                            className="w-10 h-10 rounded border border-input flex-shrink-0"
                                            style={{ backgroundColor: formData.textColor }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Amount Limits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="minAmount">Minimum Amount (IDR)</Label>
                            <Input
                                id="minAmount"
                                type="number"
                                min="0"
                                value={formData.minAmount || ""}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    minAmount: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                placeholder="10000"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxAmount">Maximum Amount (IDR)</Label>
                            <Input
                                id="maxAmount"
                                type="number"
                                min="0"
                                value={formData.maxAmount || ""}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    maxAmount: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                placeholder="10000000"
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>

                    {/* Fees */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="processingFee">Processing Fee (IDR)</Label>
                            <Input
                                id="processingFee"
                                type="number"
                                min="0"
                                value={formData.processingFee || ""}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    processingFee: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                placeholder="5000"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="percentageFee">Percentage Fee (%)</Label>
                            <Input
                                id="percentageFee"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.percentageFee || ""}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    percentageFee: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                placeholder="2.5"
                                disabled={isLoading}
                            />
                        </div>
                    </motion.div>

                    {/* Plan Restrictions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="space-y-2"
                    >
                        <Label className="text-base font-medium">Allowed Plans</Label>
                        <div className="flex flex-wrap gap-3">
                            {SUBSCRIPTION_PLANS.map((plan) => (
                                <motion.div
                                    key={plan.value}
                                    className="flex items-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Checkbox
                                        id={plan.value}
                                        checked={formData.allowedForPlans.includes(plan.value)}
                                        onCheckedChange={(checked) =>
                                            handlePlanToggle(plan.value, checked as boolean)
                                        }
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={plan.value}>{plan.label}</Label>
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Leave empty to allow all plans
                        </p>
                    </motion.div>

                    {/* Xendit Integration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="xenditChannelCode">Xendit Channel Code</Label>
                        <Input
                            id="xenditChannelCode"
                            value={formData.xenditChannelCode}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                xenditChannelCode: e.target.value
                            }))}
                            placeholder="BCA, ID_OVO, ID_QRIS, etc."
                            disabled={isLoading}
                        />
                    </motion.div>

                    {/* Customer Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="customerMessage">Customer Message</Label>
                        <Textarea
                            id="customerMessage"
                            value={formData.customerMessage}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                customerMessage: e.target.value
                            }))}
                            placeholder="Message shown to customers during checkout"
                            rows={3}
                            disabled={isLoading}
                        />
                    </motion.div>

                    {/* Admin Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="description">Admin Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            placeholder="Internal notes about this payment channel"
                            rows={2}
                            disabled={isLoading}
                        />
                    </motion.div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

