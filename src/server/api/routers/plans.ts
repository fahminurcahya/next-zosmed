import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { planManagementService } from "@/server/services/plan-management-service";

export const plansRouter = createTRPCRouter({
    getActivePlans: publicProcedure.query(async ({ ctx }) => {
        return planManagementService.getActivePlans();
    }),

    getPlan: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return planManagementService.getPlan(input);
        }),

});