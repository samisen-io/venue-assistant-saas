"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { TrialBanner } from "./TrialBanner";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function PaymentFailureBanner({ className }: Readonly<{ className?: string }>) {
    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-200",
            className
        )}>
            <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                    <p className="font-medium text-sm text-red-900">
                        Payment Failed
                    </p>
                    <p className="text-xs text-red-700">
                        Your last payment failed. Please update your payment method to continue using VenueManager.
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant="destructive"
                asChild
            >
                <Link href="/settings/subscription">
                    <CreditCard className="mr-1 h-4 w-4" />
                    Update Payment
                </Link>
            </Button>
        </div>
    );
}

function CancellationBanner({ endDate, className }: Readonly<{ endDate: string; className?: string }>) {
    const formattedDate = new Date(endDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-lg border bg-yellow-50 border-yellow-200",
            className
        )}>
            <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                    <p className="font-medium text-sm text-yellow-900">
                        Subscription Cancelling
                    </p>
                    <p className="text-xs text-yellow-700">
                        Your subscription will end on {formattedDate}. Reactivate to keep using VenueManager.
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant="outline"
                asChild
            >
                <Link href="/settings/subscription">
                    Reactivate
                </Link>
            </Button>
        </div>
    );
}

export function SubscriptionBanner() {
    const { subscription, loading } = useSubscription();

    if (loading || !subscription) {
        return null;
    }

    // Show payment failure banner for past_due status
    if (subscription.status === "past_due") {
        return <PaymentFailureBanner className="mx-4 mt-4 md:mx-6" />;
    }

    // Show cancellation banner if subscription is set to cancel
    if (subscription.cancel_at_period_end && subscription.current_period_end) {
        return <CancellationBanner endDate={subscription.current_period_end} className="mx-4 mt-4 md:mx-6" />;
    }

    // Show trial banner for trial status
    if (subscription.status === "trialing" && subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        // Only show if within 7 days of trial ending
        if (daysRemaining <= 7) {
            return <TrialBanner daysRemaining={daysRemaining} className="mx-4 mt-4 md:mx-6" />;
        }
    }

    return null;
}
