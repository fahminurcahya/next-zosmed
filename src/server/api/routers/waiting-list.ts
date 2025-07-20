import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { queueLaunchNotification, queueWelcomeEmail } from "@/server/services/email-queue";
import { discountService } from "@/server/services/discount-service";

export const waitinglistRouter = createTRPCRouter({
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email("Email tidak valid"),
                name: z.string().min(2, "Nama minimal 2 karakter"),
                phone: z.string().optional(),
                referralSource: z.string().optional(),
                interestedPlan: z.enum(["FREE", "STARTER", "PRO"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;

            // Get IP and user agent
            const headersList = headers();
            const ipAddress = (await headersList).get("x-forwarded-for") || "unknown";
            const userAgent = (await headersList).get("user-agent") || "unknown";

            // Check if email already exists
            const existing = await db.waitinglist.findUnique({
                where: { email: input.email },
            });

            if (existing) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Email sudah terdaftar di waiting list",
                });
            }

            // Create entry
            const waitinglist = await db.waitinglist.create({
                data: {
                    ...input,
                    ipAddress,
                    userAgent,
                    metadata: {
                        source: "website",
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            // Generate discount code for non-FREE plans
            if (input.interestedPlan !== "FREE") {
                await discountService.generateWaitinglistDiscount(waitinglist.id);
            }

            // Queue welcome email
            await queueWelcomeEmail({
                email: waitinglist.email,
                name: waitinglist.name,
                plan: waitinglist.interestedPlan,
            });

            return {
                success: true,
                message: "Berhasil terdaftar di waiting list",
                data: {
                    id: waitinglist.id,
                    email: waitinglist.email,
                },
            };
        }),

    // Admin - Get waitinglist stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const { db } = ctx;

        const [total, notified, byPlan] = await Promise.all([
            db.waitinglist.count(),
            db.waitinglist.count({ where: { isNotified: true } }),
            db.waitinglist.groupBy({
                by: ["interestedPlan"],
                _count: { id: true },
            }),
        ]);

        return {
            total,
            notified,
            unnotified: total - notified,
            byPlan: byPlan.map((p) => ({
                plan: p.interestedPlan,
                count: p._count.id,
            })),
        };
    }),

    // Admin - Get all users
    getAll: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                offset: z.number().default(0),
                filter: z.enum(["all", "pending", "notified"]).default("all"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { db } = ctx;
            const { limit, offset, filter } = input;

            const where = filter === "all"
                ? {}
                : { isNotified: filter === "notified" };

            const [users, total] = await Promise.all([
                db.waitinglist.findMany({
                    where,
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: "desc" },
                }),
                db.waitinglist.count({ where }),
            ]);

            return {
                users,
                total,
                hasMore: offset + limit < total,
            };
        }),

    // Admin - Send launch notifications
    sendLaunchNotifications: protectedProcedure
        .input(
            z.object({
                batchSize: z.number().min(1).max(100).default(50),
                testMode: z.boolean().default(false),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
            const { batchSize, testMode } = input;

            // Get unnotified users
            const users = await db.waitinglist.findMany({
                where: { isNotified: false },
                include: {
                    discountCode: {
                        select: {
                            code: true,
                        }
                    }
                },
                take: batchSize,
                orderBy: { createdAt: "asc" },
            });

            if (users.length === 0) {
                return {
                    success: true,
                    notified: 0,
                    message: "Tidak ada user untuk dinotifikasi",
                };
            }

            if (!testMode) {
                // Queue launch emails
                await queueLaunchNotification(users);
            }

            return {
                success: true,
                notified: users.length,
                testMode,
                message: testMode
                    ? `Test mode: ${users.length} user akan dinotifikasi`
                    : `${users.length} notifikasi telah di-queue`,
            };
        }),

    // Public - Check if email is registered
    checkEmail: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ ctx, input }) => {
            const { db } = ctx;

            const exists = await db.waitinglist.findUnique({
                where: { email: input.email },
                select: { id: true },
            });

            return { exists: !!exists };
        }),
});