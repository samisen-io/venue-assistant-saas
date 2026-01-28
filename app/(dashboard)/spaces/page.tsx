"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Space } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { SpaceTable } from "@/components/spaces/SpaceTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";

export default function SpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:spaces") as ViewMode) || "grid";
        }
        return "grid";
    });

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:spaces", mode);
    };

    const fetchSpaces = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/spaces");
            if (!res.ok) throw new Error("Failed to fetch spaces");
            const data = await res.json();
            setSpaces(data);
        } catch (err) {
            setError("Could not load spaces. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchSpaces} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Spaces</h1>
                    <p className="text-gray-500 mt-1">Manage your bookable event spaces</p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button asChild>
                        <Link href="/spaces/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Space
                        </Link>
                    </Button>
                </div>
            </div>

            {spaces.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No spaces found"
                    description="Create your first bookable space to start managing events. Spaces are rooms or areas within your venue that can be reserved."
                    actionLabel="Add Space"
                    actionHref="/spaces/new"
                />
            ) : viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {spaces.map((space) => (
                        <SpaceCard key={space.id} space={space} />
                    ))}
                </div>
            ) : (
                <SpaceTable spaces={spaces} />
            )}
        </div>
    );
}
