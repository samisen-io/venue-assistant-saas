"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Client } from "@/lib/types";
import { useClients } from "@/hooks/useClients";
import { useVenueContext } from "@/lib/context/VenueContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientTable } from "@/components/clients/ClientTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { MobileFilters } from "@/components/shared/MobileFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ClientList() {
    const [searchTerm, setSearchTerm] = useState("");
    // "" means use active venue from context; a specific venue ID overrides it
    const [selectedVenueId, setSelectedVenueId] = useState("");
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:clients") as ViewMode) || "grid";
        }
        return "grid";
    });
    const { venues, activeVenue } = useVenueContext();

    const effectiveVenueId = selectedVenueId || activeVenue?.id;

    // Calculate active filter count for mobile badge
    const activeFilterCount = (searchTerm ? 1 : 0) + (selectedVenueId ? 1 : 0);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:clients", mode);
    };

    const { clients, loading, error, refetch } = useClients({
        venueId: effectiveVenueId,
        search: searchTerm || undefined,
    });

    if (loading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    const hasFilters = searchTerm.length > 0 || Boolean(selectedVenueId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button asChild>
                        <Link href="/clients/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Link>
                    </Button>
                </div>
            </div>

            <MobileFilters activeFilterCount={activeFilterCount}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search clients..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {venues.length > 1 && (
                        <div className="w-full sm:w-[220px]">
                            <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={activeVenue?.name ?? "Active Venue"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Active Venue</SelectItem>
                                    {venues.map((venue) => (
                                        <SelectItem key={venue.id} value={venue.id}>
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {venues.length === 1 && (
                        <div className="hidden sm:flex items-center text-sm text-muted-foreground gap-2">
                            <Filter className="h-4 w-4" />
                            {venues[0].name}
                        </div>
                    )}
                </div>
            </MobileFilters>

            {clients.length === 0 ? (
                <EmptyState
                    title={hasFilters ? "No matches found" : "No clients found"}
                    description={hasFilters
                        ? "Try adjusting your search filters to find more clients."
                        : "Add clients to track booking history and communication updates."}
                    actionLabel={hasFilters ? "Clear Filters" : "Add Client"}
                    {...(hasFilters
                        ? {
                            onAction: () => {
                                setSearchTerm("");
                                setSelectedVenueId("");
                            }
                        }
                        : { actionHref: "/clients/new" }
                    )}
                />
            ) : isMobile || viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {clients.map((client: Client & { event_count?: number }) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            ) : (
                <ClientTable clients={clients} />
            )}
        </div>
    );
}
