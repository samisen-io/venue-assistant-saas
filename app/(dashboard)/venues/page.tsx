"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueTable } from "@/components/venues/VenueTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useToast } from "@/hooks/use-toast";
import { useVenueContext } from "@/lib/context/VenueContext";
import { Badge } from "@/components/ui/badge";

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
    const [settingDefault, setSettingDefault] = useState<string | null>(null);
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const { refreshVenues, setActiveVenue } = useVenueContext();
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

    const handleAddVenue = async () => {
        // Check server-side limit before navigating
        const res = await fetch("/api/venues/check-limit");
        if (res.status === 403) {
            const data = await res.json();
            setUpgradeReason(data.reason || "Upgrade your plan to add more venues.");
            setShowUpgradePrompt(true);
            return;
        }
        window.location.href = "/venues/new";
    };

    const handleSetDefault = async (venue: Venue) => {
        setSettingDefault(venue.id);
        try {
            const res = await fetch(`/api/venues/${venue.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_default: true }),
            });
            if (!res.ok) throw new Error("Failed to set default");
            await fetchVenues();
            await refreshVenues();
            setActiveVenue(venue);
            toast({ title: "Default venue updated", description: `${venue.name} is now your default venue.` });
        } catch {
            toast({ title: "Error", description: "Could not update default venue.", variant: "destructive" });
        } finally {
            setSettingDefault(null);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage message={error} onRetry={fetchVenues} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your venues. Use the switcher in the header to change your active venue.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button data-testid="add-venue-btn" onClick={handleAddVenue}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Venue
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
                        <div key={venue.id} className="relative">
                            {(venue as any).is_default && (
                                <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    Default
                                </Badge>
                            )}
                            <VenueCard venue={venue} />
                            {!(venue as any).is_default && (
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground"
                                        disabled={settingDefault === venue.id}
                                        onClick={() => handleSetDefault(venue)}
                                    >
                                        <Star className="mr-1 h-3 w-3" />
                                        {settingDefault === venue.id ? "Setting..." : "Set as Default"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <VenueTable venues={venues} />
            )}

            <UpgradePrompt
                open={showUpgradePrompt}
                onOpenChange={setShowUpgradePrompt}
                message={upgradeReason}
                resource="venue"
            />
        </div>
    );
}
