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
    event: Event;
    onVendorAdded: () => void;
}

export function VendorMatching({ event, onVendorAdded }: VendorMatchingProps) {
    const { toast } = useToast();
    const [rankedVendors, setRankedVendors] = useState<VendorMatchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/vendors?venueId=${event.venue_id}`);
                if (!res.ok) throw new Error("Failed to fetch vendors");
                const data = await res.json();

                // Rank vendors based on event criteria
                const ranked = rankVendorsByMatch(event, data);
                setRankedVendors(ranked);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, [event]);

    const addVendorToEvent = async (vendor: Vendor) => {
        setIsSubmitting(vendor.id);
        try {
            const res = await fetch(`/api/events/${event.id}/vendors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vendor_id: vendor.id,
                    category: vendor.category,
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
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matching vendors</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    We couldn&apos;t find any vendors for this venue. Add vendors to your venue list to see matches.
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <a href="/vendors/new">Add First Vendor</a>
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
                    return (
                        <Card key={vendor.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' }}>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg">{vendor.name}</h4>
                                            <Badge variant="outline" className="capitalize">{vendor.category}</Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {reasons.map((reason: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
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
                                            onClick={() => addVendorToEvent(vendor)}
                                            disabled={isSubmitting === vendor.id}
                                            size="sm"
                                        >
                                            {isSubmitting === vendor.id ? "Adding..." : "Add to Event"}
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
