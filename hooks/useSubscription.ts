"use client";

import { useEffect, useState, useCallback } from "react";

interface Subscription {
    id: string;
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    plan_tier: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_ends_at: string | null;
}

interface Usage {
    spaces_created: number;
    events_created: number;
    vendors_created: number;
    month: string;
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription");
            if (res.ok) {
                setSubscription(await res.json());
            }
        } catch (err) {
            setError("Failed to fetch subscription");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    return { subscription, loading, error, refetch: fetchSubscription };
}

export function useUsage() {
    const [usage, setUsage] = useState<Usage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/subscription/usage");
            if (res.ok) {
                setUsage(await res.json());
            }
        } catch (err) {
            setError("Failed to fetch usage");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    return { usage, loading, error, refetch: fetchUsage };
}

const PLAN_LIMITS: Record<string, { maxSpaces: number; maxEventsPerMonth: number; maxVendors: number }> = {
    trial: { maxSpaces: 1, maxEventsPerMonth: 5, maxVendors: 10 },
    starter: { maxSpaces: 1, maxEventsPerMonth: 10, maxVendors: 50 },
    professional: { maxSpaces: 3, maxEventsPerMonth: 50, maxVendors: Infinity },
    enterprise: { maxSpaces: Infinity, maxEventsPerMonth: Infinity, maxVendors: Infinity },
};

export function useCanCreate(resource: "space" | "event" | "vendor") {
    const { subscription, loading: subLoading } = useSubscription();
    const { usage, loading: usageLoading } = useUsage();

    const loading = subLoading || usageLoading;

    if (loading || !subscription || !usage) {
        return { canCreate: true, loading, reason: null };
    }

    if (subscription.status !== "active" && subscription.status !== "trialing") {
        return { canCreate: false, loading: false, reason: "Your subscription is not active." };
    }

    const limits = PLAN_LIMITS[subscription.plan_tier] || PLAN_LIMITS.trial;

    switch (resource) {
        case "space":
            if (limits.maxSpaces !== Infinity && usage.spaces_created >= limits.maxSpaces) {
                return { canCreate: false, loading: false, reason: `Space limit reached (${limits.maxSpaces})` };
            }
            break;
        case "event":
            if (limits.maxEventsPerMonth !== Infinity && usage.events_created >= limits.maxEventsPerMonth) {
                return { canCreate: false, loading: false, reason: `Monthly event limit reached (${limits.maxEventsPerMonth})` };
            }
            break;
        case "vendor":
            if (limits.maxVendors !== Infinity && usage.vendors_created >= limits.maxVendors) {
                return { canCreate: false, loading: false, reason: `Vendor limit reached (${limits.maxVendors})` };
            }
            break;
    }

    return { canCreate: true, loading: false, reason: null };
}
