'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/trpc/react';

export default function InstagramCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const utils = api.useUtils();
    const [oauthParams, setOauthParams] = useState<{ code: string; state: string } | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
            setStatus('error');
            setMessage(errorDescription || error);

            // Send error to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'INSTAGRAM_OAUTH_ERROR',
                    error: errorDescription || error
                }, window.location.origin);
                window.close();
            }
            return;
        }

        if (code && state) {
            setOauthParams({ code, state });
            handleCallbackMutation.mutate({ code, state });
        } else {
            setStatus('error');
            setMessage('Parameter OAuth tidak valid');
        }
    }, [searchParams]);

    const handleCallbackMutation = api.instagramConnect.handleCallback.useMutation({
        onSuccess: (data) => {
            setStatus('success');
            setMessage('Instagram berhasil terhubung! Menutup jendela...');
            utils.instagramConnect.getConnectedAccounts.invalidate();
            // Send success data to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'INSTAGRAM_OAUTH_SUCCESS',
                    code: oauthParams!.code,
                    state: oauthParams!.state
                }, window.location.origin);

                // Close popup after a short delay
                setTimeout(() => {
                    window.close();
                }, 2000);
            }
        },
        onError: (error) => {
            setStatus('error');
            setMessage(error.message);
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        {status === 'loading' && (
                            <>
                                <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                                <h2 className="text-xl font-semibold">Memproses...</h2>
                                <p className="text-gray-600">
                                    Sedang memproses koneksi Instagram Anda
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                                <h2 className="text-xl font-semibold text-green-700">
                                    Berhasil!
                                </h2>
                                <p className="text-gray-600">{message}</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
                                <h2 className="text-xl font-semibold text-red-700">
                                    Gagal Terhubung
                                </h2>
                                <p className="text-gray-600">{message}</p>
                                <p className="text-sm text-gray-500">
                                    Jendela ini akan ditutup otomatis
                                </p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}