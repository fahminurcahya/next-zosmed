// src/app/(protected)/workflows/[workflowId]/analytics/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    Download,
    RefreshCw,
    Calendar,
    BarChart3,
    Activity,
    Clock,
    Settings
} from 'lucide-react';
import Link from 'next/link';


export default function WorkflowAnalyticsPage() {
    const params = useParams();
    const workflowId = params?.workflowId as string;
    const [timeRange, setTimeRange] = useState('7d');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'json' | 'csv') => {
        setIsExporting(true);
        try {
            // Call tRPC export endpoint
            // const result = await api.workflowMonitoring.exportWorkflowReport.mutate({
            //   workflowId,
            //   format
            // });

            // Create and download file
            // const blob = new Blob([result.data], { type: result.contentType });
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = result.filename;
            // a.click();
            // URL.revokeObjectURL(url);

            console.log(`Exporting ${format} report for workflow ${workflowId}`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/workflows">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Workflows
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Workflow Analytics</h1>
                        <p className="text-gray-600">Detailed performance metrics and insights</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1d">Last Day</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Export Options */}
                    <Select onValueChange={(format) => handleExport(format as 'json' | 'csv')}>
                        <SelectTrigger className="w-32">
                            <Download className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Export" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="json">Export JSON</SelectItem>
                            <SelectItem value="csv">Export CSV</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Settings */}
                    <Link href={`/workflows/${workflowId}/edit`}>
                        <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Workflow
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Analytics Dashboard */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="errors">Errors & Logs</TabsTrigger>
                </TabsList>

                {/* Overview Tab - Full Dashboard */}
                <TabsContent value="overview">
                    {/* <WorkflowPerformanceDashboard workflowId={workflowId} /> */}
                </TabsContent>

                {/* Performance Deep Dive */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Execution Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Execution timeline chart will be implemented here
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Success Rate Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Success rate trend chart will be implemented here
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Metrics Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Metric</th>
                                            <th className="text-left p-2">Today</th>
                                            <th className="text-left p-2">Yesterday</th>
                                            <th className="text-left p-2">7d Avg</th>
                                            <th className="text-left p-2">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="p-2 font-medium">Executions</td>
                                            <td className="p-2">23</td>
                                            <td className="p-2">18</td>
                                            <td className="p-2">21</td>
                                            <td className="p-2 text-green-600">↗ +27%</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-medium">Success Rate</td>
                                            <td className="p-2">95.7%</td>
                                            <td className="p-2">88.9%</td>
                                            <td className="p-2">91.2%</td>
                                            <td className="p-2 text-green-600">↗ +7.6%</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-medium">Avg Response Time</td>
                                            <td className="p-2">2.3s</td>
                                            <td className="p-2">2.8s</td>
                                            <td className="p-2">2.5s</td>
                                            <td className="p-2 text-green-600">↗ -17.9%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Actions Analysis */}
                <TabsContent value="actions" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Comments Replied</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">127</div>
                                    <div className="text-sm text-gray-500">This week</div>
                                    <div className="text-xs text-green-600 mt-2">↗ +15% vs last week</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>DMs Sent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">89</div>
                                    <div className="text-sm text-gray-500">This week</div>
                                    <div className="text-xs text-green-600 mt-2">↗ +23% vs last week</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Response Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">34%</div>
                                    <div className="text-sm text-gray-500">Users responded</div>
                                    <div className="text-xs text-red-600 mt-2">↘ -3% vs last week</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action History Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Mock action history */}
                                {[
                                    { type: 'comment_reply', time: '2 min ago', user: '@user123', content: 'Thanks for your interest!' },
                                    { type: 'dm_send', time: '5 min ago', user: '@user456', content: 'Hi! Check out our latest...' },
                                    { type: 'comment_reply', time: '8 min ago', user: '@user789', content: 'Sure! Here\'s the info...' },
                                ].map((action, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                        <div className={`w-2 h-2 rounded-full ${action.type === 'comment_reply' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {action.type === 'comment_reply' ? 'Comment Reply' : 'DM Sent'}
                                                </span>
                                                <span className="text-sm text-gray-500">to {action.user}</span>
                                                <span className="text-xs text-gray-400">{action.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{action.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Errors & Logs */}
                <TabsContent value="errors" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Error Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Rate Limit Exceeded</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">60%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Instagram API Error</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">30%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Network Timeout</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-600">10%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Uptime</span>
                                        <span className="text-sm font-medium text-green-600">99.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Last Restart</span>
                                        <span className="text-sm text-gray-600">3 days ago</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Memory Usage</span>
                                        <span className="text-sm text-gray-600">45%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">CPU Usage</span>
                                        <span className="text-sm text-gray-600">23%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Execution Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Execution Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {[
                                    { level: 'INFO', time: '14:23:45', message: 'Workflow execution started for comment abc123' },
                                    { level: 'INFO', time: '14:23:46', message: 'Post validation passed for post ID: 1' },
                                    { level: 'INFO', time: '14:23:47', message: 'Keyword filter passed: comment contains "price"' },
                                    { level: 'SUCCESS', time: '14:23:48', message: 'Comment reply sent successfully' },
                                    { level: 'INFO', time: '14:23:53', message: 'DM delay applied: 5 seconds' },
                                    { level: 'SUCCESS', time: '14:23:54', message: 'DM sent successfully to user456' },
                                    { level: 'INFO', time: '14:23:55', message: 'Workflow execution completed successfully' },
                                    { level: 'ERROR', time: '14:20:12', message: 'Rate limit exceeded for comment reply action' },
                                    { level: 'WARNING', time: '14:18:30', message: 'Instagram API rate limit approaching (85% used)' },
                                    { level: 'INFO', time: '14:15:22', message: 'Workflow execution started for comment def456' },
                                ].map((log, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm font-mono">
                                        <span className="text-gray-500 min-w-20">{log.time}</span>
                                        <span className={`min-w-16 ${log.level === 'ERROR' ? 'text-red-600' :
                                            log.level === 'WARNING' ? 'text-yellow-600' :
                                                log.level === 'SUCCESS' ? 'text-green-600' :
                                                    'text-blue-600'
                                            }`}>
                                            {log.level}
                                        </span>
                                        <span className="text-gray-700">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}