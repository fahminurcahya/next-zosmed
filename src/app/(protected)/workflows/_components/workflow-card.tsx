"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Workflow } from "@prisma/client";
import { WorkflowStatus } from "@/types/workflow.type";
import {
    BarChart3,
    Clock,
    Instagram,
    MoreVertical,
    Play,
    TrendingUp,
    MessageCircle,
    CheckCircle2,
    Settings,
    Pause
} from "lucide-react";
import { WorkflowActions } from "./workflow-actions";
import RunBtn from "./run-btn";
import { StatusBadge } from "./status-badge";

// Enhanced Workflow Card Component
function WorkflowCard({ workflow }: { workflow: Workflow }) {
    const isActive = workflow.status === WorkflowStatus.PUBLISHED;

    // Mock data for demo - you can replace with real data
    const todayExecutions = 24;
    const successRate = 98;
    const avgResponseTime = 0.3;

    return (
        <Card className="group bg-white border border-gray-200 hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden">
            <CardContent className="p-5">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        {/* Instagram Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>

                        {/* Workflow Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Link
                                    href={`/workflow/editor/${workflow.id}`}
                                    className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                                >
                                    {workflow.name}
                                </Link>

                                {/* Status Badges */}
                                {workflow.cron && (
                                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-xs px-2 py-0.5">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Event-Driven
                                    </Badge>
                                )}

                                <StatusBadge status={workflow.status} />
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {workflow.description || 'Automatically reply to Instagram direct messages with personalized responses'}
                            </p>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <WorkflowActions
                        workflowName={workflow.name}
                        workflowId={workflow.id}
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* Today Executions */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-xs">Today</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{todayExecutions}</p>
                    </div>

                    {/* Success Rate */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs">Success Rate</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{successRate}%</p>
                    </div>

                    {/* Avg Response Time */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">Avg Response</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{avgResponseTime}s</p>
                    </div>

                    {/* Last Triggered */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">Last Triggered</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                            {workflow.lastRunAt
                                ? formatDistanceToNow(workflow.lastRunAt, { addSuffix: true })
                                : 'Never'
                            }
                        </p>
                    </div>
                </div>

                {/* Trigger Info */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Instagram className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Instagram • Triggers on new dm</span>

                    {isActive && (
                        <Badge className="ml-auto bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                            Listening
                        </Badge>
                    )}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Created {workflow.createdAt && formatDistanceToNow(workflow.createdAt, { addSuffix: true })}</span>
                        <span>289 total triggers</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                            Analytics
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-xs h-7 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <Link href={`/workflow/editor/${workflow.id}`}>
                                <Settings className="h-3.5 w-3.5 mr-1.5" />
                                Configure
                            </Link>
                        </Button>

                        {isActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Handle pause logic here
                                }}
                            >
                                <Pause className="h-3.5 w-3.5 mr-1.5" />
                                Pause
                            </Button>
                        ) : (
                            <RunBtn workflowId={workflow.id} />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default WorkflowCard;