import { type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertCircle,
    TrendingUp,
    Users,
    MessageSquare,
    Bot,
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
    isLoading?: boolean;
}

// Loading Skeleton for Usage Card
const UsageCardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-4 w-16 mb-1" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            ))}
            <Skeleton className="h-4 w-48" />
        </CardContent>
    </Card>
);

// Animation variants
const cardVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: {
        opacity: 0,
        x: -20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
        }
    }
};

const progressVariants = {
    hidden: {
        width: 0
    },
    visible: (percentage: number) => ({
        width: `${Math.min(100, percentage)}%`,
        transition: {
            duration: 1.2,
            ease: "easeOut",
            delay: 0.3
        }
    })
};

const alertVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        height: "auto",
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        height: 0,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

export const UsageCard: FC<UsageCardProps> = ({
    subscription,
    usage,
    showUpgradePrompt = true,
    onUpgrade,
    className,
    isLoading = false
}) => {
    if (isLoading) {
        return <UsageCardSkeleton />;
    }

    const hasWarnings = usage.dm.nearLimit || usage.ai.nearLimit;
    const hasAnyLimit = usage.dm.percentage >= 100 || usage.ai.percentage >= 100;


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 30 }
            }}
        >
            <Card className={cn("overflow-hidden", className)}>
                <CardHeader>
                    <motion.div
                        className="flex items-start justify-between"
                    >
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Current Usage
                                <AnimatePresence>
                                    {hasWarnings && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30
                                                }
                                            }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <Badge variant="warning" className="animate-pulse">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Near Limit
                                            </Badge>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardTitle>
                        </div>
                    </motion.div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Instagram Accounts */}
                    <motion.div >
                        <UsageItem
                            icon={Users}
                            label="Instagram Accounts"
                            used={usage.accounts.used}
                            limit={usage.accounts.limit}
                            percentage={usage.accounts.percentage}
                            nearLimit={usage.accounts.nearLimit}
                            type="accounts"
                        />
                    </motion.div>

                    {/* Auto DM */}
                    <motion.div >
                        <UsageItem
                            icon={MessageSquare}
                            label="Auto DM Sent"
                            used={usage.dm.used}
                            limit={usage.dm.limit}
                            percentage={usage.dm.percentage}
                            nearLimit={usage.dm.nearLimit}
                            type="dm"
                            showDailyRate
                        />
                    </motion.div>

                    {/* AI Replies */}
                    {subscription.hasAIReply && (
                        <motion.div >
                            <UsageItem
                                icon={Bot}
                                label="AI Replies"
                                used={usage.ai.used}
                                limit={usage.ai.limit}
                                percentage={usage.ai.percentage}
                                nearLimit={usage.ai.nearLimit}
                                type="ai"
                            />
                        </motion.div>
                    )}



                    {subscription.planDisplayName.toUpperCase() != 'FREE' && <motion.div

                        className="text-sm text-gray-600"
                    >
                        <p>
                            Usage resets on: {subscription?.dmResetDate ? format(new Date(subscription.dmResetDate), "dd MMM yyyy") : "-"}
                        </p>
                    </motion.div>}


                    {/* Upgrade Alerts */}
                    <AnimatePresence>
                        {hasAnyLimit && showUpgradePrompt && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        You have reached your usage limit. Upgrade your plan to continue.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {hasWarnings && !hasAnyLimit && showUpgradePrompt && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertDescription className="flex items-center justify-between">
                                        <span>Approaching usage limit. Consider upgrading.</span>
                                        {onUpgrade && (
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button size="sm" variant="link" onClick={onUpgrade} className="p-0 h-auto">
                                                    View Plans
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Sub-component with enhanced animations
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
        <motion.div
            className="space-y-2"
            whileHover={{
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 30 }
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.div
                        className={cn(
                            "p-1.5 rounded-lg transition-colors duration-200",
                            nearLimit ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                        )}
                        whileHover={{
                            scale: 1.1,
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.3 }
                        }}
                    >
                        <Icon className="h-4 w-4" />
                    </motion.div>
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="text-right">
                    <motion.span
                        className={cn("text-sm font-semibold transition-colors duration-200", getTextColor())}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {used.toLocaleString("en-US")} / {limit.toLocaleString("en-US")}
                    </motion.span>
                    {showDailyRate && dailyRate > 0 && (
                        <motion.p
                            className="text-xs text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            ~{dailyRate}/day
                        </motion.p>
                    )}
                </div>
            </div>

            <div className="relative">
                <Progress
                    value={Math.min(100, percentage)}
                    className="h-2"
                />
                <motion.div
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full",
                        getProgressColor()
                    )}
                    initial="hidden"
                    animate="visible"
                    custom={percentage}
                />
            </div>

            <motion.div
                className="flex justify-between text-xs text-gray-500"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <span>{percentage}% used</span>
                {limit - used > 0 ? (
                    <span>{(limit - used).toLocaleString("en-US")} remaining</span>
                ) : (
                    <motion.span
                        className="text-red-600 font-medium"
                        animate={{
                            scale: [1, 1.05, 1],
                            transition: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        Limit reached
                    </motion.span>
                )}
            </motion.div>
        </motion.div>
    );
};