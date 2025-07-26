"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const forgetPasswordSchema = z.object({
    email: z.string().email("Email tidak valid"),
});

type ForgetPasswordForm = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<ForgetPasswordForm>({
        resolver: zodResolver(forgetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgetPasswordForm) => {
        setLoading(true);
        setError("");

        try {
            await forgetPassword({
                email: data.email,
                redirectTo: "/reset-password",
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat mengirim email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Left Form Section */}
            <div className="w-full md:w-1/2 p-10">
                <Link
                    href="/sign-in"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Sign In
                </Link>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Lupa Password</h2>
                    <p className="mb-6 text-sm text-gray-600">
                        Masukkan email Anda untuk menerima link reset password
                    </p>
                </div>

                {success ? (
                    <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-700">
                            Email reset password telah dikirim ke {form.getValues("email")}.
                            Silakan cek inbox atau folder spam Anda.
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="example@mail.com"
                                                disabled={loading}
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
                                disabled={loading}
                            >
                                {loading ? "Mengirim..." : "Kirim Email Reset Password"}
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