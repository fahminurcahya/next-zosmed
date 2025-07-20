"use client"

import { useState } from "react";
import { authClient } from "@/lib/auth-client"; // Your Better Auth client instance

interface ResendVerificationEmailProps {
    userEmail: string;
}

export default function ResendVerificationEmail({ userEmail }: ResendVerificationEmailProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResend = async () => {
        setLoading(true);
        setMessage("");

        try {
            await authClient.sendVerificationEmail({
                email: userEmail,
                callbackURL: "/email-verified-success",
            });
            setMessage("Verification email sent! Please check your inbox.");
        } catch (error: any) {
            console.error("Error sending verification email:", error);
            setMessage(`Failed to send verification email: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p>Did not receive the verification email?</p>
            <button onClick={handleResend} disabled={loading}>
                {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            {message && <p className={message.includes("Error") ? "text-red-500" : "text-green-500"}>{message}</p>}
        </div>
    );
}