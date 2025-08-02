import { z } from "zod";

export const createNewUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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


// Update profile schema
export const updateProfileSchema = z.object({
    name: z.string()
        .min(2, "Nama minimal 2 karakter")
        .max(50, "Nama maksimal 50 karakter")
        .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi"),
    email: z.string()
        .email("Format email tidak valid")
        .max(100, "Email maksimal 100 karakter"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional()

});

// Update business info schema
export const updateBusinessInfoSchema = z.object({
    businessName: z.string()
        .min(2, "Nama bisnis minimal 2 karakter")
        .max(100, "Nama bisnis maksimal 100 karakter"),
    businessCategory: z.enum(['fb', 'fashion', 'education', 'health', 'technology', 'retail', 'other'], {
        errorMap: () => ({ message: "Kategori bisnis tidak valid" }),
    }),
    businessSize: z.enum(['solo', 'small', 'medium', 'large'], {
        errorMap: () => ({ message: "Ukuran bisnis tidak valid" }),
    }),
    location: z.string()
        .min(2, "Lokasi minimal 2 karakter")
        .max(100, "Lokasi maksimal 100 karakter"),
    goals: z.string()
        .min(10, "Goals minimal 10 karakter")
        .max(500, "Goals maksimal 500 karakter"),
});

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Password saat ini diperlukan"),
    newPassword: z.string()
        .min(8, "Password baru minimal 8 karakter")
        .max(100, "Password maksimal 100 karakter")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung minimal 1 huruf kecil, 1 huruf besar, dan 1 angka"),
    confirmPassword: z.string()
        .min(1, "Konfirmasi password diperlukan"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

// Delete account schema
export const deleteAccountSchema = z.object({
    password: z.string()
        .min(1, "Password diperlukan untuk menghapus akun"),
    confirmation: z.literal("DELETE", {
        errorMap: () => ({ message: "Ketik 'DELETE' untuk konfirmasi" }),
    }),
});

// Export types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBusinessInfoInput = z.infer<typeof updateBusinessInfoSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;