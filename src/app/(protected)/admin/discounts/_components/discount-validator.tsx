import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/trpc/react';

interface DiscountValidatorProps {
    plan: 'FREE' | 'STARTER' | 'PRO';
    amount: number;
    onDiscountApplied?: (discount: any) => void;
}

export function DiscountValidator({ plan, amount, onDiscountApplied }: DiscountValidatorProps) {
    const [discountCode, setDiscountCode] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);

    const validateDiscount = api.discount.validate.useQuery(
        { code: discountCode, plan, amount },
        { enabled: false }
    );

    React.useEffect(() => {
        if (validateDiscount.data) {
            setValidationResult(validateDiscount.data);
            if (validateDiscount.data.valid && onDiscountApplied) {
                onDiscountApplied(validateDiscount.data);
            }
        }
        if (validateDiscount.error) {
            setValidationResult({ valid: false, error: validateDiscount.error.message });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateDiscount.data, validateDiscount.error]);

    const handleValidate = () => {
        if (!discountCode.trim()) return;
        setValidationResult(null);
        validateDiscount.refetch();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Discount Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="discount-code">Enter discount code</Label>
                        <Input
                            id="discount-code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                            placeholder="e.g., SAVE20"
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleValidate} disabled={!discountCode.trim() || validateDiscount.isLoading}>
                            {validateDiscount.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Apply'
                            )}
                        </Button>
                    </div>
                </div>

                {validationResult && (
                    <Alert className={validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        <div className="flex items-center gap-2">
                            {validationResult.valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <AlertDescription className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                                {validationResult.valid ? (
                                    <div className="space-y-2">
                                        <p className="font-medium">Discount Applied Successfully!</p>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Code:</strong> {validationResult.discount.code}</p>
                                            <p><strong>Description:</strong> {validationResult.discount.description}</p>
                                            <p><strong>Discount:</strong> {formatCurrency(validationResult.calculation.discountAmount)}</p>
                                            <p><strong>Final Amount:</strong> {formatCurrency(validationResult.calculation.finalAmount)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    validationResult.error || 'Invalid discount code'
                                )}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}