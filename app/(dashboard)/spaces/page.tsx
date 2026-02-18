"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Building2, Search, Filter, X } from "lucide-react";
import { Space } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { SpaceTable } from "@/components/spaces/SpaceTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { MobileFilters } from "@/components/shared/MobileFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCanCreate } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useVenueContext } from "@/lib/context/VenueContext";

const spaceTypes: { value: string; label: string }[] = [
    { value: "ballroom", label: "Ballroom" },
    { value: "conference_room", label: "Conference Room" },
    { value: "meeting_room", label: "Meeting Room" },
    { value: "outdoor_garden", label: "Outdoor Garden" },
    { value: "rooftop", label: "Rooftop" },
    { value: "banquet_hall", label: "Banquet Hall" },
    { value: "other", label: "Other" },
];

export default function SpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const isMobile = useIsMobile();
    const { canCreate, reason: limitReason } = useCanCreate("space");
    const { activeVenue } = useVenueContext();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (globalThis.window !== undefined) {
            return (localStorage.getItem("viewMode:spaces") as ViewMode) || "grid";
        }
        return "grid";
    });

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [minCapacity, setMinCapacity] = useState<string>("");
    const [maxRate, setMaxRate] = useState<string>("");

    // Calculate active filter count for mobile badge
    const activeFilterCount = (searchQuery ? 1 : 0) + (typeFilter === "all" ? 0 : 1) + (minCapacity ? 1 : 0) + (maxRate ? 1 : 0);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:spaces", mode);
    };

    const fetchSpaces = async () => {
        setIsLoading(true);
        setError("");
        try {
            const headers: HeadersInit = {};
            if (activeVenue) headers["X-Venue-Id"] = activeVenue.id;
            const res = await fetch("/api/spaces", { headers });
            if (!res.ok) throw new Error("Failed to fetch spaces");
            const data = await res.json();
            setSpaces(data);
        } catch (err) {
            console.error(err);
            setError("Could not load spaces. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, [activeVenue?.id]);

    // Filter spaces based on search and filters
    const filteredSpaces = useMemo(() => {
        return spaces.filter((space) => {
            // Search filter (name, floor_level)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = space.name.toLowerCase().includes(query);
                const matchesFloor = space.floor_level?.toLowerCase().includes(query);
                if (!matchesName && !matchesFloor) return false;
            }

            // Type filter
            if (typeFilter !== "all" && space.space_type !== typeFilter) {
                return false;
            }

            // Min capacity filter
            if (minCapacity) {
                const min = Number.parseInt(minCapacity, 10);
                if (!Number.isNaN(min) && (space.capacity === null || space.capacity < min)) {
                    return false;
                }
            }

            // Max hourly rate filter
            if (maxRate) {
                const max = Number.parseFloat(maxRate);
                if (!Number.isNaN(max) && space.hourly_rate !== null && space.hourly_rate > max) {
                    return false;
                }
            }

            return true;
        });
    }, [spaces, searchQuery, typeFilter, minCapacity, maxRate]);

    const clearFilters = () => {
        setSearchQuery("");
        setTypeFilter("all");
        setMinCapacity("");
        setMaxRate("");
    };

    const hasActiveFilters = searchQuery || typeFilter !== "all" || minCapacity || maxRate;

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchSpaces} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Spaces</h1>
                    <p className="text-gray-500 mt-1">Manage your bookable event spaces</p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    {canCreate ? (
                        <Button asChild>
                            <Link href="/spaces/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Space
                            </Link>
                        </Button>
                    ) : (
                        <Button onClick={() => setShowUpgradePrompt(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Space
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            {spaces.length > 0 && (
                <MobileFilters activeFilterCount={activeFilterCount}>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Search */}
                            <div className="relative flex-1 w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search spaces..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-slate-600 hidden sm:block" />
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {spaceTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Min Capacity */}
                            <Input
                                type="number"
                                placeholder="Min capacity"
                                value={minCapacity}
                                onChange={(e) => setMinCapacity(e.target.value)}
                                className="w-full sm:w-[130px]"
                            />

                            {/* Max Rate */}
                            <Input
                                type="number"
                                placeholder="Max $/hr"
                                value={maxRate}
                                onChange={(e) => setMaxRate(e.target.value)}
                                className="w-full sm:w-[120px]"
                            />

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                                    <X className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Results count */}
                        {hasActiveFilters && (
                            <div className="mt-3 text-sm text-gray-500">
                                Showing {filteredSpaces.length} of {spaces.length} spaces
                            </div>
                        )}
                    </div>
                </MobileFilters>
            )}

            {spaces.length === 0 && (
                <EmptyState
                    icon={Building2}
                    title="No spaces found"
                    description="Create your first bookable space to start managing events. Spaces are rooms or areas within your venue that can be reserved."
                    actionLabel="Add Space"
                    actionHref="/spaces/new"
                />
            )}
            {spaces.length > 0 && filteredSpaces.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No matching spaces</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Try adjusting your search or filter criteria
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}
            {filteredSpaces.length > 0 && (isMobile || viewMode === "grid") && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSpaces.map((space) => (
                        <SpaceCard key={space.id} space={space} />
                    ))}
                </div>
            )}
            {filteredSpaces.length > 0 && !isMobile && viewMode !== "grid" && (
                <SpaceTable spaces={filteredSpaces} />
            )}

            <UpgradePrompt
                open={showUpgradePrompt}
                onOpenChange={setShowUpgradePrompt}
                message={limitReason || undefined}
                resource="space"
            />
        </div>
    );
}
