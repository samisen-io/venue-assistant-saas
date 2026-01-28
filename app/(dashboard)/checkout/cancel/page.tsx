"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        <XCircle className="h-16 w-16 text-gray-400" />
                    </div>
                    <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your checkout was cancelled. No charges were made.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild>
                            <Link href="/pricing">View Plans</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">Back to Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
