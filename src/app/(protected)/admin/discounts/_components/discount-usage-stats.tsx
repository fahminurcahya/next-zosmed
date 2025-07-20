import { Card, CardAction, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

interface DiscountUsageStatsProps {
    discounts: any,
    isLoading: boolean
}

export function DiscountUsageStats(
    {
        discounts,
        isLoading
    }: DiscountUsageStatsProps
) {

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalDiscounts = discounts?.total || 0;
    const activeDiscounts = discounts?.discounts?.filter((d: any) => d.isActive).length || 0;
    const totalUsages = discounts?.discounts?.reduce((sum: number, d: any) => sum + d._count.usages, 0) || 0;
    const averageUsage = totalDiscounts > 0 ? (totalUsages / totalDiscounts).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalDiscounts}</div>
                    <p className="text-sm text-gray-600">Total Discounts</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{activeDiscounts}</div>
                    <p className="text-sm text-gray-600">Active Discounts</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{totalUsages}</div>
                    <p className="text-sm text-gray-600">Total Usage</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">{averageUsage}</div>
                    <p className="text-sm text-gray-600">Avg Usage/Code</p>
                </CardContent>
            </Card>
        </div>
    );
}