'use client'
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from "react";
import { toast } from "sonner";

export default function InstagramCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const utils = api.useUtils();

    const handleCallbackMutation = api.instagramConnect.handleCallback.useMutation({
        onSuccess: (data) => {
            toast.success(`Successfully connected @${data.username}`);
            utils.instagramConnect.getConnectedAccounts.invalidate();
            router.push("/integrations");
        },
        onError: (error) => {
            toast.error(error.message || "Connection failed");
            router.push("/integrations");
        },
    });

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
            toast.error("Instagram authorization failed");
            router.push("/integrations");
            return;
        }

        if (code && state) {
            handleCallbackMutation.mutate({ code, state });
        }
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Connecting Instagram...</h2>
                <p className="text-muted-foreground mt-2">
                    Please wait while we complete the connection
                </p>
            </div>
        </div>
    );
}