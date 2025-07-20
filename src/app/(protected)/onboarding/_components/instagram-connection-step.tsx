'use client'
import { api } from "@/trpc/react";
import { Instagram, Check, Loader2, AlertCircle, ExternalLink, Users, MessageSquare, Zap, Shield, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface InstagramConnectionStepProps {
    onNext: () => void;
    isLoading?: boolean;
}
const InstagramConnectionStep = ({ onNext, isLoading = false }: InstagramConnectionStepProps) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Get connected accounts
    const { data: accountsData, refetch: refetchAccounts, isLoading: isLoadingAccounts } =
        api.instagramConnect.getConnectedAccounts.useQuery();


    // Get connect URL mutation
    const getConnectUrlMutation = api.instagramConnect.getConnectUrl.useMutation({
        onSuccess: (data) => {
            // Open Instagram OAuth in new window
            const popup = window.open(
                data.url,
                'instagram-auth',
                'width=600,height=700,scrollbars=yes,resizable=yes'
            );

            // Monitor popup closure
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed);
                    setIsConnecting(false);
                    // Refetch accounts to check if connection was successful
                    setTimeout(() => {
                        refetchAccounts();
                    }, 1000);
                }
            }, 1000);
        },
        onError: (error) => {
            setIsConnecting(false);
            setConnectionStatus('error');
            setErrorMessage(error.message);
        }
    });


    // Disconnect account mutation
    const disconnectAccountMutation = api.instagramConnect.disconnectAccount.useMutation({
        onSuccess: () => {
            refetchAccounts();
        }
    });


    const handleConnectInstagram = async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');
        setErrorMessage('');

        try {
            await getConnectUrlMutation.mutateAsync();
        } catch (error) {
            console.error('Error getting connect URL:', error);
        }
    };

    const handleDisconnectAccount = async (accountId: string) => {
        if (confirm('Apakah Anda yakin ingin memutuskan koneksi akun Instagram ini? Semua data terkait akan dihapus.')) {
            await disconnectAccountMutation.mutateAsync({ accountId });
        }
    };

    const handleContinueWithoutConnection = () => {
        onNext();
    };

    const handleContinueWithConnection = () => {
        onNext();
    };

    const connectedAccounts = accountsData?.accounts || [];
    const limits = accountsData?.limits;
    const hasConnectedAccount = connectedAccounts.length > 0;
    const canAddMore = limits?.canAddMore || false;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Instagram className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Hubungkan Instagram Business
                </h2>
                <p className="text-gray-600 mb-4">
                    Sambungkan akun Instagram Business Anda untuk mulai otomasi DM dan komentar
                </p>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
                className="grid md:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-purple-900 mb-1">Auto Reply DM</h3>
                            <p className="text-sm text-purple-700">
                                Balas DM otomatis dengan AI yang cerdas
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-blue-900 mb-1">Auto Comment</h3>
                            <p className="text-sm text-blue-700">
                                Kelola komentar dengan respon otomatis
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-green-900 mb-1">Secure & Safe</h3>
                            <p className="text-sm text-green-700">
                                Koneksi aman dengan Instagram API resmi
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Connection Status & Actions */}
            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {/* Current Status */}
                {connectionStatus === 'error' && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {connectionStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            Instagram berhasil terhubung!
                        </AlertDescription>
                    </Alert>
                )}

                {/* Connected Accounts */}
                {connectedAccounts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Instagram className="w-5 h-5" />
                                Akun Instagram Terhubung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {connectedAccounts.map((account) => (
                                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <Instagram className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">@{account.accountUsername}</span>
                                                {account.isExpired && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Token Expired
                                                    </Badge>
                                                )}
                                                {!account.isExpired && account.daysUntilExpiry !== null && account.daysUntilExpiry < 7 && (
                                                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                                                        Expires in {account.daysUntilExpiry} days
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-4">
                                                <span>{account.activeWorkflows} workflows aktif</span>
                                                <span>•</span>
                                                <span>{account.monthlyComments} komentar bulan ini</span>
                                                <span>•</span>
                                                <span>{account.monthlyMessages} pesan bulan ini</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {account.isExpired && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {/* TODO: Implement refresh */ }}
                                                disabled={isConnecting}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Refresh
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDisconnectAccount(account.id)}
                                            disabled={disconnectAccountMutation.isPending}
                                        >
                                            {disconnectAccountMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Disconnect'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Account Limits Info */}
                            <div className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded">
                                {limits && (
                                    <>
                                        Menggunakan {limits.currentAccounts} dari {limits.maxAccounts} akun maksimal
                                        {!limits.canAddMore && (
                                            <span className="text-amber-600 ml-2">
                                                (Upgrade plan untuk menambah akun)
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Connect New Account */}
                {canAddMore && (
                    <Card className="border-dashed border-2 border-gray-300">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto opacity-50">
                                    <Instagram className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {hasConnectedAccount ? 'Tambah Akun Instagram' : 'Hubungkan Instagram Business'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {hasConnectedAccount
                                            ? 'Kelola lebih banyak akun Instagram dari satu dashboard'
                                            : 'Dapatkan akses untuk mengelola DM dan komentar secara otomatis'
                                        }
                                    </p>
                                </div>

                                <div className="max-w-md mx-auto">
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p>• Pastikan akun Anda adalah Instagram Business atau Creator</p>
                                        <p>• Kami akan meminta izin untuk membaca pesan dan komentar</p>
                                        <p>• Data Anda aman dan tidak akan dibagikan</p>
                                    </div>

                                    <Button
                                        onClick={handleConnectInstagram}
                                        disabled={isConnecting || isLoading}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                        size="lg"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Menghubungkan...
                                            </>
                                        ) : (
                                            <>
                                                <Instagram className="w-5 h-5 mr-2" />
                                                Hubungkan Instagram
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Account Limit Reached */}
                {!canAddMore && connectedAccounts.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Users className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                                <h3 className="font-semibold text-amber-900 mb-1">
                                    Batas Akun Tercapai
                                </h3>
                                <p className="text-sm text-amber-700">
                                    Anda telah mencapai batas maksimal akun untuk paket saat ini.
                                    Upgrade ke paket yang lebih tinggi untuk menambah lebih banyak akun.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            <Separator className="my-8" />

            {/* Action Buttons */}
            <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {hasConnectedAccount && (
                    <Button
                        onClick={handleContinueWithConnection}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                    >
                        <Check className="w-5 h-5" />
                        Completed Step
                    </Button>
                )}
            </motion.div>

            {/* Help Text */}
            <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <p className="text-sm text-gray-500">
                    Butuh bantuan menghubungkan Instagram?{' '}
                    <a href="/help/instagram-connection" className="text-blue-600 hover:underline">
                        Lihat panduan lengkap
                    </a>
                </p>
            </motion.div>
        </div >
    );

}

export default InstagramConnectionStep;