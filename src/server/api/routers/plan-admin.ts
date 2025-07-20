// src/server/api/routers/plan-admin.ts

import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { planManagementService } from "@/server/services/plan-management-service";
import { seedDefaultPlans } from "@/server/helper/seed";
import { upsertPlansSchema } from "@/schema/plan-admin.schema";

export const planAdminRouter = createTRPCRouter({
    list: protectedAdminProcedure
        .input(
            z.object({
                includeInactive: z.boolean().default(false),
            })
        )
        .query(async ({ ctx, input }) => {
            const plans = await ctx.db.pricingPlan.findMany({
                where: input.includeInactive ? {} : { isActive: true },
                orderBy: { sortOrder: "asc" },
            });
            return plans;
        }),

    // Get single plan
    get: protectedAdminProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const plan = await planManagementService.getPlan(input);

            if (!plan) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Plan not found",
                });
            }

            return plan;
        }),

    // Create or update plan
    upsert: protectedAdminProcedure
        .input(upsertPlansSchema)
        .mutation(async ({ ctx, input }) => {
            return planManagementService.upsertPlan(input);
        }),

    // Toggle plan status
    toggleStatus: protectedAdminProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const plan = await ctx.db.pricingPlan.findUnique({
                where: { id: input },
            });

            if (!plan) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Plan not found",
                });
            }

            return ctx.db.pricingPlan.update({
                where: { id: input },
                data: { isActive: !plan.isActive },
            });
        }),

    // Reorder plans
    reorder: protectedAdminProcedure
        .input(
            z.array(
                z.object({
                    id: z.string(),
                    sortOrder: z.number(),
                })
            )
        )
        .mutation(async ({ ctx, input }) => {
            const updates = input.map(item =>
                ctx.db.pricingPlan.update({
                    where: { id: item.id },
                    data: { sortOrder: item.sortOrder },
                })
            );

            await ctx.db.$transaction(updates);
            return { success: true };
        }),

    // Seed default plans
    seedDefaults: protectedAdminProcedure.mutation(async ({ ctx }) => {

        const results = await Promise.all(
            seedDefaultPlans.map(plan => planManagementService.upsertPlan(plan))
        );

        return { success: true, created: results.length };
    }),
});