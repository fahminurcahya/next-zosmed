"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar")
        .regex(/[a-z]/, "Password harus mengandung huruf kecil")
        .regex(/[0-9]/, "Password harus mengandung angka")
        .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter spesial"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Get token from URL
    const token = searchParams.get("token");

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            setError("Token tidak valid. Silakan request reset password lagi.");
        }
    }, [token]);

    const onSubmit = async (data: ResetPasswordForm) => {
        if (!token) {
            setError("Token tidak ditemukan");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await resetPassword({
                newPassword: data.password,
                token,
            });

            setSuccess(true);

            // Redirect ke sign in setelah 3 detik
            setTimeout(() => {
                router.push("/sign-in");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Gagal reset password. Token mungkin sudah expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Left Form Section */}
            <div className="w-full md:w-1/2 p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                    <p className="mb-6 text-sm text-gray-600">
                        Masukkan password baru Anda
                    </p>
                </div>

                {success ? (
                    <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-700">
                            Password berhasil direset! Anda akan diarahkan ke halaman Sign In...
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password Baru</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Masukkan password baru"
                                                disabled={loading || !token}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konfirmasi Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Konfirmasi password baru"
                                                disabled={loading || !token}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertDescription className="text-red-700">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading || !token}
                            >
                                {loading ? "Mereset..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                )}
            </div>

            {/* Right Panel */}
            <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
                <Image
                    src="/new-logo.png"
                    alt="zosmed"
                    width={350}
                    height={200}
                    className="object-cover"
                />
            </div>
        </>
    );
}