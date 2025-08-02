"use client";

import { type SVGProps, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { signinGithub, signinGoogle } from "@/lib/social-login";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { createNewUserSchema, type createNewUserSchemaType } from "@/schema/user";
import { useSignupWithSubscription } from "@/hooks/use-signup-with-subscription";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SignUp() {
    const router = useRouter();
    const { signup, loading, error } = useSignupWithSubscription();

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
        await signup(data);
    }

    const isProcessing = loading;

    return (
        <>
            {/* Left Form Section */}
            <div className="w-full md:w-1/2 p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Let's get started</h2>
                    <p className="mb-6 text-sm text-gray-600">Create your account and get started for free</p>
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
                                        <Input
                                            {...field}
                                            placeholder="Input your name"
                                            disabled={isProcessing}
                                            className={isProcessing ? "opacity-50" : ""}
                                        />
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
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="example@mail.com"
                                            disabled={isProcessing}
                                            className={isProcessing ? "opacity-50" : ""}
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
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Input password"
                                            disabled={isProcessing}
                                            className={isProcessing ? "opacity-50" : ""}
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
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="Confirm Password"
                                            disabled={isProcessing}
                                            className={isProcessing ? "opacity-50" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
                                <p className="font-medium">Registration failed</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Free Plan Benefits */}
                        <div className={`bg-green-50 border border-green-200 rounded-lg p-4 transition-opacity ${isProcessing ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-sm font-medium text-green-900">
                                    Free Plan Included
                                </p>
                            </div>
                            <ul className="text-xs text-green-700 space-y-1">
                                <li>• 1 Instagram account</li>
                                <li>• 100 DM per month</li>
                                <li>• Basic automation features</li>
                                <li>• No credit card required</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            size={"lg"}
                            className="w-full flex items-center justify-center gap-2"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Free Account'
                            )}
                        </Button>
                    </form>
                </Form>

                <p className={`mt-6 text-sm text-center transition-opacity ${isProcessing ? 'opacity-50' : ''}`}>
                    Already have an account?{' '}
                    <a
                        href="/sign-in"
                        className={`text-black font-semibold hover:underline ${isProcessing ? 'pointer-events-none' : ''}`}
                    >
                        Sign In
                    </a>
                </p>

                <p className={`mt-4 text-xs text-center text-gray-500 transition-opacity ${isProcessing ? 'opacity-50' : ''}`}>
                    By signing up, you agree to our{' '}
                    <a
                        href="/legal/tos"
                        className={`underline ${isProcessing ? 'pointer-events-none' : ''}`}
                    >
                        Terms of Service
                    </a>
                    {' '}and{' '}
                    <a
                        href="/legal/privacy"
                        className={`underline ${isProcessing ? 'pointer-events-none' : ''}`}
                    >
                        Privacy Policy
                    </a>
                </p>
            </div>

            {/* Right Panel - Hidden on small screens */}
            <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
                <Image
                    src={"/new-logo.png"}
                    alt="zosmed"
                    width={350}
                    height={200}
                    className="object-cover"
                />
            </div>
        </>
    );
}