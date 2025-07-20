import { z } from "zod";

export const upsertPlansSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    description: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().default("IDR"),
    period: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"]).default("MONTHLY"),
    color: z.string(),
    bgColor: z.string(),
    borderColor: z.string(),
    popular: z.boolean().default(false),
    badge: z.string().optional().nullable(),
    maxAccounts: z.number().min(1),
    maxDMPerMonth: z.number().min(0),
    maxAIReplyPerMonth: z.number().min(0),
    features: z.object({
        included: z.array(z.string()),
        notIncluded: z.array(z.string()),
    }),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0),
})

export type upsertPlansSchemaType = z.infer<typeof upsertPlansSchema>;
