import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
        try {
            const profile = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id! },
                include: {
                    notification: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        select: {
                            id: true,
                            isSeen: true,
                        },
                        where: {
                            isSeen: false,
                        },
                    },
                    subscription: true,
                    integration: {
                        select: {
                            id: true,
                            accessToken: true,
                            expiresAt: true,
                            accountUsername: true,
                        },
                    },
                },
            })
            if (profile) return { status: 200, data: profile };
            return { status: 404 };
        } catch {
            return { status: 500 };
        }
    }),
});
