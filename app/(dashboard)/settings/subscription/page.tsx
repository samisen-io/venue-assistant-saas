"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { UsageBar } from "@/components/subscription/UsageBar";
import { Loading } from "@/components/shared/Loading";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/stripe/config";
import { getPlanLimits } from "@/lib/subscription/limits";
import { getSafeRedirectUrl } from "@/lib/utils/safeUrl";

interface Subscription {
    plan_tier: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    trial_ends_at: string | null;
}

interface Usage {
    venues_created: number;
    events_created: number;
    vendors_created: number;
}

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<Usage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, usageRes] = await Promise.all([
                    fetch("/api/subscription"),
                    fetch("/api/subscription/usage"),
                ]);
                if (subRes.ok) setSubscription(await subRes.json());
                if (usageRes.ok) setUsage(await usageRes.json());
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleManageSubscription = async () => {
        setIsPortalLoading(true);
        try {
            const res = await fetch("/api/subscription/portal", { method: "POST" });
            if (!res.ok) throw new Error("Failed to create portal session");
            const { url } = await res.json();
            const safeUrl = getSafeRedirectUrl(url);
            if (!safeUrl) throw new Error("Invalid portal URL");
            window.location.href = safeUrl;
        } catch {
            toast({
                title: "Error",
                description: "Failed to open billing portal. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsPortalLoading(false);
        }
    };

    if (isLoading) return <Loading />;

    const tier = subscription?.plan_tier || "trial";
    const limits = getPlanLimits(tier);
    const isAppSumo = tier.startsWith("appsumo_");

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Subscription</h1>
                <p className="text-muted-foreground mt-1">Manage your plan and billing.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Your subscription details and billing cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <SubscriptionBadge
                                        tier={subscription.plan_tier}
                                        status={subscription.status}
                                    />
                                    {subscription.cancel_at_period_end && (
                                        <span className="text-sm text-red-600 font-medium">
                                            Cancels at period end
                                        </span>
                                    )}
                                </div>
                                {subscription.current_period_end && (
                                    <p className="text-sm text-muted-foreground">
                                        Current period ends:{" "}
                                        {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </p>
                                )}
                                {subscription.status === "trialing" && subscription.trial_ends_at && (
                                    <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                        Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
                                    </p>
                                )}
                                {!isAppSumo && (
                                    <div className="flex gap-3 pt-2">
                                        <Button onClick={handleManageSubscription} disabled={isPortalLoading}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {isPortalLoading ? "Loading..." : "Manage Subscription"}
                                        </Button>
                                        {tier !== "enterprise" && (
                                            <Button variant="outline" asChild>
                                                <Link href="/pricing">
                                                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                                                    Upgrade Plan
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground mb-4">
                                    You don&apos;t have an active subscription.
                                </p>
                                <Button asChild>
                                    <Link href="/pricing">Choose a Plan</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {usage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage This Month</CardTitle>
                            <CardDescription>Track your resource usage against plan limits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <UsageBar
                                label="Venues"
                                used={usage.venues_created}
                                limit={limits.maxVenues}
                            />
                            <UsageBar
                                label="Events"
                                used={usage.events_created}
                                limit={limits.maxEventsPerMonth}
                            />
                            <UsageBar
                                label="Vendors"
                                used={usage.vendors_created}
                                limit={limits.maxVendors}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
