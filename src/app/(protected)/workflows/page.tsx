// app/workflows/page.tsx
'use client'
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Filter, Zap, MessageCircle,
    BarChart3, Clock, AlertCircle, MoreVertical,
    PlayCircle, PauseCircle, Copy, Trash2, Edit,
    Instagram, TrendingUp, Activity
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { WorkflowTriggerType } from "@prisma/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import useConfirm from "@/hooks/use-confirm";
import React from "react";
import CreateWorkflowDialog from "./_components/create-workflow-dialog";
import WorkflowEmptyState from "./_components/workflow-empty-state";

export default function WorkflowsPage() {
    const searchParams = useSearchParams();
    const integrationId = searchParams.get('integration');

    const [search, setSearch] = useState("");
    const [triggerFilter, setTriggerFilter] = useState<WorkflowTriggerType | "ALL">("ALL");
    const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const utils = api.useUtils();

    // Get integrations for filter
    const { data: accountsData } = api.instagramConnect.getConnectedAccounts.useQuery();
    const accounts = accountsData?.accounts || [];

    // Get workflows
    const { data: workflowData, isLoading, hasNextPage, fetchNextPage } = api.workflow.list.useInfiniteQuery(
        {
            integrationId: integrationId || undefined,
            triggerType: triggerFilter === "ALL" ? undefined : triggerFilter,
            isActive: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
            search: search || undefined,
            limit: 12,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    // Get stats
    const { data: stats } = api.workflow.getStats.useQuery();

    // Mutations
    const deleteMutation = api.workflow.delete.useMutation({
        onSuccess: () => {
            toast.success("Workflow deleted successfully");
            utils.workflow.list.invalidate();
            utils.workflow.getStats.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete workflow");
        },
    });

    const toggleActiveMutation = api.workflow.toggleActive.useMutation({
        onSuccess: (data) => {
            toast.success(`Workflow ${data.isActive ? 'activated' : 'deactivated'}`);
            utils.workflow.list.invalidate();
            utils.workflow.getStats.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to toggle workflow");
        },
    });

    const duplicateMutation = api.workflow.duplicate.useMutation({
        onSuccess: () => {
            toast.success("Workflow duplicated successfully");
            utils.workflow.list.invalidate();
            utils.workflow.getStats.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to duplicate workflow");
        },
    });

    const workflows = workflowData?.pages.flatMap((page: any) => page.workflows) || [];

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workflow",
        "Are you sure you want to delete this workflow? This will also delete all execution history.",
        "destructive"
    );

    const handleDelete = async (workflowId: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            deleteMutation.mutate({ id: workflowId });
        }
    };

    return (
        <>
            <DeleteDialog />
            <CreateWorkflowDialog
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
                <div className="container max-w-7xl py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                                    Workflows
                                </h1>
                                <p className="text text-muted-foreground">
                                    Automate your Instagram engagement with powerful workflows
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Workflow
                            </Button>
                        </div>

                        {/* Stats */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <StatsCard
                                    icon={<Zap />}
                                    label="Total Workflows"
                                    value={stats.total}
                                    color="blue"
                                />
                                <StatsCard
                                    icon={<PlayCircle />}
                                    label="Active"
                                    value={stats.active}
                                    color="green"
                                />
                                <StatsCard
                                    icon={<Activity />}
                                    label="Executions (24h)"
                                    value={stats.recentExecutions}
                                    color="purple"
                                />
                                <StatsCard
                                    icon={<TrendingUp />}
                                    label="Success Rate"
                                    value="98%"
                                    color="orange"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <Card className="p-4 border-0 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search workflows..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Integration Filter */}
                                {accounts.length > 0 && (
                                    <Select
                                        value={integrationId || "ALL"}
                                        onValueChange={(value) => {
                                            // Update URL params
                                            const params = new URLSearchParams(searchParams);
                                            if (value === "ALL") {
                                                params.delete('integration');
                                            } else {
                                                params.set('integration', value);
                                            }
                                            window.history.pushState(null, '', `?${params.toString()}`);
                                        }}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Accounts</SelectItem>
                                            {accounts.map(account => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    @{account.accountUsername}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Trigger Type Filter */}
                                <Select
                                    value={triggerFilter}
                                    onValueChange={(value) => setTriggerFilter(value as any)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Triggers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Triggers</SelectItem>
                                        <SelectItem value="COMMENT_RECEIVED">Comments</SelectItem>
                                        <SelectItem value="DM_RECEIVED">Direct Messages</SelectItem>
                                        <SelectItem value="MANUAL">Manual</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Status Filter */}
                                <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
                                    <TabsList>
                                        <TabsTrigger value="ALL">All</TabsTrigger>
                                        <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                                        <TabsTrigger value="INACTIVE">Inactive</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Workflows Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="h-[280px] animate-pulse bg-gray-100" />
                            ))}
                        </div>
                    ) : workflows.length === 0 ? (
                        <WorkflowEmptyState onCreateClick={() => setShowCreateModal(true)}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {workflows.map((workflow: any, index: number) => (
                                        <motion.div
                                            key={workflow.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <WorkflowCard
                                                workflow={workflow}
                                                onToggleActive={() => toggleActiveMutation.mutate({ id: workflow.id })}
                                                onDuplicate={() => duplicateMutation.mutate({ id: workflow.id })}
                                                onDelete={() => handleDelete(workflow.id)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Load More */}
                            {hasNextPage && (
                                <div className="mt-8 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchNextPage()}
                                        className="w-full md:w-auto"
                                    >
                                        Load More Workflows
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// Components
const StatsCard = ({ icon, label, value, color }: any) => {
    const colorClasses: Record<string, string> = {
        blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
        green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
        purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
        orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600',
    };

    return (
        <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]?.split(' ').slice(2).join(' ') || ''}`}>
                    {React.cloneElement(icon, { className: 'h-5 w-5' })}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </Card>
    );
};

const WorkflowCard = ({ workflow, onToggleActive, onDuplicate, onDelete }: any) => {
    const getTriggerIcon = (type: WorkflowTriggerType) => {
        switch (type) {
            case 'COMMENT_RECEIVED':
                return <MessageCircle className="h-4 w-4" />;
            case 'DM_RECEIVED':
                return <Instagram className="h-4 w-4" />;
        }
    };

    const getTriggerLabel = (type: WorkflowTriggerType) => {
        switch (type) {
            case 'COMMENT_RECEIVED':
                return 'Comment Trigger';
            case 'DM_RECEIVED':
                return 'DM Trigger';
        }
    };

    return (
        <Card className="group h-full overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className={`p-4 ${workflow.isActive ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{workflow.name}</h3>
                        {workflow.integration && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Instagram className="h-3 w-3" />
                                @{workflow.integration.accountUsername}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href={`/workflow/editor/${workflow.id}`}>
                                <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={onDuplicate}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onToggleActive}>
                                {workflow.isActive ? (
                                    <>
                                        <PauseCircle className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <Badge variant={workflow.isActive ? "success" : "secondary"}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        {getTriggerIcon(workflow.triggerType)}
                        {getTriggerLabel(workflow.triggerType)}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                {workflow.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {workflow.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Runs</span>
                        <span className="font-medium">{workflow._count?.executions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Success Rate</span>
                        <span className="font-medium">
                            {workflow.successRate !== null ? `${workflow.successRate}%` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Recent Activity</span>
                        <span className="font-medium">{workflow.recentExecutions} runs</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {workflow.lastRunAt ? (
                            <span>Last run {formatDistanceToNow(workflow.lastRunAt, { addSuffix: true })}</span>
                        ) : (
                            <span>Never run</span>
                        )}
                    </div>
                    {workflow.lastRunStatus && (
                        <Badge
                            variant={
                                workflow.lastRunStatus === 'SUCCESS' ? 'success' :
                                    workflow.lastRunStatus === 'FAILED' ? 'destructive' :
                                        'secondary'
                            }
                            className="text-xs"
                        >
                            {workflow.lastRunStatus}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
};

// const WorkflowEmptyState = () => {
//     return (
//         <div className="text-center py-12">
//             <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                 <Zap className="h-8 w-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
//             <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                 Create your first workflow to start automating your Instagram engagement
//             </p>
//             <CreateWorkflowDialog triggerText="Create your first workflow" />
//         </div>
//     );
// };


