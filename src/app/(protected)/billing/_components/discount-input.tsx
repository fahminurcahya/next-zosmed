import { type FC, type ChangeEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Check,
    AlertCircle,
    Loader2,
    Tag,
    X,
    Sparkles
} from "lucide-react";
import type { DiscountValidation } from "@/types/billing.type";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/billing";

interface DiscountInputProps {
    value: string;
    onChange: (value: string) => void;
    validation?: DiscountValidation | null;
    isValidating?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    showSavings?: boolean;
    originalAmount?: number;
}

export const DiscountInput: FC<DiscountInputProps> = ({
    value,
    onChange,
    validation,
    isValidating = false,
    disabled = false,
    placeholder = "Masukkan kode diskon",
    className,
    showSavings = true,
    originalAmount = 0,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        onChange(newValue);
        setHasInteracted(true);
    };

    const handleClick = (newValue: string) => {
        onChange(newValue);
        setHasInteracted(true);
    };

    const handleClear = () => {
        onChange("");
        setHasInteracted(false);
    };

    // Example discount codes for development
    const exampleCodes = process.env.NODE_ENV === "development"
        ? ["EARLY50", "WELCOME20", "PROMO30"]
        : [];

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={value}
                            onChange={handleChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn(
                                "pl-10 pr-10 uppercase font-mono",
                                isFocused && "ring-2 ring-blue-500",
                                validation?.valid && "border-green-500",
                                validation && !validation.valid && hasInteracted && value && "border-red-500"
                            )}
                            maxLength={20}
                        />
                        {value && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center min-w-[120px]">
                        {isValidating && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Checking...</span>
                            </div>
                        )}
                        {!isValidating && validation?.valid && (
                            <Badge variant="success" className="flex items-center gap-1 animate-in fade-in">
                                <Check className="h-3 w-3" />
                                {validation.discount?.value}% OFF
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {validation?.valid && validation.discount && showSavings && originalAmount > 0 && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {validation.discount.description || "Kode diskon berhasil diterapkan!"}
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    Anda hemat {formatPrice(validation.calculation?.discountAmount || 0, "IDR")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {validation && !validation.valid && hasInteracted && value && !isValidating && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{validation.error}</AlertDescription>
                    </Alert>
                )}

                {/* Development Example Codes */}
                {process.env.NODE_ENV === "development" && exampleCodes.length > 0 && !value && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-1">
                            Dev Mode - Example codes:
                        </p>
                        <div className="flex gap-1">
                            {exampleCodes.map(code => (
                                <Button
                                    key={code}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleClick(code)}
                                    className="text-xs h-6 px-2"
                                >
                                    {code}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Helper Text */}
            {!validation && !hasInteracted && (
                <p className="text-xs text-gray-500">
                    Punya kode diskon? Masukkan di sini untuk mendapatkan potongan harga
                </p>
            )}
        </div>
    );
};