'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/trpc/react';
import { DiscountUsageStats } from './_components/discount-usage-stats';

interface DiscountFormData {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    description: string;
    validDays: number;
    maxUses: number | null;
    applicablePlans: ('FREE' | 'STARTER' | 'PRO')[];
    minPurchaseAmount: number | null;
}

const initialFormData: DiscountFormData = {
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    description: '',
    validDays: 30,
    maxUses: null,
    applicablePlans: [],
    minPurchaseAmount: null,
};

export default function DiscountManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<any>(null);
    const [formData, setFormData] = useState<DiscountFormData>(initialFormData);

    const limit = 10;
    const offset = currentPage * limit;

    const utils = api.useUtils();


    // Queries
    const { data: discountsData, isLoading, refetch } = api.discount.list.useQuery({
        limit,
        offset,
        includeInactive: showInactive,
    });

    // Mutations
    const createDiscount = api.discount.create.useMutation({
        onSuccess: () => {
            toast.success('Discount created successfully');
            setIsCreateModalOpen(false);
            setFormData(initialFormData);
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const toggleStatus = api.discount.toggleStatus.useMutation({
        onSuccess: () => {
            toast.success('Discount status updated');
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('Discount code is required');
            return;
        }

        if (formData.value <= 0) {
            toast.error('Value must be greater than 0');
            return;
        }

        if (formData.type === 'PERCENTAGE' && formData.value > 100) {
            toast.error('Percentage discount cannot exceed 100%');
            return;
        }

        const submitData = {
            ...formData,
            maxUses: formData.maxUses || undefined,
            minPurchaseAmount: formData.minPurchaseAmount || undefined,
            applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : undefined,
        };

        createDiscount.mutate(submitData);
    };

    const handleToggleStatus = (id: string) => {
        toggleStatus.mutate({ id });
    };

    const filteredDiscounts = discountsData?.discounts?.filter(discount =>
        discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const formatDiscountValue = (type: string, value: number) => {
        if (type === 'PERCENTAGE') {
            return `${value}%`;
        }
        return formatCurrency(value);
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'FREE': return 'bg-gray-100 text-gray-800';
            case 'STARTER': return 'bg-blue-100 text-blue-800';
            case 'PRO': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <DiscountUsageStats
                discounts={discountsData}
                isLoading={isLoading}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Discount Management</h1>
                    <p className="text-gray-600">Manage discount codes and promotions</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-xl max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Discount</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Discount Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., SAVE20"
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value: 'PERCENTAGE' | 'FIXED') => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                            <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="value">
                                        Value {formData.type === 'PERCENTAGE' ? '(%)' : '(IDR)'}
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        placeholder={formData.type === 'PERCENTAGE' ? '20' : '50000'}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="validDays">Valid Days</Label>
                                    <Input
                                        id="validDays"
                                        type="number"
                                        value={formData.validDays}
                                        onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                                        placeholder="30"
                                        required
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the discount"
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                                    <Input
                                        id="maxUses"
                                        type="number"
                                        value={formData.maxUses || ''}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Leave empty for unlimited"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="minPurchaseAmount">Min Purchase Amount (Optional)</Label>
                                    <Input
                                        id="minPurchaseAmount"
                                        type="number"
                                        value={formData.minPurchaseAmount || ''}
                                        onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Minimum purchase amount"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Applicable Plans</Label>
                                <div className="flex gap-4 mt-2">
                                    {['FREE', 'STARTER', 'PRO'].map((plan) => (
                                        <div key={plan} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={plan}
                                                checked={formData.applicablePlans.includes(plan as any)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({
                                                            ...formData,
                                                            applicablePlans: [...formData.applicablePlans, plan as any]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            applicablePlans: formData.applicablePlans.filter(p => p !== plan)
                                                        });
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            <Label htmlFor={plan} className="text-sm">{plan}</Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Leave empty to apply to all plans</p>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createDiscount.isPending}>
                                    {createDiscount.isPending ? 'Creating...' : 'Create Discount'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search discount codes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-inactive"
                                checked={showInactive}
                                onCheckedChange={setShowInactive}
                            />
                            <Label htmlFor="show-inactive">Show Inactive</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Discount List */}
            <Card>
                <CardHeader>
                    <CardTitle>Discount Codes</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredDiscounts?.map((discount) => (
                                <div key={discount.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg">{discount.code}</span>
                                                <Badge variant={discount.isActive ? "default" : "secondary"}>
                                                    {discount.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {formatDiscountValue(discount.type, discount.value)}
                                                </Badge>
                                            </div>
                                            {discount.description && (
                                                <p className="text-gray-600 text-sm">{discount.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={discount.isActive}
                                                onCheckedChange={() => handleToggleStatus(discount.id)}
                                                disabled={toggleStatus.isPending}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Usage:</span>
                                            <p className="font-medium">
                                                {discount._count.usages}
                                                {discount.maxUses && ` / ${discount.maxUses}`}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Valid Until:</span>
                                            <p className="font-medium">
                                                {discount.validUntil ? format(new Date(discount.validUntil), 'MMM dd, yyyy') : 'No expiry'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Min Purchase:</span>
                                            <p className="font-medium">
                                                {discount.minPurchaseAmount ? formatCurrency(discount.minPurchaseAmount) : 'No minimum'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Created:</span>
                                            <p className="font-medium">{format(new Date(discount.createdAt), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>

                                    {discount.applicablePlans.length > 0 && (
                                        <div>
                                            <span className="text-gray-500 text-sm">Applicable Plans:</span>
                                            <div className="flex gap-1 mt-1">
                                                {discount.applicablePlans.map((plan: string) => (
                                                    <Badge key={plan} variant="outline" className={getPlanBadgeColor(plan)}>
                                                        {plan}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {discount.waitinglist && (
                                        <div className="bg-blue-50 p-3 rounded-md">
                                            <span className="text-sm font-medium text-blue-800">Waitlist Discount</span>
                                            <p className="text-sm text-blue-600">
                                                Assigned to: {discount.waitinglist.name} ({discount.waitinglist.email})
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(!filteredDiscounts || filteredDiscounts.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    No discount codes found.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {discountsData && discountsData.total > limit && (
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-sm text-gray-500">
                                Showing {offset + 1} to {Math.min(offset + limit, discountsData.total)} of {discountsData.total} results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={!discountsData.hasMore}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}