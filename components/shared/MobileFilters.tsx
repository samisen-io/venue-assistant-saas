"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileFiltersProps {
    children: React.ReactNode;
    activeFilterCount?: number;
}

export function MobileFilters({ children, activeFilterCount = 0 }: MobileFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full">
            {/* Mobile toggle button - only visible on small screens */}
            <Button
                variant="outline"
                className="sm:hidden w-full justify-between mb-3"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </span>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </Button>

            {/* Filter content - hidden on mobile unless expanded, always visible on larger screens */}
            <div
                className={cn(
                    "sm:block",
                    isExpanded ? "block" : "hidden"
                )}
            >
                {children}
            </div>
        </div>
    );
}
