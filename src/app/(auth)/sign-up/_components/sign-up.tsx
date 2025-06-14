"use client";

import { type SVGProps, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signinGithub, signinGoogle } from "@/lib/social-login";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { createNewUserSchema, type createNewUserSchemaType } from "@/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Image from "next/image";


export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    const [error, setError] = useState('');


    const form = useForm<createNewUserSchemaType>({
        resolver: zodResolver(createNewUserSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: createNewUserSchemaType) => {
        setLoading(true);
        await authClient.signUp.email(
            data,
            {
                onSuccess: () => {
                    setLoading(false);
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
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
                    <h2 className="text-2xl font-bold mb-2">Let's get started</h2>
                    <p className="mb-6 text-sm text-gray-600">Create your account</p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex gap-1 items-center">
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field}
                                            placeholder="Input your name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex gap-1 items-center">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password"
                                            placeholder="Confirm Password"
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
                            Register
                        </Button>
                    </form>
                </Form>

                <div className="my-4 text-center text-sm text-gray-500">Or continue with</div>
                <div className="flex">
                    <button className="w-full border py-2 rounded-md hover:bg-gray-50">Google</button>
                </div>
                <p className="mt-6 text-sm text-center">
                    Already have an account?{' '}
                    <a href="/sign-in" className="text-black font-semibold hover:underline">
                        Sign In
                    </a>
                </p>
            </div>
            {/* Right Panel - Hidden on small screens */}
            <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
                <Image src={"/fulllogo2.png"} alt="zosmed"
                    width={350}
                    height={200}
                    className="object-cover"
                />
            </div>
        </>
    );
}


