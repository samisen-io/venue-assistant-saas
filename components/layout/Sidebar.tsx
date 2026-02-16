"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    Calendar,
    LayoutDashboard,
    Settings,
    Store,
    Users,
    Briefcase,
    LogOut,
    RefreshCw,
    Building2,
    TrendingUp,
    Globe,
    ChevronLeft,
    Megaphone,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpCircle } from "lucide-react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
    },
    {
        title: "Events",
        href: "/events",
        icon: CalendarDays,
    },
    {
        title: "Spaces",
        href: "/spaces",
        icon: Building2,
    },
    {
        title: "Vendors",
        href: "/vendors",
        icon: Briefcase,
    },
    {
        title: "Clients",
        href: "/clients",
        icon: Users,
    },
    {
        title: "Leads",
        href: "/leads",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

const dynamicItems = (venueId?: string, venueSlug?: string | null) => {
    const items = [];
    if (venueId) {
        items.push({
            title: "Public Page",
            href: `/venues/${venueId}/public-page`,
            icon: Globe,
        });
        items.push({
            title: "Marketplace",
            href: `/venues/${venueId}/marketplace`,
            icon: Megaphone,
        });
        items.push({
            title: "Analytics",
            href: `/venues/${venueId}/analytics`,
            icon: TrendingUp,
        });
        if (venueSlug) {
            items.push({
                title: "View Live Page",
                href: `/${venueSlug}`,
                icon: ExternalLink,
                external: true,
            });
        }
    }
    return items;
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);
    const [planTier, setPlanTier] = useState<string | null>(null);
    const [venueId, setVenueId] = useState<string | null>(null);
    const [venueSlug, setVenueSlug] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Fetch subscription plan tier
        fetch("/api/subscription")
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.plan_tier) setPlanTier(data.plan_tier); })
            .catch(() => {});
        
        // Fetch user's venue ID
        fetch("/api/venues")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.length > 0) {
                    setVenueId(data[0].id);
                    setVenueSlug(data[0].slug || null);
                }
            })
            .catch(() => {});
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleRefreshData = async () => {
        if (!confirm('⚠️ This will DELETE all your existing data and replace it with demo data. This action cannot be undone. Continue?')) {
            return;
        }

        setIsSeeding(true);
        try {
            const response = await fetch('/api/seed', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to seed data');
            }

            toast({
                title: "Success!",
                description: `Demo data loaded: ${data.counts.venues} venues, ${data.counts.vendors} vendors, ${data.counts.events} events`,
            });

            // Refresh the page to show new data
            router.refresh();
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Seed error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to refresh data",
                variant: "destructive",
            });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className={cn("flex flex-col border-r bg-gray-50/40 transition-all duration-300", isCollapsed ? "w-20 h-screen" : "w-64 h-screen")}>
            <div className="flex h-14 items-center justify-between border-b px-4">
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold flex-1">
                        <Store className="h-6 w-6 flex-shrink-0" />
                        <span className="text-sm">VenueManager</span>
                    </Link>
                )}
                {isCollapsed && (
                    <Link href="/dashboard" className="flex items-center justify-center flex-1">
                        <Store className="h-6 w-6" />
                    </Link>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </button>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium gap-1">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                title={isCollapsed ? item.title : ""}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isCollapsed && "justify-center",
                                    pathname.startsWith(item.href)
                                        ? "bg-gray-100 text-primary"
                                        : "text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {!isCollapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                    
                    {/* Divider and Venue Management Section */}
                    {venueId && (
                        <>
                            <div className={cn("my-2", isCollapsed ? "hidden" : "border-t")} />
                            {dynamicItems(venueId, venueSlug).map((item, index) => {
                                const Icon = item.icon;
                                const isExternal = "external" in item && item.external;
                                return (
                                    <Link
                                        key={`dynamic-${index}`}
                                        href={item.href}
                                        title={isCollapsed ? item.title : ""}
                                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                            isCollapsed && "justify-center",
                                            !isExternal && pathname.startsWith(item.href)
                                                ? "bg-gray-100 text-primary"
                                                : "text-gray-500 hover:bg-gray-100"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        {!isCollapsed && <span>{item.title}</span>}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>
            </div>
            <div className={cn("border-t p-2 space-y-2", !isCollapsed && "p-4")}>
                {planTier && planTier !== "enterprise" && (
                    <Link href="/pricing">
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start gap-3 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 mb-1",
                                isCollapsed ? "w-10 h-10 justify-center p-0" : "w-full"
                            )}
                            title={isCollapsed ? "Upgrade Plan" : ""}
                        >
                            <ArrowUpCircle className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && <span>Upgrade</span>}
                        </Button>
                    </Link>
                )}
                {planTier && !isCollapsed && (
                    <div className="px-3 py-1 text-xs text-muted-foreground">
                        {planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan
                    </div>
                )}
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start gap-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700",
                        isCollapsed ? "w-10 h-10 justify-center p-0" : "w-full"
                    )}
                    onClick={handleRefreshData}
                    disabled={isSeeding}
                    title={isCollapsed ? "Refresh Demo Data" : ""}
                >
                    <RefreshCw className={cn("h-4 w-4 flex-shrink-0", isSeeding && "animate-spin")} />
                    {!isCollapsed && <span>{isSeeding ? "Loading..." : "Refresh"}</span>}
                </Button>
                <Button
                    variant="ghost"
                    className={cn(
                        "justify-start gap-3 text-gray-500 hover:text-red-500",
                        isCollapsed ? "w-10 h-10 justify-center p-0" : "w-full"
                    )}
                    onClick={handleSignOut}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </Button>
            </div>
        </div>
    );
}
