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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Mail,
    TrendingUp,
    Clock,
    Send,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function WaitinglistAdminPage() {
    const [filter, setFilter] = useState<"all" | "pending" | "notified">("all");
    const [page, setPage] = useState(0);
    const limit = 50;

    // Queries
    const statsQuery = api.waitingList.getStats.useQuery();
    const usersQuery = api.waitingList.getAll.useQuery({
        limit,
        offset: page * limit,
        filter,
    });

    // Mutations
    const sendNotificationsMutation = api.waitingList.sendLaunchNotifications.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
            // Refetch data
            statsQuery.refetch();
            usersQuery.refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSendNotifications = (testMode = false) => {
        sendNotificationsMutation.mutate({ testMode, batchSize: 50 });
    };

    const stats = statsQuery.data;
    const proCount = stats?.byPlan.find((p) => p.plan === "PRO")?.count || 0;

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Waitinglist Management</h1>
                <p className="text-gray-600">Monitor dan kelola waiting list Zosmed</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<Users className="h-5 w-5" />}
                    title="Total Registrants"
                    value={stats?.total || 0}
                    description="Total pendaftar"
                    loading={statsQuery.isLoading}
                />
                <StatsCard
                    icon={<Mail className="h-5 w-5" />}
                    title="Notified"
                    value={stats?.notified || 0}
                    description="Sudah dikirim email"
                    loading={statsQuery.isLoading}
                />
                <StatsCard
                    icon={<Clock className="h-5 w-5" />}
                    title="Pending"
                    value={stats?.unnotified || 0}
                    description="Belum dinotifikasi"
                    loading={statsQuery.isLoading}
                />
                <StatsCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    title="Pro Interest"
                    value={proCount}
                    description="Tertarik plan Pro"
                    loading={statsQuery.isLoading}
                />
            </div>

            {/* Action Buttons */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Launch Notification</CardTitle>
                    <CardDescription>
                        Kirim email notifikasi launch ke semua user yang belum dinotifikasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => handleSendNotifications(true)}
                            variant="outline"
                            disabled={sendNotificationsMutation.isPending}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Test Mode (Dry Run)
                        </Button>
                        <Button
                            onClick={() => handleSendNotifications(false)}
                            disabled={
                                sendNotificationsMutation.isPending || stats?.unnotified === 0
                            }
                        >
                            {sendNotificationsMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Launch Email ({stats?.unnotified} users)
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                        <TabsList>
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="notified">Notified</TabsTrigger>
                        </TabsList>

                        <TabsContent value={filter} className="mt-4">
                            {usersQuery.isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Registered</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usersQuery.data?.users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                user.interestedPlan === "PRO"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {user.interestedPlan}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{user.referralSource || "-"}</TableCell>
                                                    <TableCell>
                                                        {user.isNotified ? (
                                                            <Badge className="bg-green-500">
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Notified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {format(new Date(user.createdAt), "dd MMM yyyy", {
                                                            locale: id,
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-sm text-gray-600">
                                            Total: {usersQuery.data?.total} users
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                                disabled={page === 0}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => p + 1)}
                                                disabled={!usersQuery.data?.hasMore}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({
    icon,
    title,
    value,
    description,
    loading,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    description: string;
    loading?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}