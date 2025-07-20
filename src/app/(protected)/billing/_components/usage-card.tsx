import { type FC } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    TrendingUp,
    Users,
    MessageSquare,
    Bot,
    Calendar,
    Zap,
    ArrowRight
} from "lucide-react";
import type { FormattedSubscription } from "@/types/billing.type";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";

interface UsageData {
    accounts: {
        used: number;
        limit: number;
        percentage: number;
        nearLimit: boolean;
    };
    dm: {
        used: number;
        limit: number;
        percentage: number;
        nearLimit: boolean;
    };
    ai: {
        used: number;
        limit: number;
        percentage: number;
        nearLimit: boolean;
    };
}

interface UsageCardProps {
    subscription: FormattedSubscription;
    usage: UsageData;
    showUpgradePrompt?: boolean;
    onUpgrade?: () => void;
    className?: string;
}

export const UsageCard: FC<UsageCardProps> = ({
    subscription,
    usage,
    showUpgradePrompt = true,
    onUpgrade,
    className
}) => {
    const hasWarnings = usage.accounts.nearLimit || usage.dm.nearLimit || usage.ai.nearLimit;
    const hasAnyLimit = usage.accounts.percentage >= 100 || usage.dm.percentage >= 100 || usage.ai.percentage >= 100;

    // Calculate days until reset
    const daysUntilReset = Math.ceil(
        (new Date(subscription.dmResetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Current Usage
                            {hasWarnings && (
                                <Badge variant="warning" className="animate-pulse">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Near Limit
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {subscription.planDisplayName} Plan • Reset dalam {daysUntilReset} hari
                        </CardDescription>
                    </div>
                    {hasWarnings && showUpgradePrompt && onUpgrade && (
                        <Button size="sm" variant="outline" onClick={onUpgrade}>
                            <Zap className="h-3 w-3 mr-1" />
                            Upgrade
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Instagram Accounts */}
                <UsageItem
                    icon={Users}
                    label="Instagram Accounts"
                    used={usage.accounts.used}
                    limit={usage.accounts.limit}
                    percentage={usage.accounts.percentage}
                    nearLimit={usage.accounts.nearLimit}
                    type="accounts"
                />

                {/* Auto DM */}
                <UsageItem
                    icon={MessageSquare}
                    label="Auto DM Terkirim"
                    used={usage.dm.used}
                    limit={usage.dm.limit}
                    percentage={usage.dm.percentage}
                    nearLimit={usage.dm.nearLimit}
                    type="dm"
                    showDailyRate
                />

                {/* AI Replies */}
                {subscription.hasAIReply && (
                    <UsageItem
                        icon={Bot}
                        label="AI Replies"
                        used={usage.ai.used}
                        limit={usage.ai.limit}
                        percentage={usage.ai.percentage}
                        nearLimit={usage.ai.nearLimit}
                        type="ai"
                    />
                )}

                {/* Usage Summary */}
                <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Period:</span>
                        </div>
                        <span className="font-medium">
                            {format(addDays(new Date(subscription.dmResetDate), -30), "dd MMM", { locale: id })} -
                            {format(new Date(subscription.dmResetDate), "dd MMM yyyy", { locale: id })}
                        </span>
                    </div>
                </div>

                {/* Upgrade Alert */}
                {hasAnyLimit && showUpgradePrompt && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Anda telah mencapai batas penggunaan. Upgrade plan untuk melanjutkan.
                        </AlertDescription>
                    </Alert>
                )}

                {hasWarnings && !hasAnyLimit && showUpgradePrompt && (
                    <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>Mendekati batas usage. Pertimbangkan untuk upgrade.</span>
                            {onUpgrade && (
                                <Button size="sm" variant="link" onClick={onUpgrade} className="p-0 h-auto">
                                    Lihat Plans
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

// Sub-component
interface UsageItemProps {
    icon: FC<{ className?: string }>;
    label: string;
    used: number;
    limit: number;
    percentage: number;
    nearLimit: boolean;
    type: "accounts" | "dm" | "ai";
    showDailyRate?: boolean;
}

const UsageItem: FC<UsageItemProps> = ({
    icon: Icon,
    label,
    used,
    limit,
    percentage,
    nearLimit,
    type,
    showDailyRate = false
}) => {
    const getProgressColor = () => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-yellow-500";
        return "bg-blue-500";
    };

    const getTextColor = () => {
        if (percentage >= 100) return "text-red-600";
        if (percentage >= 80) return "text-yellow-600";
        return "text-gray-600";
    };

    const dailyRate = showDailyRate && limit > 0
        ? Math.floor(used / Math.max(1, new Date().getDate()))
        : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-lg",
                        nearLimit ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="text-right">
                    <span className={cn("text-sm font-semibold", getTextColor())}>
                        {used.toLocaleString("id-ID")} / {limit.toLocaleString("id-ID")}
                    </span>
                    {showDailyRate && dailyRate > 0 && (
                        <p className="text-xs text-gray-500">
                            ~{dailyRate}/hari
                        </p>
                    )}
                </div>
            </div>

            <div className="relative">
                <Progress
                    value={Math.min(100, percentage)}
                    className="h-2"
                />
                <div
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all",
                        getProgressColor()
                    )}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage}% digunakan</span>
                {limit - used > 0 ? (
                    <span>{(limit - used).toLocaleString("id-ID")} tersisa</span>
                ) : (
                    <span className="text-red-600 font-medium">Limit tercapai</span>
                )}
            </div>
        </div>
    );
};