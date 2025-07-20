// hooks/use-signup-with-subscription.ts

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { api } from '@/trpc/react';

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

    // Mutation untuk create default subscription setelah signup
    const createDefaultSubscriptionMutation = api.user.createDefaultSubscription.useMutation();

    const signup = async (data: SignupData) => {
        setLoading(true);
        setError('');

        try {
            // Step 1: Register user dengan better-auth
            await new Promise((resolve, reject) => {
                authClient.signUp.email(data, {
                    onSuccess: (ctx) => {
                        resolve(ctx);
                    },
                    onError: (ctx) => {
                        reject(new Error(ctx.error.message));
                    },
                });
            });

            // Step 2: Create default free subscription
            await createDefaultSubscriptionMutation.mutateAsync();

            // Step 3: Redirect to onboarding
            router.push('/dashboard');

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
        isCreatingSubscription: createDefaultSubscriptionMutation.isPending
    };
};