"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageBarProps {
    label: string;
    used: number;
    limit: number;
    className?: string;
}

export function UsageBar({ label, used, limit, className }: UsageBarProps) {
    const isUnlimited = !isFinite(limit);
    const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
    const isWarning = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={cn(
                    "text-muted-foreground",
                    isAtLimit && "text-red-600 font-medium",
                    isWarning && !isAtLimit && "text-yellow-600 font-medium"
                )}>
                    {isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <Progress
                    value={percentage}
                    className={cn(
                        "h-2",
                        isAtLimit && "[&>div]:bg-red-600",
                        isWarning && !isAtLimit && "[&>div]:bg-yellow-500"
                    )}
                />
            )}
            {isUnlimited && (
                <div className="h-2 rounded-full bg-gray-100" />
            )}
        </div>
    );
}
