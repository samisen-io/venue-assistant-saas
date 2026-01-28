"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCard } from "./PricingCard";
import { useToast } from "@/hooks/use-toast";

interface Plan {
    name: string;
    tier: string;
    priceId: string | null;
    priceMonthly: number;
    features: string[];
}

interface PricingTableProps {
    plans: Plan[];
    currentTier?: string | null;
}

export function PricingTable({ plans, currentTier }: PricingTableProps) {
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubscribe = async (priceId: string) => {
        setLoadingPriceId(priceId);
        try {
            const response = await fetch("/api/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout session");
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start checkout. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoadingPriceId(null);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
                <PricingCard
                    key={plan.tier}
                    name={plan.name}
                    price={plan.priceMonthly}
                    features={plan.features}
                    priceId={plan.priceId}
                    isCurrentPlan={currentTier === plan.tier}
                    isPopular={plan.tier === "professional"}
                    onSubscribe={handleSubscribe}
                    isLoading={loadingPriceId === plan.priceId}
                />
            ))}
        </div>
    );
}
