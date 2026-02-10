"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState<"syncing" | "success" | "error">("syncing");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const syncSubscription = async () => {
            if (!sessionId) {
                setStatus("error");
                setError("No session ID found");
                return;
            }

            try {
                const res = await fetch("/api/subscription/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });

                if (!res.ok) {
                    throw new Error("Failed to sync subscription");
                }

                setStatus("success");

                // Redirect after success
                setTimeout(() => {
                    router.push("/settings/subscription");
                }, 2000);
            } catch (err) {
                console.error("Sync error:", err);
                setStatus("error");
                setError("Failed to activate subscription. Please contact support.");
            }
        };

        syncSubscription();
    }, [sessionId, router]);

    if (status === "syncing") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4">
                            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                        </div>
                        <CardTitle className="text-2xl">Activating Subscription...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please wait while we set up your account.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4">
                            <AlertCircle className="h-16 w-16 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={() => router.push("/settings/subscription")}>
                            Go to Subscription Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Subscription Active!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Your subscription has been activated. You now have access to all
                        features included in your plan.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Redirecting to subscription settings...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
