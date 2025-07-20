import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getQueueStats, processEmailQueue } from "@/server/services/email-queue";

export const emailQueueRouter = createTRPCRouter({
    getStats: protectedProcedure.query(async ({ ctx }) => {
        try {
            const stats = await getQueueStats();
            return stats;
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get queue stats",
            });
        }
    }),

    processQueue: protectedProcedure.mutation(async ({ ctx }) => {
        // Check admin role
        // if (ctx.session.user.role !== "ADMIN") {
        //   throw new TRPCError({
        //     code: "FORBIDDEN",
        //     message: "Admin access required",
        //   });
        // }

        try {
            await processEmailQueue();
            const stats = await getQueueStats();

            return {
                success: true,
                message: "Queue processed successfully",
                stats,
            };
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to process queue",
            });
        }
    }),

    getFailedJobs: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
            })
        )
        .query(async ({ ctx, input }) => {
            return {
                jobs: [],
                total: 0,
            };
        }),
});