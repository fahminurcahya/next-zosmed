"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DeauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <CardTitle>Instagram Disconnected</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your Instagram account has been successfully disconnected from our application.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        All associated data will be removed according to our privacy policy.
                    </p>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/">Go to Home</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/privacy">Privacy Policy</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}