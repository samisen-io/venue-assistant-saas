"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueTable } from "@/components/venues/VenueTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:venues") as ViewMode) || "grid";
        }
        return "grid";
    });

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:venues", mode);
    };

    const fetchVenues = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/venues");
            if (!res.ok) throw new Error("Failed to fetch venues");
            const data = await res.json();
            setVenues(data);
        } catch (err) {
            setError("Could not load venues. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchVenues} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button asChild>
                        <Link href="/venues/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Venue
                        </Link>
                    </Button>
                </div>
            </div>

            {venues.length === 0 ? (
                <EmptyState
                    title="No venues found"
                    description="Get started by adding your first venue. Venues are the foundation for managing events and vendors."
                    actionLabel="Add Venue"
                    actionHref="/venues/new"
                />
            ) : isMobile || viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {venues.map((venue) => (
                        <VenueCard key={venue.id} venue={venue} />
                    ))}
                </div>
            ) : (
                <VenueTable venues={venues} />
            )}
        </div>
    );
}
