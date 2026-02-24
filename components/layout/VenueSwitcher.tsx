"use client";

import { ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVenueContext } from "@/lib/context/VenueContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Venue } from "@/lib/types";

export function VenueSwitcher() {
    const { venues, activeVenue, isLoading, setActiveVenue } = useVenueContext();

    if (isLoading || !activeVenue) {
        return (
            <div className="h-8 w-28 animate-pulse rounded-md bg-gray-200 sm:w-40" />
        );
    }

    // Single venue — show static label, no dropdown
    if (venues.length <= 1) {
        return (
            <div className="flex max-w-[140px] items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-sm sm:max-w-[180px] sm:px-3">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-medium">{activeVenue.name}</span>
            </div>
        );
    }

    // Multiple venues — show dropdown switcher
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex max-w-[140px] items-center gap-1.5 px-2 sm:max-w-[200px] sm:px-3"
                >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{activeVenue.name}</span>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Venue</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {venues.map((venue: Venue) => (
                    <DropdownMenuItem
                        key={venue.id}
                        onClick={() => setActiveVenue(venue)}
                        className={cn(
                            "cursor-pointer",
                            venue.id === activeVenue.id && "bg-accent font-medium"
                        )}
                    >
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{venue.name}</span>
                            {venue.city && (
                                <span className="text-xs text-muted-foreground truncate">{venue.city}{venue.state ? `, ${venue.state}` : ""}</span>
                            )}
                        </div>
                        {venue.id === activeVenue.id && (
                            <span className="ml-auto text-xs text-primary">Active</span>
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/venues" className="cursor-pointer text-muted-foreground text-xs">
                        Manage venues →
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
