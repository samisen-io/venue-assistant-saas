"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { EventTable } from "@/components/events/EventTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:events") as ViewMode) || "grid";
        }
        return "grid";
    });

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:events", mode);
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/events");
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
    }, []);

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchEvents} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button asChild>
                        <Link href="/events/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            {events.length === 0 ? (
                <EmptyState
                    title="No events found"
                    description="Create your first event to start managing vendors, tracking budgets, and coordinating details."
                    actionLabel="Create Event"
                    actionHref="/events/new"
                />
            ) : isMobile || viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <EventTable events={events} />
            )}
        </div>
    );
}
