import { createAuthClient } from "better-auth/react";
import { env } from "process";

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL
})

export const { signIn, signOut, useSession } = authClient;