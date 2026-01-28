"use client";

import { useEffect, useState } from "react";
import { PricingTable } from "@/components/subscription/PricingTable";
import { Loading } from "@/components/shared/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
    name: string;
    tier: string;
    priceId: string | null;
    priceMonthly: number;
    features: string[];
}

const FAQ_ITEMS = [
    {
        question: "Can I switch plans later?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
    {
        question: "Is there a free trial?",
        answer: "Yes! Every new account starts with a 14-day free trial with access to Starter plan features.",
    },
    {
        question: "What happens when I reach my plan limits?",
        answer: "You'll be prompted to upgrade your plan. Your existing data remains accessible, but you won't be able to create new resources beyond your limit.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.",
    },
];

export default function PricingPage() {
    const [currentTier, setCurrentTier] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, plansRes] = await Promise.all([
                    fetch("/api/subscription").catch(() => null),
                    fetch("/api/subscription/plans"),
                ]);

                if (subRes?.ok) {
                    const data = await subRes.json();
                    setCurrentTier(data?.plan_tier || null);
                }
                if (plansRes.ok) {
                    setPlans(await plansRes.json());
                }
            } catch {
                // User may not be logged in on marketing page
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your venue management needs. Start with a 14-day free trial.
                    </p>
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <PricingTable plans={plans} currentTier={currentTier} />
                )}

                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
                        {FAQ_ITEMS.map((item, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{item.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
