"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Users,
    DollarSign,
    Plus,
    ArrowRight,
    TrendingUp,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/events/EventCard";
import { Event } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";
import Link from "next/link";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeVendors: 0,
        upcomingEvents: 0,
        totalBudget: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch venues first to get a venue_id if needed, or rely on API to return all for user
                const eventsRes = await fetch("/api/events");
                const vendorsRes = await fetch("/api/vendors");

                if (eventsRes.ok && vendorsRes.ok) {
                    const eventsData: Event[] = await eventsRes.json();
                    const vendorsData = await vendorsRes.json();

                    const now = new Date();
                    const upcoming = eventsData
                        .filter(e => new Date(e.event_date) >= now)
                        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

                    setUpcomingEvents(upcoming.slice(0, 3));
                    setStats({
                        totalEvents: eventsData.length,
                        activeVendors: vendorsData.length,
                        upcomingEvents: upcoming.length,
                        totalBudget: eventsData.reduce((acc, curr) => acc + (curr.budget_total || 0), 0)
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) return <Loading />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with your venues.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/vendors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vendor
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/events/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Event
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Upcoming Events"
                    value={stats.upcomingEvents}
                    icon={Calendar}
                    description="In the next 30 days"
                />
                <StatCard
                    title="Active Vendors"
                    value={stats.activeVendors}
                    icon={Users}
                    description="Across all venues"
                />
                <StatCard
                    title="Managed Budget"
                    value={`$${(stats.totalBudget / 1000).toFixed(1)}k`}
                    icon={DollarSign}
                    trend={{ value: 12, isPositive: true }}
                    description="Total event volume"
                />
                <StatCard
                    title="Reliability Avg"
                    value="94%"
                    icon={TrendingUp}
                    description="Vendor performance"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Upcoming Events</h2>
                        <Button variant="ghost" asChild className="text-primary">
                            <Link href="/events">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                                <p className="text-gray-500 mt-2">Ready to plan something special?</p>
                                <Button asChild className="mt-6">
                                    <Link href="/events/new">Schedule Event</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-3 space-y-4">
                    <h2 className="text-xl font-semibold">Venue Quick Links</h2>
                    <div className="grid gap-4">
                        <Link href="/venues" className="group block p-4 bg-white rounded-xl border hover:border-primary hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">My Venues</p>
                                        <p className="text-xs text-muted-foreground">Manage locations and details</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>

                        <Link href="/vendors" className="group block p-4 bg-white rounded-xl border hover:border-primary hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Preferred Vendors</p>
                                        <p className="text-xs text-muted-foreground">View performance and scores</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
