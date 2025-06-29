import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowExecutionStatus } from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import {
    Clock, CheckCircle, XCircle, AlertCircle,
    Loader2, ChevronRight, Activity, FileText
} from "lucide-react";
import Link from "next/link";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface Props {
    workflowId: string;
    limit?: number;
}

export default function WorkflowExecutionList({ workflowId, limit = 10 }: Props) {
    const { data: executions, isLoading } = api.workflowExecution.listByWorkflow.useQuery({
        workflowId,
        limit,
    });

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            </Card>
        );
    }

    if (!executions || executions.length === 0) {
        return (
            <Card className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No executions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                    Workflow will run when triggered by comments or DMs
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {executions.map((execution) => (
                <ExecutionCard key={execution.id} execution={execution} />
            ))}
        </div>
    );
}

const ExecutionCard = ({ execution }: { execution: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusIcon = (status: WorkflowExecutionStatus) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'RUNNING':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'CANCELLED':
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getDuration = () => {
        if (!execution.startedAt || !execution.completedAt) return null;
        const duration = new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime();
        return `${(duration / 1000).toFixed(1)}s`;
    };

    return (
        <Card className="overflow-hidden">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <button className="w-full p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(execution.status)}
                                <div className="text-left">
                                    <p className="font-medium text-sm">
                                        Execution #{execution.id.slice(-6)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(execution.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getDuration() && (
                                    <span className="text-xs text-gray-500">{getDuration()}</span>
                                )}
                                <Badge variant={
                                    execution.status === 'SUCCESS' ? 'success' :
                                        execution.status === 'FAILED' ? 'destructive' :
                                            execution.status === 'RUNNING' ? 'default' :
                                                'secondary'
                                }>
                                    {execution.status}
                                </Badge>
                                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            </div>
                        </div>
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-4 pb-4 border-t">
                        <div className="mt-4 space-y-3">
                            {/* Trigger Info */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Trigger</p>
                                <p className="text-sm font-medium">
                                    {JSON.parse(execution.trigger).type || 'Unknown'}
                                </p>
                            </div>

                            {/* Phases */}
                            {execution.phases && execution.phases.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Execution Phases</p>
                                    <div className="space-y-2">
                                        {execution.phases.map((phase: any) => (
                                            <div key={phase.id} className="flex items-center gap-2 text-sm">
                                                {getStatusIcon(phase.status)}
                                                <span className="font-medium">{phase.name}</span>
                                                {phase.errorMessage && (
                                                    <span className="text-xs text-red-500">
                                                        ({phase.errorMessage})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Credits Used */}
                            {execution.creditsConsumed > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Credits Used</span>
                                    <span className="font-medium">{execution.creditsConsumed}</span>
                                </div>
                            )}

                            {/* View Details */}
                            <Link href={`/workflows/${execution.workflowId}/executions/${execution.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="h-3 w-3 mr-2" />
                                    View Details
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};