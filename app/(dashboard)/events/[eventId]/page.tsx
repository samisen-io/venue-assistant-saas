"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarDays, DollarSign, Edit, MapPin, Users, Settings, Send, CheckCircle2 } from "lucide-react";

import { Event, Venue, EventVendor, VendorCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { formatCurrency } from "@/lib/utils/format";

import { EventVendorsList } from "@/components/events/EventVendorsList";
import { VendorMatching } from "@/components/events/VendorMatching";
import { EventBudget } from "@/components/events/EventBudget";
import { CommunicationsList } from "@/components/communications/CommunicationsList";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

type EventDetailData = Event & {
    venues: Venue;
    event_vendors: EventVendor[];
};

export default function EventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<EventDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [isStartingAgent, setIsStartingAgent] = useState(false);

    const handleVendorAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleStartAgent = async () => {
        if (!confirm("Start AI agent to contact vendors? The agent will send professional outreach emails to matched vendors for this event.")) {
            return;
        }

        setIsStartingAgent(true);
        try {
            const res = await fetch('/api/agent/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start agent');
            }

            const data = await res.json();
            alert(`AI Agent started successfully! Agent Run ID: ${data.agentRunId}\n\nThe agent will now contact vendors and you can monitor progress in the Communications tab.`);

            // Optionally redirect to communications page
            // router.push(`/events/${eventId}/communications`);
        } catch (err: any) {
            alert(`Error starting agent: ${err.message}`);
        } finally {
            setIsStartingAgent(false);
        }
    };

    const fetchEventDetails = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}`);
            if (!res.ok) throw new Error("Failed to fetch event details");
            const data = await res.json();
            setEvent(data);
        } catch (err) {
            setError("Could not load event details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "planning": return "bg-blue-100 text-blue-800";
            case "confirmed": return "bg-green-100 text-green-800";
            case "completed": return "bg-gray-100 text-gray-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getCategoryLabel = (category: VendorCategory): string => {
        const labels: Record<VendorCategory, string> = {
            catering: "Catering",
            av: "AV Equipment",
            florals: "Florals & Decor",
            photography: "Photography",
            entertainment: "Entertainment",
            parking: "Parking",
            security: "Security",
            other: "Other Services",
        };
        return labels[category] || category;
    };

    // Extract services needed from budget_breakdown
    const servicesNeeded = event?.budget_breakdown
        ? Object.keys(event.budget_breakdown as Record<string, number>) as VendorCategory[]
        : [];

    // Check which services have vendors assigned
    const assignedCategories = new Set(
        event?.event_vendors?.map(ev => ev.category) || []
    );

    if (isLoading) return <Loading />;

    if (error || !event) return <ErrorMessage message={error || "Event not found"} onRetry={fetchEventDetails} />;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Events", href: "/events" },
                    { label: event.event_name }
                ]}
            />
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{event.event_name}</h1>
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
                            {event.event_time && <span>at {event.event_time}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venues?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.guest_count} Guests</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {event.status === "planning" && (
                        <Button
                            onClick={handleStartAgent}
                            disabled={isStartingAgent}
                            variant="default"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isStartingAgent ? "Starting..." : "Contact Vendors with AI"}
                        </Button>
                    )}
                    {event.status !== "completed" && (
                        <Button
                            onClick={async () => {
                                if (!confirm("Is this event over? You will be directed to review your vendors.")) return;
                                await fetch(`/api/events/${eventId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'completed' })
                                });
                                router.push(`/events/${eventId}/review`);
                            }}
                        >
                            Complete Event
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/events/${eventId}/edit`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vendors">Vendors</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(event.budget_total)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Vendors Booked</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {event.event_vendors?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Services Needed Section */}
                    {servicesNeeded.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Services Needed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                    {servicesNeeded.map((category) => {
                                        const isAssigned = assignedCategories.has(category);
                                        const budgetAmount = (event.budget_breakdown as Record<string, number>)?.[category] || 0;
                                        return (
                                            <div
                                                key={category}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                                    isAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isAssigned && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium">{getCategoryLabel(category)}</div>
                                                        <div className="text-xs text-gray-500">{formatCurrency(budgetAmount)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    {assignedCategories.size} of {servicesNeeded.length} services have vendors assigned
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">No recent activity recorded.</p>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Event Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 whitespace-pre-wrap">
                                    {event.description || "No notes available."}
                                </p>
                                {event.special_requirements && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-1">Special Requirements</h4>
                                        <p className="text-sm text-gray-500">{event.special_requirements}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="vendors" className="space-y-8">
                    <EventVendorsList eventId={eventId} refreshKey={refreshKey} />
                    <VendorMatching event={event} onVendorAdded={handleVendorAdded} />
                </TabsContent>

                <TabsContent value="budget">
                    <EventBudget
                        eventId={eventId}
                        totalBudget={event.budget_total}
                        refreshKey={refreshKey}
                    />
                </TabsContent>

                <TabsContent value="communications" className="space-y-4">
                    <CommunicationsList eventId={eventId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
