"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
    tier: string;
    status: string;
    className?: string;
}

const tierColors: Record<string, string> = {
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    starter: "bg-blue-100 text-blue-800 border-blue-200",
    professional: "bg-purple-100 text-purple-800 border-purple-200",
    enterprise: "bg-emerald-100 text-emerald-800 border-emerald-200",
    appsumo_tier_1: "bg-indigo-100 text-indigo-800 border-indigo-200",
    appsumo_tier_2: "bg-indigo-100 text-indigo-800 border-indigo-200",
    appsumo_tier_3: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    trialing: "bg-yellow-100 text-yellow-800",
    past_due: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
    incomplete: "bg-orange-100 text-orange-800",
};

export function SubscriptionBadge({ tier, status, className }: SubscriptionBadgeProps) {
    const isAppSumo = tier.startsWith("appsumo_");
    const tierLabel = isAppSumo 
        ? "AppSumo Lifetime Deal" 
        : tier.charAt(0).toUpperCase() + tier.slice(1);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Badge variant="outline" className={cn(tierColors[tier] || tierColors.trial)}>
                {tierLabel}
            </Badge>
            {status !== "active" && (
                <Badge variant="outline" className={cn(statusColors[status] || statusColors.incomplete)}>
                    {status.replace("_", " ")}
                </Badge>
            )}
        </div>
    );
}
