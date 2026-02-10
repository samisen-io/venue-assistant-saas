"use client";

import { User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { MobileSidebar } from "./MobileSidebar";

// Map routes to page titles
const routeTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/calendar": "Calendar",
    "/events": "Events",
    "/spaces": "Spaces",
    "/vendors": "Vendors",
    "/clients": "Clients",
    "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
    // Check exact match first
    if (routeTitles[pathname]) {
        return routeTitles[pathname];
    }

    // Check if pathname starts with a known route
    for (const [route, title] of Object.entries(routeTitles)) {
        if (pathname.startsWith(route)) {
            return title;
        }
    }

    return "Dashboard";
}

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const pageTitle = getPageTitle(pathname);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-gray-50/40 px-4 md:px-6 lg:h-[60px]">
            <MobileSidebar />
            <div className="flex-1">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings/subscription">Subscription</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
