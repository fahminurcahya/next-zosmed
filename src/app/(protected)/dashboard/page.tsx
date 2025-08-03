'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Users,
    MessageCircle,
    Send,
    BarChart3,
    Settings,
    Eye,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';

// Import your components

interface DashboardSummary {
    summary: {
        totalWorkflows: number;
        activeWorkflows: number;
        totalActionsToday: number;
        avgSuccessRate: number;
    };
    needingAttention: {
        failing: WorkflowMetrics[];
        nearingLimits: WorkflowMetrics[];
        inactive: WorkflowMetrics[];
    };
    topPerforming: WorkflowMetrics[];
    recentActivity: WorkflowMetrics[];
    healthDistribution: {
        healthy: number;
        warning: number;
        failing: number;
        inactive: number;
    };
}

interface WorkflowMetrics {
    workflowId: string;
    workflowName: string;
    isActive: boolean;
    successRate: number;
    actionsToday: {
        total: number;
        comments: number;
        dms: number;
    };
    rateLimitStatus: {
        hourlyUsage: number;
        dailyUsage: number;
        isNearingLimit: boolean;
    };
    lastExecutedAt: Date | null;
    warnings: string[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    // Mock data - replace with actual tRPC calls
    const dashboardSummary: DashboardSummary = {
        summary: {
            totalWorkflows: 8,
            activeWorkflows: 6,
            totalActionsToday: 127,
            avgSuccessRate: 89.5
        },
        needingAttention: {
            failing: [],
            nearingLimits: [
                {
                    workflowId: 'wf-1',
                    workflowName: 'Product Inquiry Auto Reply',
                    isActive: true,
                    successRate: 92,
                    actionsToday: { total: 45, comments: 30, dms: 15 },
                    rateLimitStatus: { hourlyUsage: 88, dailyUsage: 75, isNearingLimit: true },
                    lastExecutedAt: new Date(),
                    warnings: []
                }
            ],
            inactive: []
        },
        topPerforming: [
            {
                workflowId: 'wf-2',
                workflowName: 'Customer Support Auto DM',
                isActive: true,
                successRate: 96.5,
                actionsToday: { total: 23, comments: 12, dms: 11 },
                rateLimitStatus: { hourlyUsage: 45, dailyUsage: 30, isNearingLimit: false },
                lastExecutedAt: new Date(Date.now() - 10 * 60 * 1000),
                warnings: []
            }
        ],
        recentActivity: [],
        healthDistribution: {
            healthy: 4,
            warning: 2,
            failing: 0,
            inactive: 2
        }
    };

    const getStatusColor = (status: 'healthy' | 'warning' | 'failing' | 'inactive') => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'failing': return 'text-red-600 bg-red-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTimeAgo = (date: Date | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Monitor your Instagram automation workflows</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Link href="/workflows/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Workflow
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Workflows</p>
                                <p className="text-2xl font-bold">{dashboardSummary.summary.totalWorkflows}</p>
                                <p className="text-xs text-gray-500">
                                    {dashboardSummary.summary.activeWorkflows} active
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Success Rate</p>
                                <p className="text-2xl font-bold">{dashboardSummary.summary.avgSuccessRate}%</p>
                                <p className="text-xs text-gray-500">Average across all workflows</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Send className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Actions Today</p>
                                <p className="text-2xl font-bold">{dashboardSummary.summary.totalActionsToday}</p>
                                <p className="text-xs text-gray-500">Comments + DMs sent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Need Attention</p>
                                <p className="text-2xl font-bold">
                                    {dashboardSummary.needingAttention.failing.length +
                                        dashboardSummary.needingAttention.nearingLimits.length}
                                </p>
                                <p className="text-xs text-gray-500">Workflows with issues</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="workflows">All Workflows</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Health Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workflow Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(dashboardSummary.healthDistribution).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(status as any)}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </Badge>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Workflows</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardSummary.topPerforming.map((workflow) => (
                                        <div key={workflow.workflowId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{workflow.workflowName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {workflow.successRate}% success • {workflow.actionsToday.total} actions today
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedWorkflowId(workflow.workflowId)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Workflows Needing Attention */}
                    {dashboardSummary.needingAttention.nearingLimits.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Workflows Needing Attention
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardSummary.needingAttention.nearingLimits.map((workflow) => (
                                        <div key={workflow.workflowId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                            <div>
                                                <p className="font-medium">{workflow.workflowName}</p>
                                                <p className="text-sm text-orange-700">
                                                    Rate limit: {Math.max(workflow.rateLimitStatus.hourlyUsage, workflow.rateLimitStatus.dailyUsage)}% used
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    Adjust Limits
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedWorkflowId(workflow.workflowId)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Performance Tab - Full Workflow Dashboard */}
                <TabsContent value="performance">
                    {selectedWorkflowId ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedWorkflowId(null)}
                                >
                                    ← Back to Overview
                                </Button>
                                <h2 className="text-xl font-semibold">Workflow Performance</h2>
                            </div>
                            {/* <WorkflowPerformanceDashboard workflowId={selectedWorkflowId} /> */}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Select a Workflow</h3>
                                <p className="text-gray-600 mb-4">
                                    Choose a workflow from the list to view detailed performance metrics
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {[...dashboardSummary.topPerforming, ...dashboardSummary.needingAttention.nearingLimits]
                                        .slice(0, 6)
                                        .map((workflow) => (
                                            <Button
                                                key={workflow.workflowId}
                                                variant="outline"
                                                className="p-4 h-auto justify-start"
                                                onClick={() => setSelectedWorkflowId(workflow.workflowId)}
                                            >
                                                <div className="text-left">
                                                    <p className="font-medium">{workflow.workflowName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {workflow.successRate}% success • Last: {formatTimeAgo(workflow.lastExecutedAt)}
                                                    </p>
                                                </div>
                                            </Button>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* All Workflows Tab */}
                <TabsContent value="workflows">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Workflows</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...dashboardSummary.topPerforming, ...dashboardSummary.needingAttention.nearingLimits]
                                    .map((workflow) => (
                                        <div key={workflow.workflowId} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                <div>
                                                    <p className="font-medium">{workflow.workflowName}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>{workflow.successRate}% success</span>
                                                        <span>{workflow.actionsToday.total} actions today</span>
                                                        <span>Last: {formatTimeAgo(workflow.lastExecutedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {workflow.rateLimitStatus.isNearingLimit && (
                                                    <Badge variant="destructive">Near Limit</Badge>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedWorkflowId(workflow.workflowId)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">All Good!</h3>
                                <p className="text-gray-600">No critical alerts at the moment</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}