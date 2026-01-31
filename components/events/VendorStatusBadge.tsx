"use client";

import {
    Clock,
    Send,
    CheckCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    X,
    HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { VendorOutreachStatus } from "@/lib/types/vendor-outreach.types";
import {
    getStatusLabel,
    getStatusDescription,
    getStatusBadgeClasses,
    getStatusIcon
} from "@/lib/utils/vendorOutreachStatus";

interface VendorStatusBadgeProps {
    status: VendorOutreachStatus | null;
    showTooltip?: boolean;
    timestamp?: string | null;
    className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Clock,
    Send,
    CheckCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    X,
    HelpCircle
};

export function VendorStatusBadge({
    status,
    showTooltip = true,
    timestamp,
    className = ""
}: VendorStatusBadgeProps) {
    const label = getStatusLabel(status);
    const description = getStatusDescription(status);
    const badgeClasses = getStatusBadgeClasses(status);
    const iconName = getStatusIcon(status);
    const Icon = iconMap[iconName] || HelpCircle;

    const badge = (
        <Badge
            variant="outline"
            className={`${badgeClasses} ${className} gap-1 font-medium`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );

    if (!showTooltip) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(timestamp).toLocaleDateString()} at{" "}
                            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
