import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, GripVertical, Users, MessageSquare, Bot } from "lucide-react";

interface PlanTableProps {
    plans: any[];
    onEdit: (plan: any) => void;
    onToggleStatus: (id: string) => void;
}

export default function PlanTable({ plans, onEdit, onToggleStatus }: PlanTableProps) {
    return (
        <div className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Limits</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plans.map((plan) => (
                        <TableRow key={plan.id}>
                            <TableCell>
                                <GripVertical className="h-4 w-4 text-gray-400" />
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{plan.displayName}</p>
                                    <p className="text-sm text-gray-500">{plan.name}</p>
                                    {plan.popular && (
                                        <Badge variant="secondary" className="mt-1">Popular</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium">
                                        {plan.price === 0 ? "Free" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                                    </p>
                                    <p className="text-sm text-gray-500">{plan.period}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {plan.maxAccounts} accounts
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {plan.maxDMPerMonth.toLocaleString()} DM/mo
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Bot className="h-3 w-3" />
                                        {plan.maxAIReplyPerMonth.toLocaleString()} AI/mo
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={plan.isActive}
                                    onCheckedChange={() => onToggleStatus(plan.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(plan)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
