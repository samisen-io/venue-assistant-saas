"use client";

import { useState, useEffect } from "react";
import { Check, Star, TrendingUp, AlertCircle } from "lucide-react";
import { Event, Vendor, VendorMatchResult } from "@/lib/types";
import { rankVendorsByMatch } from "@/lib/algorithms/vendorMatching";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import { Loading } from "@/components/shared/Loading";

interface VendorMatchingProps {
    event: Event & { event_vendors?: Array<{ vendor_id: string }> };
    onVendorAdded: () => void;
}

export function VendorMatching({ event, onVendorAdded }: VendorMatchingProps) {
    const { toast } = useToast();
    const [rankedVendors, setRankedVendors] = useState<VendorMatchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [addedVendorIds, setAddedVendorIds] = useState<Set<string>>(new Set());

    // Track already added vendors from event data
    useEffect(() => {
        const existingVendorIds = new Set(
            (event.event_vendors || []).map(ev => ev.vendor_id)
        );
        setAddedVendorIds(existingVendorIds);
    }, [event.event_vendors]);

    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/vendors?venueId=${event.venue_id}`);
                if (!res.ok) throw new Error("Failed to fetch vendors");
                const allVendors = await res.json();

                const serviceRequirements = (event as any).event_service_requirements || [];
                const requiredServiceIds = serviceRequirements.map((req: any) => req.event_service_id);

                const vendorServicesById: Record<string, string[]> = {};
                allVendors.forEach((vendor: any) => {
                    vendorServicesById[vendor.id] = (vendor.vendor_services || []).map((service: any) => service.event_service_id);
                });

                // Filter vendors to only show those matching needed services
                const filteredVendors = requiredServiceIds.length > 0
                    ? allVendors.filter((v: any) => {
                        const services = vendorServicesById[v.id] || [];
                        return services.some((serviceId) => requiredServiceIds.includes(serviceId));
                    })
                    : allVendors; // Show all if no services specified

                // Rank vendors based on event criteria
                const ranked = rankVendorsByMatch(event, filteredVendors, requiredServiceIds, vendorServicesById);
                setRankedVendors(ranked);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, [event]);

    const addVendorToEvent = async (vendor: Vendor, eventServiceId: string) => {
        setIsSubmitting(vendor.id);
        try {
            const res = await fetch(`/api/events/${event.id}/vendors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vendor_id: vendor.id,
                    event_service_id: eventServiceId,
                    quoted_cost: vendor.cost_per_unit
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to add vendor");
            }

            toast({
                title: "Vendor Added",
                description: "Vendor has been successfully added to the event.",
            });

            // Track this vendor as added
            setAddedVendorIds(prev => new Set(prev).add(vendor.id));
            onVendorAdded();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(null);
        }
    };

    if (isLoading) return <Loading />;

    if (rankedVendors.length === 0) {
        const serviceRequirements = (event as any).event_service_requirements || [];

        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matching vendors</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    {serviceRequirements.length > 0
                        ? "We couldn't find any vendors matching the services you need. Add vendors with these services to see matches."
                        : "No services selected for this event. Edit the event to specify which vendor services you need."
                    }
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <a href="/vendors/new">Add Vendor</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Recommended Vendors</h3>
                    <p className="text-sm text-gray-500">Based on guest count, budget, and performance.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {rankedVendors.slice(0, 5).map((result) => {
                    const { vendor, score, reasons } = result;
                    const vendorServices = (vendor as any).vendor_services || [];
                    const serviceRequirements = (event as any).event_service_requirements || [];
                    const matchedServices = serviceRequirements.filter((req: any) =>
                        vendorServices.some((service: any) => service.event_service_id === req.event_service_id)
                    );
                    const defaultServiceId = matchedServices[0]?.event_service_id || vendorServices[0]?.event_service_id;
                    return (
                        <Card key={vendor.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' }}>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg">{vendor.name}</h4>
                                            {matchedServices[0]?.event_services?.name && (
                                                <Badge variant="outline">{matchedServices[0].event_services.name}</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {reasons.map((reason: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                        {matchedServices.length > 1 && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                Also matches: {matchedServices.slice(1).map((service: any) => service.event_services?.name).filter(Boolean).join(", ")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center text-primary">
                                                <TrendingUp className="h-5 w-5 mr-1" />
                                                <span className="text-2xl font-bold">{score}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Match Score</p>
                                        </div>

                                        <div className="text-right min-w-[100px]">
                                            <p className="text-sm font-bold">{vendor.cost_per_unit ? formatCurrency(vendor.cost_per_unit) : "N/A"}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{vendor.cost_structure?.replace('_', ' ')}</p>
                                        </div>

                                        <Button
                                            onClick={() => addVendorToEvent(vendor, defaultServiceId)}
                                            disabled={isSubmitting === vendor.id || !defaultServiceId || addedVendorIds.has(vendor.id)}
                                            size="sm"
                                            variant={addedVendorIds.has(vendor.id) ? "outline" : "default"}
                                        >
                                            {isSubmitting === vendor.id ? "Adding..." : addedVendorIds.has(vendor.id) ? "Added" : "Add to Event"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
