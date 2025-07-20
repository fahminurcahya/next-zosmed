"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { api } from "@/trpc/react";

export default function FeatureManagement() {
    const featuresQuery = api.planAdmin.features.list.useQuery();
    const features = featuresQuery.data || [];

    const categories = Array.from(new Set(features.map((f) => f.category)));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feature Library</CardTitle>
                <CardDescription>
                    Manage available features for plans
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {categories.map((category) => (
                        <div key={category}>
                            <h3 className="font-semibold capitalize mb-2 text-gray-700">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {features
                                    .filter((f) => f.category === category)
                                    .map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex items-center justify-between p-3 border rounded-md"
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{feature.name}</p>
                                                <p className="text-xs text-muted-foreground">{feature.key}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}