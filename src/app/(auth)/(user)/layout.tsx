import { auth } from "@/server/auth";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session?.user) {
        return redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="flex w-full m-6 max-w-4xl overflow-hidden rounded-lg shadow-lg bg-gray-50">
                {children}
            </div>
        </div>
    );
}