import { z } from "zod";

export const createNewUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type createNewUserSchemaType = z.infer<typeof createNewUserSchema>;

export const signInSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export type signInSchemaType = z.infer<typeof signInSchema>;