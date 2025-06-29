"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DataDeletionStatusPage() {
    const searchParams = useSearchParams();
    const confirmationCode = searchParams.get("code");

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-500" />
                        <CardTitle>Data Deletion Request</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Your data deletion request has been received and is being processed.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">What happens next:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>All your Instagram data will be deleted within 24 hours</li>
                            <li>This includes comments, messages, and connection information</li>
                            <li>This action cannot be undone</li>
                        </ul>
                    </div>

                    {confirmationCode && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium">Confirmation Code:</p>
                            <p className="text-xs font-mono">{confirmationCode}</p>
                        </div>
                    )}

                    <Button asChild className="w-full">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
