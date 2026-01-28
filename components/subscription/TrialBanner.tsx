"use client";

import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
    daysRemaining: number;
    className?: string;
}

export function TrialBanner({ daysRemaining, className }: TrialBannerProps) {
    const isUrgent = daysRemaining <= 3;

    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border",
            isUrgent ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200",
            className
        )}>
            <div className="flex items-center gap-3">
                <Clock className={cn("h-5 w-5", isUrgent ? "text-red-600" : "text-yellow-600")} />
                <div>
                    <p className={cn("font-medium text-sm", isUrgent ? "text-red-900" : "text-yellow-900")}>
                        {daysRemaining === 0
                            ? "Your trial has expired"
                            : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in your trial`}
                    </p>
                    <p className={cn("text-xs", isUrgent ? "text-red-700" : "text-yellow-700")}>
                        {daysRemaining === 0
                            ? "Subscribe to a plan to continue using VenueManager."
                            : "Subscribe to a plan to keep using all features."}
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant={isUrgent ? "destructive" : "default"}
                asChild
            >
                <Link href="/pricing">
                    Choose Plan
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
