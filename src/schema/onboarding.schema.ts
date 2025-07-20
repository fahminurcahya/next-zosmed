import { z } from 'zod';

export const businessInfoValidationSchema = z.object({
    businessName: z
        .string()
        .min(1, 'Nama bisnis wajib diisi')
        .max(100, 'Nama bisnis maksimal 100 karakter')
        .regex(/^[a-zA-Z0-9\s&.\-()]+$/, 'Nama bisnis hanya boleh mengandung huruf, angka, spasi, dan karakter khusus (&, ., -, ())'),

    businessCategory: z.enum(['fb', 'fashion', 'education', 'health', 'technology', 'retail', 'other'], {
        errorMap: () => ({ message: 'Kategori bisnis wajib dipilih' }),
    }),

    businessSize: z.enum(['solo', 'small', 'medium', 'large'], {
        errorMap: () => ({ message: 'Ukuran bisnis wajib dipilih' }),
    }),

    location: z
        .string()
        .min(1, 'Lokasi wajib diisi')
        .max(100, 'Lokasi maksimal 100 karakter')
        .regex(/^[a-zA-Z\s,.\-]+$/, 'Lokasi hanya boleh mengandung huruf, spasi, koma, titik, dan strip'),

    goals: z
        .string()
        .min(1, 'Tujuan bisnis wajib diisi')
        .max(500, 'Tujuan bisnis maksimal 500 karakter'),

    agreements: z.boolean({
        required_error: 'Anda harus menyetujui syarat dan ketentuan',
        invalid_type_error: 'Anda harus menyetujui syarat dan ketentuan',
    }).refine(val => val === true, {
        message: 'Anda harus menyetujui syarat dan ketentuan',
    }),
});

// Plan Selection Validation Schema
export const planSelectionValidationSchema = z.object({
    planId: z.enum(['starter', 'professional', 'enterprise'], {
        errorMap: () => ({ message: 'Paket langganan wajib dipilih' }),
    }),
    billingCycle: z.enum(['monthly', 'yearly']).optional(),
});



