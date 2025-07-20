import { type FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
    ArrowRight,
    Zap,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingAlertProps {
    type: "info" | "warning" | "error" | "success" | "upgrade";
    title?: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export const BillingAlert: FC<BillingAlertProps> = ({
    type,
    title,
    description,
    action,
    className,
    dismissible = false,
    onDismiss
}) => {
    const configs = {
        info: {
            icon: Info,
            variant: "default" as const,
            defaultTitle: "Information"
        },
        warning: {
            icon: AlertCircle,
            variant: "warning" as const,
            defaultTitle: "Warning"
        },
        error: {
            icon: XCircle,
            variant: "destructive" as const,
            defaultTitle: "Error"
        },
        success: {
            icon: CheckCircle,
            variant: "default" as const,
            defaultTitle: "Success"
        },
        upgrade: {
            icon: Zap,
            variant: "default" as const,
            defaultTitle: "Upgrade Required",
            className: "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <Alert
            variant={config.variant}
            className={cn(
                type === "upgrade" ? configs.upgrade.className : undefined,
                className
            )}
        >
            <Icon className="h-4 w-4" />
            <div className="flex-1">
                {(title || config.defaultTitle) && (
                    <AlertTitle>{title || config.defaultTitle}</AlertTitle>
                )}
                <AlertDescription className="flex items-start justify-between gap-4">
                    <span>{description}</span>
                    {action && (
                        <Button
                            size="sm"
                            variant={type === "upgrade" ? "default" : "outline"}
                            onClick={action.onClick}
                            className="shrink-0"
                        >
                            {action.label}
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    )}
                </AlertDescription>
            </div>
            {dismissible && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Alert>
    );
};