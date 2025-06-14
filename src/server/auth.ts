import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { cache } from "react";
// If your Prisma file is located elsewhere, you can change the path

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        nextCookies()
    ],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },

});

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers()
    })
})