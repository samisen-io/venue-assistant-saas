"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
    name: string;
    price: number;
    features: string[];
    priceId: string | null;
    isCurrentPlan?: boolean;
    isPopular?: boolean;
    onSubscribe: (priceId: string) => void;
    isLoading?: boolean;
}

export function PricingCard({
    name,
    price,
    features,
    priceId,
    isCurrentPlan = false,
    isPopular = false,
    onSubscribe,
    isLoading = false,
}: PricingCardProps) {
    return (
        <Card className={cn(
            "relative flex flex-col",
            isPopular && "border-blue-600 shadow-lg scale-105",
            isCurrentPlan && "border-green-600"
        )}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
            )}
            {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                </div>
            )}
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription>
                    <span className="text-3xl font-bold text-foreground">${price}</span>
                    <span className="text-muted-foreground">/month</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                    disabled={isCurrentPlan || isLoading || !priceId}
                    onClick={() => priceId && onSubscribe(priceId)}
                >
                    {isCurrentPlan ? "Current Plan" : isLoading ? "Loading..." : "Subscribe"}
                </Button>
            </CardContent>
        </Card>
    );
}
