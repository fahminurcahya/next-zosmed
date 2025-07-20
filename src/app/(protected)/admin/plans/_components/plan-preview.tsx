"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlanPreviewProps {
    plans: any[];
}

export default function PlanPreview({ plans }: PlanPreviewProps) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                        See how plans will appear to users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans
                            .filter((p) => p.isActive)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((plan) => {
                                const features =
                                    typeof plan.features === "string"
                                        ? JSON.parse(plan.features)
                                        : plan.features;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-lg p-6 ${plan.bgColor} border-2 ${plan.borderColor}`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <Badge className={`bg-gradient-to-r ${plan.color} text-white`}>
                                                    {plan.badge || "POPULAR"}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold">{plan.displayName}</h3>
                                            <div className="mt-4">
                                                <span className="text-3xl font-bold">
                                                    {plan.price === 0
                                                        ? "Gratis"
                                                        : `Rp ${(plan.price / 1000).toFixed(0)}k`}
                                                </span>
                                                <span className="text-gray-600">
                                                    /{plan.period.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {features.included.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start">
                                                    <span className="text-green-500 mr-2">✓</span>
                                                    <span className="text-sm">{feature}</span>
                                                </div>
                                            ))}
                                            {features.notIncluded.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start opacity-50">
                                                    <span className="text-gray-400 mr-2">✗</span>
                                                    <span className="text-sm line-through">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button className={`w-full mt-6 bg-gradient-to-r ${plan.color} text-white`}>
                                            {plan.price === 0 ? "Mulai Gratis" : "Pilih Plan"}
                                        </Button>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
