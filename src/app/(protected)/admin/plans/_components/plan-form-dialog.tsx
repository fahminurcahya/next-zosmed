import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import type { Dispatch, SetStateAction } from "react";

interface PlanFormDialogProps {
    open: boolean;
    plan: any;
    isSaving: boolean;
    onChange: Dispatch<SetStateAction<any>>;
    onSave: () => void;
    onCancel: () => void;
}

export default function PlanFormDialog({
    open,
    plan,
    onChange,
    onSave,
    onCancel,
    isSaving
}: PlanFormDialogProps) {

    const handleFeatureAdd = (type: "included" | "notIncluded") => {
        onChange({
            ...plan,
            features: {
                ...plan.features,
                [type]: [...(plan.features?.[type] || []), ""],
            },
        });
    };

    const handleFeatureUpdate = (type: "included" | "notIncluded", index: number, value: string) => {
        const updated = [...(plan.features?.[type] || [])];
        updated[index] = value;
        onChange({
            ...plan,
            features: {
                ...plan.features,
                [type]: updated,
            },
        });
    };

    const handleFeatureRemove = (type: "included" | "notIncluded", index: number) => {
        const filtered = (plan.features?.[type] || []).filter((_: any, i: number) => i !== index);
        onChange({
            ...plan,
            features: {
                ...plan.features,
                [type]: filtered,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-xl font-semibold">
                        {plan?.id ? "Edit Plan" : "Create New Plan"}
                    </DialogTitle>
                </DialogHeader>

                {plan && (
                    <div className="space-y-8 py-2">
                        {/* Basic Information Section */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="internal-name" className="text-sm font-medium">
                                    Internal Name
                                </Label>
                                <Input
                                    id="internal-name"
                                    value={plan.name || ""}
                                    onChange={(e) => onChange({ ...plan, name: e.target.value.toUpperCase() })}
                                    placeholder="FREE, STARTER, PRO"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="display-name" className="text-sm font-medium">
                                    Display Name
                                </Label>
                                <Input
                                    id="display-name"
                                    value={plan.displayName || ""}
                                    onChange={(e) => onChange({ ...plan, displayName: e.target.value })}
                                    placeholder="Free, Starter, Pro"
                                    className="h-10"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    value={plan.description || ""}
                                    onChange={(e) => onChange({ ...plan, description: e.target.value })}
                                    placeholder="Short description of the plan"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                                Pricing
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-sm font-medium">
                                        Price (IDR)
                                    </Label>
                                    <Input
                                        id="price"
                                        min={0}
                                        type="number"
                                        value={plan.price}
                                        onChange={(e) => onChange({ ...plan, price: parseInt(e.target.value) || 0 })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="period" className="text-sm font-medium">
                                        Period
                                    </Label>
                                    <Select
                                        value={plan.period || ""}
                                        onValueChange={(value) => onChange({ ...plan, period: value })}
                                    >
                                        <SelectTrigger id="period" className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                            <SelectItem value="LIFETIME">Lifetime</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Styling Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                                Styling
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gradient-color" className="text-sm font-medium">
                                        Gradient Color
                                    </Label>
                                    <Input
                                        id="gradient-color"
                                        value={plan.color || ""}
                                        onChange={(e) => onChange({ ...plan, color: e.target.value })}
                                        placeholder="from-blue-500 to-cyan-500"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bg-color" className="text-sm font-medium">
                                        Background Color
                                    </Label>
                                    <Input
                                        id="bg-color"
                                        value={plan.bgColor || ""}
                                        onChange={(e) => onChange({ ...plan, bgColor: e.target.value })}
                                        placeholder="bg-blue-50"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="border-color" className="text-sm font-medium">
                                        Border Color
                                    </Label>
                                    <Input
                                        id="border-color"
                                        value={plan.borderColor || ""}
                                        onChange={(e) => onChange({ ...plan, borderColor: e.target.value })}
                                        placeholder="border-blue-200"
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Limits Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                                Usage Limits
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max-accounts" className="text-sm font-medium">
                                        Max Accounts
                                    </Label>
                                    <Input
                                        id="max-accounts"
                                        min={0}
                                        type="number"
                                        value={plan.maxAccounts || ""}
                                        onChange={(e) => onChange({ ...plan, maxAccounts: parseInt(e.target.value) || 1 })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-dm" className="text-sm font-medium">
                                        Max DM/Month
                                    </Label>
                                    <Input
                                        id="max-dm"
                                        min={0}
                                        type="number"
                                        value={plan.maxDMPerMonth || ""}
                                        onChange={(e) => onChange({ ...plan, maxDMPerMonth: parseInt(e.target.value) || 0 })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-ai-reply" className="text-sm font-medium">
                                        Max AI Reply/Month
                                    </Label>
                                    <Input
                                        id="max-ai-reply"
                                        min={0}
                                        type="number"
                                        value={plan.maxAIReplyPerMonth}
                                        onChange={(e) => onChange({ ...plan, maxAIReplyPerMonth: parseInt(e.target.value) || 0 })}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Badge Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                                Badge Settings
                            </h3>
                            <div className="flex items-end gap-6">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="popular-plan"
                                        checked={plan.popular || false}
                                        onCheckedChange={(checked) => onChange({ ...plan, popular: checked })}
                                    />
                                    <Label htmlFor="popular-plan" className="text-sm font-medium">
                                        Popular Plan
                                    </Label>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="badge-text" className="text-sm font-medium">
                                        Badge Text
                                    </Label>
                                    <Input
                                        id="badge-text"
                                        value={plan.badge || ""}
                                        onChange={(e) => onChange({ ...plan, badge: e.target.value })}
                                        placeholder="MOST POPULAR, BEST VALUE"
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                                Features
                            </h3>
                            <div className="space-y-6">
                                {/* Included Features */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-green-700">
                                            Included Features
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFeatureAdd("included")}
                                            className="h-8 px-3"
                                        >
                                            + Add Feature
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {(plan.features?.included || []).map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={feature}
                                                        onChange={(e) => handleFeatureUpdate("included", index, e.target.value)}
                                                        placeholder="✓ Enter feature description..."
                                                        className="h-9"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFeatureRemove("included", index)}
                                                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                        {(!plan.features?.included || plan.features.included.length === 0) && (
                                            <p className="text-sm text-gray-500 italic">
                                                No included features yet. Click "Add Feature" to add some.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Not Included Features */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-red-700">
                                            Not Included Features
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFeatureAdd("notIncluded")}
                                            className="h-8 px-3"
                                        >
                                            + Add Feature
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {(plan.features?.notIncluded || []).map((feature: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={feature}
                                                        onChange={(e) => handleFeatureUpdate("notIncluded", index, e.target.value)}
                                                        placeholder="✗ Enter feature description..."
                                                        className="h-9"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFeatureRemove("notIncluded", index)}
                                                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                        {(!plan.features?.notIncluded || plan.features.notIncluded.length === 0) && (
                                            <p className="text-sm text-gray-500 italic">
                                                No excluded features yet. Click "Add Feature" to add some.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isSaving}
                                className="px-6"
                            >
                                {isSaving ? "Saving..." : "Save Plan"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}