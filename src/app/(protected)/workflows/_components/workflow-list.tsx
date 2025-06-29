'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingSkeleton } from "./loading-skeleton";
import { Activity, AlertCircle, CheckCircle, FileText, Inbox, TrendingUp } from "lucide-react";
import CreateWorkflowDialog from "./create-workflow-dialog";
import WorkflowCard from "./workflow-card";
import { api } from "@/trpc/react";
import { WorkflowStatus } from "@/types/workflow.type";

export function WorkflowList() {
    const { data: workflows, isLoading, isError } = api.workflow.getWorkflowsForUser.useQuery();

    if (isLoading) return <LoadingSkeleton />;

    if (isError || !workflows) {
        return (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-900">Error</AlertTitle>
                <AlertDescription className="text-red-800">
                    Something went wrong. Please try again later
                </AlertDescription>
            </Alert>
        );
    }

    if (workflows.length === 0) {
        return (
            <div className="flex flex-col gap-6 h-full items-center justify-center py-16">
                {/* Enhanced Empty State Icon */}
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <Inbox className="h-12 w-12 text-blue-600" />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-indigo-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
                </div>

                {/* Enhanced Empty State Content */}
                <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">No workflows created yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        Create your first workflow to automate your social media tasks and save time on repetitive processes.
                    </p>
                </div>

                {/* Enhanced CTA */}
                <div className="mt-8">
                    <CreateWorkflowDialog triggerText="Create your first workflow" />
                </div>

                {/* Additional Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Get started with automation in just a few clicks
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats - Optional Enhancement */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-700">Total Workflows</p>
                            <p className="text-xl font-bold text-blue-900">{workflows.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-700">Published</p>
                            <p className="text-xl font-bold text-emerald-900">
                                {workflows.filter(w => w.status === WorkflowStatus.PUBLISHED).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-700">Drafts</p>
                            <p className="text-xl font-bold text-amber-900">
                                {workflows.filter(w => w.status === WorkflowStatus.DRAFT).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 gap-6">
                {workflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
            </div>
        </div>
    );
}