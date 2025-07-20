"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api } from "@/trpc/react";
import PlanFormDialog from "./_components/plan-form-dialog";
import PlanTable from "./_components/plan-table";
import PlanPreview from "./_components/plan-preview";
import type { PricingPlan } from "@prisma/client";

export default function PlanAdminPage() {
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const plansQuery = api.planAdmin.list.useQuery({ includeInactive: true });
    const upsertPlanMutation = api.planAdmin.upsert.useMutation({
        onSuccess: () => {
            toast.success("Plan saved successfully");
            setIsDialogOpen(false);
            setEditingPlan(null);
            plansQuery.refetch();
        },
        onError: (error) => toast.error(error.message),
    });
    const toggleStatusMutation = api.planAdmin.toggleStatus.useMutation({
        onSuccess: () => {
            toast.success("Plan status updated");
            plansQuery.refetch();
        },
    });
    const seedDefaultsMutation = api.planAdmin.seedDefaults.useMutation({
        onSuccess: () => {
            toast.success("Default plans created");
            plansQuery.refetch();
        },
    });

    const handleEditPlan = (plan?: PricingPlan) => {
        if (plan) {
            setEditingPlan({
                ...plan,
                features:
                    typeof plan.features === "string"
                        ? JSON.parse(plan.features)
                        : plan.features,
            });
        } else {
            setEditingPlan({
                name: "",
                displayName: "",
                price: 0,
                period: "MONTHLY",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                maxAccounts: 1,
                maxDMPerMonth: 100,
                maxAIReplyPerMonth: 0,
                features: { included: [], notIncluded: [] },
            });
        }
        setIsDialogOpen(true);
    };

    const handleSavePlan = () => {
        if (!editingPlan) return;
        if (editingPlan.features != null) {
            setEditingPlan({
                ...editingPlan,
                features: { included: [], notIncluded: [] },
            });
        }
        upsertPlanMutation.mutate(editingPlan);
    };

    const plans = plansQuery.data || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pricing Plans Management</h1>
                    <p className="text-gray-600">Manage subscription plans and features</p>
                </div>
                <div className="flex gap-2">
                    {plans.length === 0 && (
                        <Button variant="outline" onClick={() => seedDefaultsMutation.mutate()}>
                            Seed Default Plans
                        </Button>
                    )}
                    <Button onClick={() => handleEditPlan()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Plan
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="plans">
                <TabsList>
                    <TabsTrigger value="plans">Plans</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="plans">
                    <PlanTable
                        plans={plans}
                        onEdit={handleEditPlan}
                        onToggleStatus={(id: string) => toggleStatusMutation.mutate(id)}
                    />
                </TabsContent>
                <TabsContent value="preview">
                    <PlanPreview plans={plans} />
                </TabsContent>
            </Tabs>

            <PlanFormDialog
                open={isDialogOpen}
                plan={editingPlan}
                isSaving={upsertPlanMutation.isPending}
                onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingPlan(null);
                }}
                onChange={setEditingPlan}
                onSave={handleSavePlan}
            />
        </div>
    );
}
