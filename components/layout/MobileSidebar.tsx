"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Menu,
    ArrowUpCircle,
    Globe,
    TrendingUp,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVenueContext } from "@/lib/context/VenueContext";

const staticItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Events", href: "/events", icon: CalendarDays },
    { title: "Spaces", href: "/spaces", icon: Building2 },
    { title: "Vendors", href: "/vendors", icon: Briefcase },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Leads", href: "/leads", icon: Users },
    { title: "Venues", href: "/venues", icon: MapPin },
    { title: "Settings", href: "/settings", icon: Settings },
];

export function MobileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [planTier, setPlanTier] = useState<string | null>(null);
    const { activeVenue } = useVenueContext();

    useEffect(() => {
        fetch("/api/subscription")
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.plan_tier) setPlanTier(data.plan_tier); })
            .catch(() => {});
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleRefreshData = async () => {
        if (!confirm('This will DELETE all your existing data and replace it with demo data. This action cannot be undone. Continue?')) {
            return;
        }
        setIsSeeding(true);
        try {
            const response = await fetch('/api/seed', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to seed data');
            toast({
                title: "Success!",
                description: `Demo data loaded: ${data.counts.venues} venues, ${data.counts.vendors} vendors, ${data.counts.events} events`,
            });
            setIsOpen(false);
            router.refresh();
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to refresh data",
                variant: "destructive",
            });
        } finally {
            setIsSeeding(false);
        }
    };

    const venueItems = activeVenue ? [
        { title: "Public Page", href: `/venues/${activeVenue.id}/public-page`, icon: Globe },
        { title: "Analytics", href: `/venues/${activeVenue.id}/analytics`, icon: TrendingUp },
    ] : [];

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-14 border-b px-6 flex flex-row items-center">
                    <Store className="h-6 w-6" />
                    <SheetTitle className="ml-2">VenueManager</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-[calc(100%-3.5rem)]">
                    <nav className="flex-1 overflow-auto py-4 px-4">
                        {staticItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === "/venues"
                                ? pathname.startsWith("/venues") && !pathname.includes("/public-page") && !pathname.includes("/analytics")
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                        isActive
                                            ? "bg-gray-100 text-primary"
                                            : "text-gray-500 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}

                        {venueItems.length > 0 && (
                            <>
                                <div className="my-2 border-t" />
                                {venueItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                                pathname.startsWith(item.href)
                                                    ? "bg-gray-100 text-primary"
                                                    : "text-gray-500 hover:bg-gray-100"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </>
                        )}
                    </nav>
                    <div className="border-t p-4 space-y-2">
                        {planTier && planTier !== "enterprise" && (
                            <Link href="/pricing" onClick={() => setIsOpen(false)}>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-3 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 mb-1"
                                >
                                    <ArrowUpCircle className="h-4 w-4" />
                                    Upgrade Plan
                                </Button>
                            </Link>
                        )}
                        {planTier && (
                            <div className="px-3 py-1 text-xs text-muted-foreground">
                                {planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={handleRefreshData}
                            disabled={isSeeding}
                        >
                            <RefreshCw className={cn("h-4 w-4", isSeeding && "animate-spin")} />
                            {isSeeding ? "Loading..." : "Refresh Demo Data"}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-500 hover:text-red-500"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
