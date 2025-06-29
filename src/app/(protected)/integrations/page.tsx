'use client'
import { INTEGRATION_CARDS } from "@/constants/integration";
import IntegrationCard from "./_components/integration-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, InfoIcon, Instagram, MessageCircle, Shield, Sparkles, TrendingUp, Users } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";



const Page = () => {
    const { data: subscription } = api.subscription.getCurrentPlan.useQuery();
    const { data: accountsData } = api.instagramConnect.getConnectedAccounts.useQuery();

    const totalConnectedAccounts = accountsData?.accounts.length || 0;
    const maxAccounts = subscription?.maxAccounts || 1;
    const canAddMore = totalConnectedAccounts < maxAccounts;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
            <div className="container max-w-6xl py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                            <Instagram className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Integrations
                        </h1>
                    </div>
                    <p className="text text-muted-foreground max-w-2xl">
                        Connect your Instagram accounts to unlock powerful automation features and grow your engagement
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatsCard
                        icon={<Users className="h-5 w-5" />}
                        label="Connected Accounts"
                        value={`${totalConnectedAccounts} / ${maxAccounts}`}
                        color="blue"
                    />
                    <StatsCard
                        icon={<MessageCircle className="h-5 w-5" />}
                        label="Monthly DM Limit"
                        value={subscription?.maxDMPerMonth || 100}
                        color="green"
                    />
                    <StatsCard
                        icon={<Sparkles className="h-5 w-5" />}
                        label="AI Features"
                        value={subscription?.hasAIReply ? "Enabled" : "Basic"}
                        color="purple"
                    />
                    <StatsCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Current Plan"
                        value={subscription?.plan || "FREE"}
                        color="orange"
                        badge
                    />
                </motion.div>

                {/* Alert Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {!canAddMore ? (
                        <Alert className="mb-6 border-orange-200 bg-orange-50">
                            <InfoIcon className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                You've reached the maximum number of accounts for your plan.
                                <Button variant="link" className="text-orange-700 p-0 h-auto ml-1">
                                    Upgrade to connect more accounts
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="mb-6 border-blue-200 bg-blue-50">
                            <InfoIcon className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                For best results, use Instagram Business or Creator accounts. Personal accounts have limited API access.
                            </AlertDescription>
                        </Alert>
                    )}
                </motion.div>

                {/* Integration Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {INTEGRATION_CARDS.map((card, index) => (
                        <IntegrationCard
                            key={index}
                            {...card}
                            canAddMore={canAddMore}
                            subscription={subscription}
                        />
                    ))}

                    {/* Coming Soon */}
                    <Card className="p-6 border-dashed border-2 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <Shield className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-600">More Integrations Coming Soon</h3>
                                    <p className="text-sm text-gray-500">TikTok, Facebook, Twitter, and more platforms</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Coming Soon</Badge>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

const StatsCard = ({
    icon,
    label,
    value,
    color,
    badge = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'blue' | 'green' | 'purple' | 'orange';
    badge?: boolean;
}) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
        green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
        purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
        orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600',
    };

    return (
        <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color].split(' ').slice(2).join(' ')}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {badge ? (
                        <Badge className={`bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} text-white border-0`}>
                            {value}
                        </Badge>
                    ) : (
                        <p className="text-lg font-semibold">{value}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};


export default Page;