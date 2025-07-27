import { type FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, X, Star } from "lucide-react";
import type { FormattedPlan } from "@/types/billing.type";
import { cn } from "@/lib/utils";
import { comparePlans } from "@/lib/billing";
import React from "react";

interface PlanComparisonTableProps {
    plans: FormattedPlan[];
    selectedPlanId?: string | null;
    onSelectPlan?: (planId: string) => void;
    currentPlanId?: string;
    className?: string;
}

export const PlanComparisonTable: FC<PlanComparisonTableProps> = ({
    plans,
    selectedPlanId,
    onSelectPlan,
    currentPlanId,
    className,
}) => {
    const comparison = comparePlans(plans);

    console.log(comparison)

    // Group features by category
    const featureCategories = [
        { name: "Limits", features: ["Instagram Accounts", "Auto DM per Month", "AI Replies per Month"] },
        { name: "Features", features: comparison.filter(f => f.feature.toLowerCase().includes("workflow") || f.feature.toLowerCase().includes("intent")).map(f => f.feature) },
        { name: "Analytics & Support", features: comparison.filter(f => f.feature.toLowerCase().includes("analytic") || f.feature.toLowerCase().includes("support") || f.feature.toLowerCase().includes("dashboard")).map(f => f.feature) },
    ];

    return (
        <Card className={cn("overflow-hidden", className)}>
            <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-gray-800">
                                <th className="text-left p-4 font-medium min-w-[200px]">Features</th>
                                {plans.map((plan) => (
                                    <th key={plan.id} className="p-4 text-center min-w-[200px]">
                                        <div
                                            className={cn(
                                                "cursor-pointer rounded-lg p-4 transition-all",
                                                selectedPlanId === plan.id && "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500",
                                                currentPlanId === plan.id && "opacity-75"
                                            )}
                                            onClick={() => onSelectPlan?.(plan.id)}
                                        >
                                            {plan.visual.popular && plan.visual.badge && (
                                                <Badge className="mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {plan.visual.badge}
                                                </Badge>
                                            )}
                                            <h3 className="font-semibold text-lg">{plan.displayName}</h3>
                                            <div className="mt-2">
                                                <p className="text-2xl font-bold">{plan.price}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.period}</p>
                                            </div>
                                            {currentPlanId === plan.id && (
                                                <Badge variant="outline" className="mt-2">Plan Saat Ini</Badge>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Core Limits */}
                            <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                                <td colSpan={plans.length + 1} className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">
                                    LIMITS & KUOTA
                                </td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">Instagram Accounts</td>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="p-4 text-center">
                                        <span className="text-lg font-semibold">{plan.limits.maxAccounts}</span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">Auto DM per Bulan</td>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="p-4 text-center">
                                        <span className="text-lg font-semibold">
                                            {plan.limits.maxDMPerMonth.toLocaleString("id-ID")}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">AI Replies per Bulan</td>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="p-4 text-center">
                                        <span className="text-lg font-semibold">
                                            {plan.limits.maxAIReplyPerMonth.toLocaleString("id-ID")}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Feature Categories */}
                            {featureCategories.map((category) => {
                                const categoryFeatures = comparison.filter(f =>
                                    category.features.includes(f.feature)
                                );

                                if (categoryFeatures.length === 0) return null;

                                return (
                                    <React.Fragment key={category.name}>
                                        <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                                            <td colSpan={plans.length + 1} className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">
                                                {category.name.toUpperCase()}
                                            </td>
                                        </tr>
                                        {categoryFeatures.map(({ feature, availability }, idx) => (
                                            <tr key={`${category.name}-${idx}`} className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                                <td className="p-4">{feature}</td>
                                                {plans.map((plan) => (
                                                    <td key={plan.id} className="p-4 text-center">
                                                        {availability[plan.id] ? (
                                                            <div className="inline-flex items-center justify-center">
                                                                <Check className="h-5 w-5 text-green-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center justify-center">
                                                                <X className="h-5 w-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <td className="p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pilih plan yang sesuai dengan kebutuhan Anda
                                    </p>
                                </td>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="p-4">
                                        <Button
                                            className={cn(
                                                "w-full",
                                                selectedPlanId === plan.id && "bg-blue-600 hover:bg-blue-700"
                                            )}
                                            variant={selectedPlanId === plan.id ? "default" : "outline"}
                                            disabled={currentPlanId === plan.id}
                                            onClick={() => onSelectPlan?.(plan.id)}
                                        >
                                            {currentPlanId === plan.id
                                                ? "Plan Saat Ini"
                                                : selectedPlanId === plan.id
                                                    ? "✓ Dipilih"
                                                    : "Pilih Plan"}
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </Card>
    );
};