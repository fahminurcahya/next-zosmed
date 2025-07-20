
import { type FC } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import type { PaymentStatus } from "@prisma/client";
import { getPaymentStatusConfig } from "@/lib/billing";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    showIcon?: boolean;
    size?: "sm" | "default" | "lg";
    className?: string;
}

export const PaymentStatusBadge: FC<PaymentStatusBadgeProps> = ({
    status,
    showIcon = true,
    size = "default",
    className
}) => {
    const config = getPaymentStatusConfig(status);

    const icons = {
        CheckCircle,
        Clock,
        XCircle,
        RefreshCw,
        AlertCircle,
    };

    const Icon = icons[config.icon as keyof typeof icons] || Clock;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        default: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1"
    };

    const iconSizes = {
        sm: "h-3 w-3",
        default: "h-3.5 w-3.5",
        lg: "h-4 w-4"
    };

    return (
        <Badge
            variant={config.variant as any}
            className={cn(
                "inline-flex items-center gap-1",
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {config.label}
        </Badge>
    );
};