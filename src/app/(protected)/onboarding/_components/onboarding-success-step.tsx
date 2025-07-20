'use client'
import { api } from "@/trpc/react";
import { CheckCircle, Rocket, ArrowRight, Users, Crown, Instagram, MessageSquare, Zap, BarChart, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";
import confetti from 'canvas-confetti';



const OnboardingSuccessStep = () => {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Get user's current setup status
    const { data: businessInfoData } = api.onboarding.getBusinessInfo.useQuery();
    const { data: subscriptionData } = api.billing.getCurrentSubscription.useQuery();
    const { data: instagramData } = api.instagramConnect.getConnectedAccounts.useQuery();

    // Mark onboarding as complete mutation
    const completeOnboardingMutation = api.onboarding.completeInstagramConnection.useMutation({
        onSuccess: () => {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    });

    // Auto-complete onboarding when component mounts
    useEffect(() => {
        const hasInstagramConnection = instagramData?.accounts && instagramData.accounts.length > 0;

        // Complete onboarding automatically
        completeOnboardingMutation.mutate({
            hasConnection: hasInstagramConnection || false
        });
    }, [instagramData]);

    const handleGoToDashboard = () => {
        setIsRedirecting(true);
        // Small delay for better UX
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);
    };

    const handleExploreFeatures = () => {
        window.location.href = '/workflows';
    };

    const handleViewSettings = () => {
        window.location.href = '/profile';
    };

    // Setup summary data
    const businessInfo = businessInfoData?.data?.businessInfo;
    const subscription = subscriptionData;
    const connectedAccounts = instagramData?.accounts || [];
    const hasInstagramConnection = connectedAccounts.length > 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <motion.h1
                    className="text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    🎉 Selamat! Setup Berhasil!
                </motion.h1>
                <motion.p
                    className="text-xl text-gray-600 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    Akun Zosmed Anda telah siap digunakan untuk otomasi Instagram
                </motion.p>
            </motion.div>

            {/* Setup Summary */}
            <motion.div
                className="grid md:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {/* Business Info */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Users className="w-5 h-5" />
                            Info Bisnis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-blue-800">
                                    {businessInfo?.businessName || 'Tidak diisi'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-blue-800">
                                    {businessInfo?.businessCategory || 'Kategori belum dipilih'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-blue-800">
                                    {businessInfo?.location || 'Lokasi belum diisi'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription */}
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-yellow-900">
                            <Crown className="w-5 h-5" />
                            Paket Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {subscription ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-semibold text-yellow-800">
                                            {subscription.pricingPlan?.displayName || 'Plan Aktif'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-yellow-700">
                                        Max {subscription.pricingPlan?.maxAccounts || 1} akun Instagram
                                    </div>
                                    <div className="text-xs text-yellow-700">
                                        {subscription.pricingPlan?.maxDMPerMonth?.toLocaleString() || 0} DM/bulan
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                                    <span className="text-sm text-yellow-800">
                                        Belum memilih paket
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Instagram Connection */}
                <Card className="border-pink-200 bg-pink-50">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-pink-900">
                            <Instagram className="w-5 h-5" />
                            Instagram
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {hasInstagramConnection ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-semibold text-pink-800">
                                            {connectedAccounts.length} akun terhubung
                                        </span>
                                    </div>
                                    {connectedAccounts.slice(0, 2).map((account) => (
                                        <div key={account.id} className="text-xs text-pink-700">
                                            @{account.accountUsername}
                                        </div>
                                    ))}
                                    {connectedAccounts.length > 2 && (
                                        <div className="text-xs text-pink-600">
                                            +{connectedAccounts.length - 2} akun lainnya
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                                    <span className="text-sm text-pink-800">
                                        Belum terhubung
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rocket className="w-6 h-6" />
                            Apa selanjutnya?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Create Workflow */}
                            <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Buat Workflow Pertama
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Siapkan auto-reply untuk DM dan komentar Instagram
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExploreFeatures}
                                    >
                                        Mulai Buat Workflow
                                    </Button>
                                </div>
                            </div>

                            {/* View Analytics */}
                            {/* <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <BarChart className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Monitor Performa
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Lihat statistik DM dan komentar yang diproses
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push('/dashboard/analytics')}
                                    >
                                        Lihat Analytics
                                    </Button>
                                </div>
                            </div> */}

                            {/* Connect More Accounts */}
                            {!hasInstagramConnection && (
                                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <Instagram className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Hubungkan Instagram
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Sambungkan akun Instagram untuk mulai otomasi
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/dashboard/integrations')}
                                        >
                                            Hubungkan Sekarang
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Settings */}
                            <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Sesuaikan Pengaturan
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Atur preferensi dan konfigurasi akun Anda
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleViewSettings}
                                    >
                                        Buka Pengaturan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <Button
                    onClick={handleGoToDashboard}
                    disabled={isRedirecting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    size="lg"
                >
                    {isRedirecting ? (
                        <>
                            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Menuju Dashboard...
                        </>
                    ) : (
                        <>
                            <Rocket className="w-5 h-5 mr-2" />
                            Mulai Menggunakan Zosmed
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Success Badges */}
            <motion.div
                className="flex flex-wrap justify-center gap-3 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                <Badge variant="secondary" className="px-3 py-1">
                    ✅ Info Bisnis Lengkap
                </Badge>
                {subscription && (
                    <Badge variant="secondary" className="px-3 py-1">
                        👑 Paket Aktif
                    </Badge>
                )}
                {hasInstagramConnection && (
                    <Badge variant="secondary" className="px-3 py-1">
                        📱 Instagram Terhubung
                    </Badge>
                )}
                <Badge variant="secondary" className="px-3 py-1">
                    🚀 Siap Digunakan
                </Badge>
            </motion.div>

            {/* Help Section */}
            <motion.div
                className="text-center mt-8 pt-6 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <p className="text-sm text-gray-500 mb-2">
                    Butuh bantuan memulai?
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <a href="/help/getting-started" className="text-blue-600 hover:underline">
                        📖 Panduan Memulai
                    </a>
                    <a href="/help/workflows" className="text-blue-600 hover:underline">
                        ⚡ Tutorial Workflow
                    </a>
                    <a href="/support" className="text-blue-600 hover:underline">
                        💬 Hubungi Support
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingSuccessStep;