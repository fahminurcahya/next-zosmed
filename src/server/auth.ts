import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { cache } from "react";
import sendVerificationMail from "./services/email-service";
import { UserService } from "./services/user-service";
import { replaceCallbackURL } from "./helper/common";
import { ur } from "zod/v4/locales";

const prisma = new PrismaClient();
const userService = new UserService();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const newUrl = replaceCallbackURL(url, "/dashboard")
            await sendVerificationMail({
                email: user.email,
                name: user.name,
                verificationUrl: newUrl,
            });
        },
        sendOnSignUp: true,
        expiresIn: 3600,
        autoSignInAfterVerification: true,
        async onEmailVerification(user, request) {
            await userService.createDefaultPlan(user.id)
        },

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
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "customer",
                input: false,
            },
            hasOnboarding: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
        },
    },
    secret: process.env.BETTER_AUTH_SECRET
});

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers()
    })
})