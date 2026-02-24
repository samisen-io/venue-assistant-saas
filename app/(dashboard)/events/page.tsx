"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Event, EventStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard } from "@/components/events/EventCard";
import { EventTable } from "@/components/events/EventTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { MobileFilters } from "@/components/shared/MobileFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCanCreate } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useVenueContext } from "@/lib/context/VenueContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EVENT_STATUSES: { value: EventStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "planning", label: "Planning" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<EventStatus | "all">("all");
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const isMobile = useIsMobile();
    const { canCreate, reason: limitReason } = useCanCreate("event");
    const { activeVenue } = useVenueContext();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:events") as ViewMode) || "grid";
        }
        return "grid";
    });

    // Calculate active filter count for mobile badge
    const activeFilterCount = (searchTerm ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:events", mode);
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        setError("");
        try {
            const headers: HeadersInit = {};
            if (activeVenue) headers["X-Venue-Id"] = activeVenue.id;
            const res = await fetch("/api/events", { headers });
            if (!res.ok) throw new Error("Failed to fetch events");
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            setError("Could not load events. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [activeVenue?.id]);

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchEvents} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    {canCreate ? (
                        <Button asChild data-testid="create-event-btn">
                            <Link href="/events/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Link>
                        </Button>
                    ) : (
                        <Button data-testid="create-event-btn" onClick={() => setShowUpgradePrompt(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Button>
                    )}
                </div>
            </div>

            <MobileFilters activeFilterCount={activeFilterCount}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search events..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-[180px]">
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EventStatus | "all")}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </MobileFilters>

            {filteredEvents.length === 0 ? (
                <EmptyState
                    title={searchTerm || selectedStatus !== "all" ? "No matches found" : "No events found"}
                    description={searchTerm || selectedStatus !== "all"
                        ? "Try adjusting your search filters to find more events."
                        : "Create your first event to start managing vendors, tracking budgets, and coordinating details."}
                    actionLabel={searchTerm || selectedStatus !== "all" ? "Clear Filters" : "Create Event"}
                    {...(searchTerm || selectedStatus !== "all"
                        ? {
                            onAction: () => {
                                setSearchTerm("");
                                setSelectedStatus("all");
                            }
                        }
                        : { actionHref: "/events/new" }
                    )}
                />
            ) : isMobile || viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <EventTable events={filteredEvents} />
            )}

            <UpgradePrompt
                open={showUpgradePrompt}
                onOpenChange={setShowUpgradePrompt}
                message={limitReason || undefined}
                resource="event"
            />
        </div>
    );
}
