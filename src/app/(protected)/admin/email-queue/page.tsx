// src/app/(protected)/admin/email-queue/page.tsx
"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Mail,
    Clock,
    AlertCircle,
    RefreshCw,
    Play,
    Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function EmailQueueDashboard() {
    const [isProcessing, setIsProcessing] = useState(false);

    // Query queue stats
    const statsQuery = api.emailQueue.getStats.useQuery(undefined, {
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    // Process queue mutation
    const processQueueMutation = api.emailQueue.processQueue.useMutation({
        onMutate: () => {
            setIsProcessing(true);
        },
        onSuccess: (data) => {
            toast.success(data.message);
            statsQuery.refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => {
            setIsProcessing(false);
        },
    });

    const stats = statsQuery.data;
    const totalPending = stats ? stats.pending.welcome + stats.pending.launch : 0;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Email Queue Dashboard</h1>
                    <p className="text-gray-600">Monitor and manage email queue</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statsQuery.refetch()}
                        disabled={statsQuery.isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => processQueueMutation.mutate()}
                        disabled={isProcessing || totalPending === 0}
                        size="sm"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Process Queue
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Queue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QueueCard
                    title="Welcome Emails"
                    value={stats?.pending.welcome || 0}
                    icon={<Mail className="h-5 w-5" />}
                    color="blue"
                />
                <QueueCard
                    title="Launch Emails"
                    value={stats?.pending.launch || 0}
                    icon={<Mail className="h-5 w-5" />}
                    color="green"
                />
                <QueueCard
                    title="Processing"
                    value={stats?.processing || 0}
                    icon={<Clock className="h-5 w-5" />}
                    color="yellow"
                />
                <QueueCard
                    title="Failed"
                    value={stats?.deadLetter || 0}
                    icon={<AlertCircle className="h-5 w-5" />}
                    color="red"
                />
            </div>

            {/* Queue Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Queue Status</CardTitle>
                    <CardDescription>
                        Real-time email queue processing status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Total Pending</span>
                                <span>{totalPending} emails</span>
                            </div>
                            <Progress
                                value={stats ? (stats.processing / (totalPending + stats.processing)) * 100 : 0}
                                className="h-2"
                            />
                        </div>

                        {stats?.deadLetter! > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {stats!.deadLetter} emails failed to send and are in the dead letter queue.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Processing Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Processing Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Batch Size</p>
                            <p className="font-medium">10 emails per batch</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Max Retries</p>
                            <p className="font-medium">3 attempts</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Rate Limit</p>
                            <p className="font-medium">5 emails/hour per user</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Cron Schedule</p>
                            <p className="font-medium">Every 5 minutes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function QueueCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "green" | "yellow" | "red";
}) {
    const colorClasses = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-green-600 bg-green-50",
        yellow: "text-yellow-600 bg-yellow-50",
        red: "text-red-600 bg-red-50",
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`p-2 rounded ${colorClasses[color]}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}