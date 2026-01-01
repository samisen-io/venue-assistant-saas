import { LucideIcon, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon = FileX,
    title,
    description,
    actionLabel,
    actionHref,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
                <Icon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 mb-6 text-sm text-gray-500 max-w-sm">
                {description}
            </p>
            {actionLabel && (actionHref || onAction) && (
                actionHref ? (
                    <Button asChild>
                        <Link href={actionHref}>{actionLabel}</Link>
                    </Button>
                ) : (
                    <Button onClick={onAction}>
                        {actionLabel}
                    </Button>
                )
            )}
        </div>
    );
}
