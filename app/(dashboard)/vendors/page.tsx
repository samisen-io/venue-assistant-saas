"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { EventService, Vendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorTable } from "@/components/vendors/VendorTable";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ViewToggle, ViewMode } from "@/components/shared/ViewToggle";
import { MobileFilters } from "@/components/shared/MobileFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [eventServices, setEventServices] = useState<EventService[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState("all");
    const isMobile = useIsMobile();
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("viewMode:vendors") as ViewMode) || "grid";
        }
        return "grid";
    });

    // Calculate active filter count for mobile badge
    const activeFilterCount = (searchTerm ? 1 : 0) + (selectedServiceId !== "all" ? 1 : 0);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode:vendors", mode);
    };

    const fetchVendors = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/vendors");
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch vendors");
            }
            const data = await res.json();
            setVendors(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Could not load vendors. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/event-services");
                if (!res.ok) throw new Error("Failed to fetch services");
                const data = await res.json();
                setEventServices(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchServices();
    }, []);

    const filteredVendors = vendors.filter((vendor) => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = selectedServiceId === "all" || (vendor as any).vendor_services?.some(
            (service: any) => service.event_service_id === selectedServiceId
        );
        return matchesSearch && matchesService;
    });

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchVendors} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                <div className="flex items-center gap-3">
                    <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
                    <Button asChild>
                        <Link href="/vendors/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vendor
                        </Link>
                    </Button>
                </div>
            </div>

            <MobileFilters activeFilterCount={activeFilterCount}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search vendors..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-[220px]">
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Services</SelectItem>
                                {eventServices.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </MobileFilters>

            {filteredVendors.length === 0 ? (
                <EmptyState
                    title={searchTerm || selectedServiceId !== "all" ? "No matches found" : "No vendors found"}
                    description={searchTerm || selectedServiceId !== "all"
                        ? "Try adjusting your search filters to find more vendors."
                        : "Add vendors to your database to track performance and get AI-powered recommendations for events."}
                    actionLabel={searchTerm || selectedServiceId !== "all" ? "Clear Filters" : "Add Vendor"}
                    {...(searchTerm || selectedServiceId !== "all"
                        ? {
                            onAction: () => {
                                setSearchTerm("");
                                setSelectedServiceId("all");
                            }
                        }
                        : { actionHref: "/vendors/new" }
                    )}
                />
            ) : isMobile || viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredVendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                </div>
            ) : (
                <VendorTable vendors={filteredVendors} />
            )}
        </div>
    );
}
