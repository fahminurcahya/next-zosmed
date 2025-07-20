import { type FC } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, MessageSquare, Bot, Sparkles } from "lucide-react";
import type { FormattedPlan } from "@/types/billing.type";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/billing";

interface PlanCardProps {
    plan: FormattedPlan;
    isSelected?: boolean;
    isCurrentPlan?: boolean;
    onSelect?: (planId: string) => void;
    showComparison?: boolean;
    comparisonPrice?: number;
    className?: string;
}

export const PlanCard: FC<PlanCardProps> = ({
    plan,
    isSelected = false,
    isCurrentPlan = false,
    onSelect,
    showComparison = false,
    comparisonPrice = 0,
    className,
}) => {
    const priceDifference = plan.priceNumber - comparisonPrice;

    return (
        <Card
            className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-blue-500 shadow-lg",
                plan.visual.popular && "scale-105",
                isCurrentPlan && "opacity-75 cursor-default",
                className
            )}
            onClick={() => !isCurrentPlan && onSelect?.(plan.id)}
        >
            {/* Popular Badge */}
            {plan.visual.popular && plan.visual.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {plan.visual.badge}
                    </Badge>
                </div>
            )}

            <div className={cn("h-full", plan.visual.bgColor)}>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                    {plan.description && (
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Price */}
                    <div>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            <span className="text-gray-600 ml-2">{plan.period}</span>
                        </div>
                        {showComparison && priceDifference > 0 && (
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                <span className="mr-1">+</span>
                                {formatPrice(priceDifference, "IDR")} dari plan saat ini
                            </p>
                        )}
                        {isCurrentPlan && (
                            <Badge variant="secondary" className="mt-2">
                                Plan Anda Saat Ini
                            </Badge>
                        )}
                    </div>

                    {/* Key Limits */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <LimitBadge
                            icon={Users}
                            value={plan.limits.maxAccounts}
                            label="Akun"
                        />
                        <LimitBadge
                            icon={MessageSquare}
                            value={plan.limits.maxDMPerMonth}
                            label="DM/bln"
                            format="k"
                        />
                        <LimitBadge
                            icon={Bot}
                            value={plan.limits.maxAIReplyPerMonth}
                            label="AI/bln"
                            format="k"
                        />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                        {plan.features.included.slice(0, 5).map((feature, idx) => (
                            <FeatureItem key={idx} feature={feature} included={true} />
                        ))}
                        {plan.features.notIncluded.length > 0 && (
                            <>
                                <div className="my-2 border-t pt-2" />
                                {plan.features.notIncluded.slice(0, 2).map((feature, idx) => (
                                    <FeatureItem key={`not-${idx}`} feature={feature} included={false} />
                                ))}
                            </>
                        )}
                        {(plan.features.included.length > 5 || plan.features.notIncluded.length > 2) && (
                            <p className="text-sm text-gray-600 text-center pt-2">
                                +{plan.features.included.length - 5 + plan.features.notIncluded.length - 2} fitur lainnya
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-4">
                    <Button
                        className={cn(
                            "w-full",
                            plan.visual.popular && !isCurrentPlan && `bg-gradient-to-r ${plan.visual.color} text-white hover:opacity-90`
                        )}
                        variant={isSelected && !plan.visual.popular ? "default" : "outline"}
                        disabled={isCurrentPlan}
                        size="lg"
                    >
                        {isCurrentPlan
                            ? "Plan Saat Ini"
                            : isSelected
                                ? "✓ Dipilih"
                                : plan.cta || "Pilih Plan"}
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
};

// Sub-components
interface LimitBadgeProps {
    icon: FC<{ className?: string }>;
    value: number;
    label: string;
    format?: "number" | "k";
}

const LimitBadge: FC<LimitBadgeProps> = ({
    icon: Icon,
    value,
    label,
    format = "number"
}) => {
    const displayValue = format === "k" && value >= 1000
        ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
        : value.toString();

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <Icon className="h-5 w-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
            <p className="text-lg font-semibold">{displayValue}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
};

interface FeatureItemProps {
    feature: string;
    included: boolean;
}

const FeatureItem: FC<FeatureItemProps> = ({ feature, included }) => (
    <div className="flex items-start text-sm">
        <Check
            className={cn(
                "h-4 w-4 mr-2 mt-0.5 flex-shrink-0",
                included ? "text-green-500" : "text-gray-300"
            )}
        />
        <span className={cn(!included && "line-through text-gray-400")}>
            {feature}
        </span>
    </div>
);