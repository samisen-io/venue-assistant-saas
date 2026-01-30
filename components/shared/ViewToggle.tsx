"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "table";

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
    return (
        <div className="hidden sm:flex items-center border rounded-md">
            <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none px-2.5"
                onClick={() => onViewModeChange("grid")}
                aria-label="Grid view"
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none px-2.5"
                onClick={() => onViewModeChange("table")}
                aria-label="Table view"
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}
