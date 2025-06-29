import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const integrationRouter = createTRPCRouter({
    deleteIntegration: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.integration.delete({
            where: {
                id: input.id,
                userId: ctx.session.user.id,
            },

            select: {
                userId: true,
            },
        });
    }),
});
