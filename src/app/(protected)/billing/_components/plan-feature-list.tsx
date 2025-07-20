import { type FC } from "react";
import { Check, X, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Feature {
    name: string;
    included: boolean;
    tooltip?: string;
    value?: string | number;
}

interface PlanFeatureListProps {
    features: Feature[];
    variant?: "compact" | "detailed";
    showNotIncluded?: boolean;
    className?: string;
}

export const PlanFeatureList: FC<PlanFeatureListProps> = ({
    features,
    variant = "compact",
    showNotIncluded = true,
    className
}) => {
    const includedFeatures = features.filter(f => f.included);
    const notIncludedFeatures = features.filter(f => !f.included);

    const renderFeature = (feature: Feature, index: number) => (
        <div
            key={index}
            className={cn(
                "flex items-start gap-2",
                variant === "compact" ? "text-sm" : "text-base py-1"
            )}
        >
            {feature.included ? (
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
                <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
                <span className={cn(
                    !feature.included && "text-gray-400 line-through"
                )}>
                    {feature.name}
                    {feature.value && ` (${feature.value})`}
                </span>
                {feature.tooltip && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="inline-block h-3 w-3 ml-1 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{feature.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );

    return (
        <div className={cn("space-y-2", className)}>
            {includedFeatures.map(renderFeature)}
            {showNotIncluded && notIncludedFeatures.length > 0 && (
                <>
                    {includedFeatures.length > 0 && (
                        <div className="my-3 border-t" />
                    )}
                    {notIncludedFeatures.map(renderFeature)}
                </>
            )}
        </div>
    );
};