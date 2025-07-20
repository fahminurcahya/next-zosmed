import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface SignupData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const useSignupWithSubscription = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const signup = async (data: SignupData) => {
        setLoading(true);
        setError('');

        try {
            // Step 1: Register user dengan better-auth
            await new Promise((resolve, reject) => {
                authClient.signUp.email(data, {
                    onSuccess: (ctx) => {
                        toast.success("Registration successful! Please check your email to verify your account.")
                        resolve(ctx);
                    },
                    onError: (ctx) => {
                        reject(new Error(ctx.error.message));
                    },
                });
            });

            // Step 3: Redirect to onboarding
            router.push('/sign-in');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        signup,
        loading,
        error,
    };
};