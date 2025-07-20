"use client";

import { type SVGProps, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type signInSchemaType } from "@/schema/user";

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    const [error, setError] = useState('');


    const form = useForm<signInSchemaType>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: ''
        },
    });

    const onSubmit = async (data: signInSchemaType) => {
        setLoading(true);
        await authClient.signIn.email(
            data,
            {
                onSuccess: () => {
                    setLoading(false);
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    if (ctx.error.status === 403) {
                        setError("Please verify your email address");
                    } else {
                        setError(ctx.error.message)
                    }
                },
                onResponse: () => {
                    setLoading(false);
                },
            },
        );
    }


    return (
        <>
            {/* Left Form Section */}
            <div className="w-full md:w-1/2 p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                    <p className="mb-6 text-sm text-gray-600">Sign in to your account</p>
                </div>
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
                                    <FormLabel className="flex gap-1 items-center">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email"
                                            placeholder="example@mail.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex gap-1 items-center">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password"
                                            placeholder="Input password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            size={"lg"}
                            className="w-full"
                            disabled={loading}
                        >
                            Sign In
                        </Button>
                    </form>
                </Form>
                <p className="mt-6 text-sm text-center">
                    Don't have an account?{' '}
                    <a href="/sign-up" className="text-black font-semibold hover:underline">
                        Sign Up
                    </a>
                </p>
            </div>
            {/* Right Panel - Hidden on small screens */}
            <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
                <Image src={"/new-logo.png"} alt="zosmed"
                    width={350}
                    height={200}
                    className="object-cover"
                />
            </div>
        </>
    );
}

