import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { addTriggerSchema, createAutomationSchema } from "@/schema/workflow";
import { z } from "zod";


export const automationRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createAutomationSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id! } })
            if (!user) throw new Error("User not found")
            const result = await ctx.db.automation.create({
                data: {
                    userId: user.id,
                    ...input,
                },
            });
            return result;

        }),

    addTriger: protectedProcedure
        .input(addTriggerSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id! } })
            if (!user) throw new Error("User not found")
            if (input.trigger.length === 2) {
                return await ctx.db.automation.update({
                    where: { id: input.id },
                    data: {
                        trigger: {
                            createMany: {
                                data: [{ type: input.trigger[0]! }, { type: input.trigger[1]! }],
                            },
                        },
                    },
                });
            }
            return await ctx.db.automation.update({
                where: {
                    id: input.id,
                },
                data: {
                    trigger: {
                        create: {
                            type: input.trigger[0]!,
                        },
                    },
                },
            });

        }),
})
