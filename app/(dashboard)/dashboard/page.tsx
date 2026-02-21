"use client";

import { useEffect, useState } from "react";
import { useVenueContext } from "@/lib/context/VenueContext";
import {
    Calendar,
    Users,
    DollarSign,
    Plus,
    ArrowRight,
    TrendingUp,
    Clock,
    UserPlus,
    Flame,
    Zap,
    CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/events/EventCard";
import { Event } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import Link from "next/link";

interface SubscriptionData {
    plan_tier: string;
    status: string;
    trial_ends_at: string | null;
}

interface DashboardLead {
    id: string;
    contact_name: string | null;
    event_type: string | null;
    status: string;
    priority_score: number;
    source: string;
    created_at: string;
}

function getPriorityBadge(score: number) {
    if (score >= 80) return { icon: Flame, label: "Hot", className: "text-red-600 bg-red-50" };
    if (score >= 60) return { icon: Zap, label: "Warm", className: "text-amber-600 bg-amber-50" };
    return { icon: CircleDot, label: "New", className: "text-green-600 bg-green-50" };
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeVendors: 0,
        upcomingEvents: 0,
        totalBudget: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [recentLeads, setRecentLeads] = useState<DashboardLead[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { activeVenue, isLoading: venueIsLoading } = useVenueContext();

    useEffect(() => {
        if (venueIsLoading) return;
        if (!activeVenue) {
            setIsLoading(false);
            return;
        }
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const venueHeaders = { "X-Venue-Id": activeVenue.id };
            try {
                const [eventsRes, vendorsRes, subRes, leadsRes] = await Promise.all([
                    fetch("/api/events", { headers: venueHeaders }),
                    fetch("/api/vendors", { headers: venueHeaders }),
                    fetch("/api/subscription"),
                    fetch("/api/leads", { headers: venueHeaders }),
                ]);

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

                if (leadsRes.ok) {
                    const leadsData = await leadsRes.json();
                    if (Array.isArray(leadsData)) {
                        setRecentLeads(leadsData.slice(0, 5));
                    }
                }

                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData) {
                        setSubscription(subData);
                        if (subData.status === "trialing" && subData.trial_ends_at) {
                            const remaining = new Date(subData.trial_ends_at).getTime() - Date.now();
                            setTrialDaysRemaining(Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeVenue?.id, venueIsLoading]);

    if (isLoading) return <Loading />;

    const newLeadCount = recentLeads.filter(l => l.status === "new").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {trialDaysRemaining !== null && (
                <TrialBanner daysRemaining={trialDaysRemaining} />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                        {subscription && (
                            <SubscriptionBadge tier={subscription.plan_tier} status={subscription.status} />
                        )}
                    </div>
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

                <div className="md:col-span-3 space-y-6">
                    <div className="space-y-4">
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

                    {/* Recent Leads */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">Recent Leads</h2>
                                {newLeadCount > 0 && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                        {newLeadCount}
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" asChild className="text-primary">
                                <Link href="/leads">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        {recentLeads.length > 0 ? (
                            <div className="grid gap-2">
                                {recentLeads.map((lead) => {
                                    const priority = getPriorityBadge(lead.priority_score);
                                    const PriorityIcon = priority.icon;
                                    return (
                                        <Link
                                            key={lead.id}
                                            href={`/leads/${lead.id}`}
                                            className="group flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-primary hover:shadow-sm transition-all"
                                        >
                                            <div className={`p-1.5 rounded-lg ${priority.className}`}>
                                                <PriorityIcon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {lead.contact_name || "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {lead.event_type || "Event"} &middot; {lead.status}
                                                </p>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                {timeAgo(lead.created_at)}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                                <UserPlus className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No leads yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Leads from your public page will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
