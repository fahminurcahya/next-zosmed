// integration-card.tsx
'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useConfirm from "@/hooks/use-confirm";
import { api } from "@/trpc/react";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle, Check, Clock, Instagram, Loader2, Plus, RefreshCw,
    Shield, Trash2, Activity, MessageCircle, Heart,
    BarChart3, Settings, Zap
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import React, { useState } from "react";

type Props = {
    title: string;
    description: string;
    icon: React.ReactNode;
    strategy: "INSTAGRAM";
    canAddMore?: boolean;
    subscription?: any;
};

const IntegrationCard = ({ description, icon, strategy, title, canAddMore = true, subscription }: Props) => {
    const utils = api.useUtils();
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    const [ConfirmDialog, confirm] = useConfirm(
        "Connect Instagram Account",
        `We recommend using a business or creator account for better API access. Personal accounts have limited features. Continue?`
    );

    const [DisconnectDialog, confirmDisconnect] = useConfirm(
        "Disconnect Account",
        "Are you sure you want to disconnect this account? This will permanently delete all workflows, comments, and message history associated with this account.",
        "destructive"
    );

    // Queries
    const { data: accountsData, isPending } = api.instagramConnect.getConnectedAccounts.useQuery();
    const { data: health } = api.instagramConnect.getAccountHealth.useQuery(
        { accountId: selectedAccount! },
        { enabled: !!selectedAccount }
    );

    // Mutations
    const connectMutation = api.instagramConnect.getConnectUrl.useMutation({
        onSuccess: (data) => {
            window.location.href = data.url;
        },
        onError: (error) => {
            toast.error(error.message || "Failed to connect Instagram");
        },
    });

    const disconnectMutation = api.instagramConnect.disconnectAccount.useMutation({
        onSuccess: (data) => {
            toast.success(`Instagram account disconnected. ${data.deletedWorkflows} workflows, ${data.deletedComments} comments, and ${data.deletedMessages} messages deleted.`);
            utils.instagramConnect.getConnectedAccounts.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to disconnect");
        },
    });

    const refreshTokenMutation = api.instagramConnect.refreshToken.useMutation({
        onSuccess: () => {
            toast.success("Token refreshed successfully");
            utils.instagramConnect.getConnectedAccounts.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to refresh token");
        },
    });


    const handleConnect = async () => {
        if (!canAddMore) {
            toast.error("Upgrade your plan to connect more accounts");
            return;
        }
        const ok = await confirm();
        if (!ok) return;
        connectMutation.mutate();
    };

    const handleDisconnect = async (accountId: string) => {
        const ok = await confirmDisconnect();
        if (!ok) return;
        disconnectMutation.mutate({ accountId });
    };

    const connectedAccounts = accountsData?.accounts || [];
    const limits = accountsData?.limits;

    return (
        <>
            <ConfirmDialog />
            <DisconnectDialog />

            <Card className="overflow-hidden border-0 shadow-lg">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Instagram className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Instagram Integration</h2>
                                    <p className="text-white/80">Connect and automate your Instagram accounts</p>
                                </div>
                            </div>
                            {limits && (
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">Account Limit</p>
                                    <p className="text-2xl font-bold">{limits.currentAccounts}/{limits.maxAccounts}</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {limits && (
                            <Progress
                                value={(limits.currentAccounts / limits.maxAccounts) * 100}
                                className="h-2 bg-white/20"
                            />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isPending ? (
                        <LoadingState />
                    ) : connectedAccounts.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {connectedAccounts.map((account, index) => (
                                    <motion.div
                                        key={account.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccountCard
                                            account={account}
                                            health={selectedAccount === account.id ? health : undefined}
                                            onSelect={() => setSelectedAccount(account.id)}
                                            onDisconnect={handleDisconnect}
                                            onRefresh={() => refreshTokenMutation.mutate({ accountId: account.id })}
                                            isRefreshing={refreshTokenMutation.isPending}
                                            isExporting={false}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Account Button */}
                            {canAddMore && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handleConnect}
                                    disabled={connectMutation.isPending}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-xl text-gray-600 hover:text-purple-600 transition-all duration-300 flex items-center justify-center gap-3 hover:bg-purple-50/50 group"
                                >
                                    {connectMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium">Add Another Account</span>
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <EmptyState onConnect={handleConnect} isConnecting={connectMutation.isPending} />
                    )}
                </div>

                {/* Features Section */}
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FeatureCard icon={<Zap />} title="Auto Reply" description="Reply to comments instantly" />
                        <FeatureCard icon={<MessageCircle />} title="DM Automation" description="Send personalized messages" />
                        <FeatureCard icon={<BarChart3 />} title="Analytics" description="Track performance metrics" />
                        <FeatureCard icon={<Shield />} title="Secure OAuth" description="Your data is protected" />
                    </div>
                </div>
            </Card>
        </>
    );
};

// Sub-components
const AccountCard = ({ account, health, onSelect, onDisconnect, onRefresh, isRefreshing }: any) => {
    const isHealthy = health?.health.status === 'healthy';
    const hasWarning = health?.health.status === 'warning';

    return (
        <div className="group relative bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-purple-200">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {account.accountUsername.charAt(0).toUpperCase()}
                        </div>
                        <StatusIndicator account={account} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">@{account.accountUsername}</h3>
                            <TokenStatusBadge account={account} />
                            {health && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Activity
                                                className={`h-4 w-4 ${isHealthy ? 'text-green-500' :
                                                    hasWarning ? 'text-yellow-500' : 'text-red-500'
                                                    }`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{health.health.issues.join(', ') || 'Healthy'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <StatItem icon={<BarChart3 />} label="Workflows" value={account.activeWorkflows} />
                            <StatItem icon={<MessageCircle />} label="Messages" value={account.monthlyMessages} />
                            <StatItem icon={<Heart />} label="Comments" value={account.monthlyComments} />
                            <StatItem icon={<Clock />} label="Connected" value={formatDistanceToNow(account.createdAt, { addSuffix: true })} />
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <Link href={`/workflows?integration=${account.id}`}>
                                <Button size="sm" variant="ghost" className="h-8">
                                    <Settings className="h-3 w-3 mr-1" />
                                    Manage Workflows
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="flex items-center gap-2">
                    {account.daysUntilExpiry && account.daysUntilExpiry < 30 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={onRefresh}
                                        disabled={isRefreshing}
                                        className="h-8 w-8"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Refresh Token</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDisconnect(account.id)}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Disconnect
                    </Button>
                </div>
            </div>
        </div>
    );
};

const StatusIndicator = ({ account }: any) => {
    if (account.isExpired) {
        return (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <AlertCircle className="h-2.5 w-2.5 text-white" />
            </div>
        );
    }

    return (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
        </div>
    );
};

const TokenStatusBadge = ({ account }: any) => {
    if (account.isExpired) {
        return <Badge variant="destructive">Expired</Badge>;
    }

    if (account.daysUntilExpiry && account.daysUntilExpiry < 7) {
        return <Badge variant="warning">Expires in {account.daysUntilExpiry}d</Badge>;
    }

    return <Badge variant="success">Active</Badge>;
};

const StatItem = ({ icon, label, value }: any) => (
    <div className="flex items-center gap-2">
        <div className="text-gray-400">{React.cloneElement(icon, { className: 'h-4 w-4' })}</div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }: any) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-purple-600">{React.cloneElement(icon, { className: 'h-5 w-5' })}</div>
        <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-500">Loading your accounts...</p>
    </div>
);

const EmptyState = ({ onConnect, isConnecting }: any) => (
    <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Instagram className="h-10 w-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts connected</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Connect your Instagram Business or Creator account to start automating your engagement
        </p>
        <Button
            onClick={onConnect}
            disabled={isConnecting}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
            {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <Instagram className="h-4 w-4 mr-2" />
            )}
            Connect Your First Account
        </Button>
    </div>
);

export default IntegrationCard;