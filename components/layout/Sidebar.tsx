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
    LogOut,
    RefreshCw,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
        icon: Users,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);

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
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Store className="h-6 w-6" />
                    <span className="">VenueManager</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
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
                </nav>
            </div>
            <div className="border-t p-4 space-y-2">
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
    );
}
