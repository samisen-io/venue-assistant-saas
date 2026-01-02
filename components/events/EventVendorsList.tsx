"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MoreVertical, CheckCircle2 } from "lucide-react";
import { EventVendor, Vendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventVendorsListProps {
    eventId: string;
    refreshKey: number;
}

type EventVendorWithData = EventVendor & {
    vendors: Vendor | null;
    event_services?: { name: string } | null;
};

export function EventVendorsList({ eventId, refreshKey }: EventVendorsListProps) {
    const [eventVendors, setEventVendors] = useState<EventVendorWithData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEventVendors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors`);
            if (!res.ok) throw new Error("Failed to fetch vendors");
            const data = await res.json();
            setEventVendors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async (associationId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmed: true, confirmed_at: new Date().toISOString() })
            });
            if (!res.ok) throw new Error("Failed to confirm vendor");
            fetchEventVendors();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemove = async (associationId: string) => {
        if (!confirm("Are you sure you want to remove this vendor?")) return;
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to remove vendor");
            fetchEventVendors();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchEventVendors();
    }, [eventId, refreshKey]);

    if (isLoading) return <div className="animate-pulse space-y-4">
        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}
    </div>;

    if (eventVendors.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contracted Vendors</h3>
            <div className="grid gap-4">
                {eventVendors.map((association) => {
                    if (!association.vendors) return null;

                    return (
                        <Card key={association.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{association.vendors.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {association.event_services?.name || "Service"}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {association.vendors.contact_email}</span>
                                                {association.vendors.contact_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {association.vendors.contact_phone}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <Badge className={association.confirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                                {association.confirmed ? "Confirmed" : "Pending"}
                                            </Badge>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="font-bold">{formatCurrency(association.quoted_cost || association.vendors.cost_per_unit || 0)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Quoted Cost</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!association.confirmed && (
                                                    <DropdownMenuItem onClick={() => handleConfirm(association.id)}>Confirm Vendor</DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleRemove(association.id)}>Remove Vendor</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
