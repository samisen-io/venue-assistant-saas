"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { EventVendor, Vendor } from "@/lib/types";
import type { VendorOutreachStatus, EventVendorWithDetails } from "@/lib/types/vendor-outreach.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/hooks/use-toast";
import { VendorStatusBadge } from "./VendorStatusBadge";
import { VendorActionMenu } from "./VendorActionMenu";
import { compareBudget, formatVariancePercent, getVarianceColorClass } from "@/lib/algorithms/budgetComparison";
import { sortByOutreachPriority } from "@/lib/utils/vendorOutreachStatus";

interface EventVendorsListProps {
    eventId: string;
    refreshKey: number;
}

type EventVendorWithData = EventVendor & {
    vendors: Vendor | null;
    event_services?: { name: string } | null;
    budget_allocation?: { budget_amount: number | null } | null;
    communication_count?: number;
};

export function EventVendorsList({ eventId, refreshKey }: EventVendorsListProps) {
    const { toast } = useToast();
    const [eventVendors, setEventVendors] = useState<EventVendorWithData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [threadSheet, setThreadSheet] = useState<{
        open: boolean;
        vendorId: string;
        vendorName: string;
        associationId: string;
    }>({ open: false, vendorId: "", vendorName: "", associationId: "" });
    const [communications, setCommunications] = useState<any[]>([]);
    const [loadingComms, setLoadingComms] = useState(false);

    const fetchEventVendors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors`);
            if (!res.ok) throw new Error("Failed to fetch vendors");
            const data = await res.json();
            // Sort by outreach priority
            const sorted = [...data].sort(sortByOutreachPriority);
            setEventVendors(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContact = async (associationId: string) => {
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}/contact`, {
                method: "POST"
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to contact vendor");
            }

            toast({
                title: "Contact Sent",
                description: result.message
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAvailable = async (associationId: string, quotedAmount?: number) => {
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}/response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    responseType: "available",
                    quotedAmount
                })
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to update vendor");
            }

            toast({
                title: "Vendor Updated",
                description: result.message
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkNotAvailable = async (associationId: string) => {
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}/response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responseType: "not_available" })
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to update vendor");
            }

            toast({
                title: "Vendor Updated",
                description: result.message
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirm = async (associationId: string) => {
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "confirm", sendNotification: true })
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to confirm vendor");
            }

            toast({
                title: "Vendor Confirmed",
                description: result.message
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (associationId: string, reason?: string) => {
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject", reason })
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to reject vendor");
            }

            toast({
                title: "Vendor Rejected",
                description: result.message
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (associationId: string) => {
        if (!confirm("Are you sure you want to remove this vendor?")) return;
        setActionLoading(associationId);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to remove vendor");

            toast({
                title: "Vendor Removed",
                description: "Vendor has been removed from this event."
            });
            fetchEventVendors();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const openCommunicationThread = async (associationId: string, vendorId: string, vendorName: string) => {
        setThreadSheet({ open: true, vendorId, vendorName, associationId });
        setLoadingComms(true);
        try {
            const res = await fetch(`/api/events/${eventId}/vendors/${associationId}/communications`);
            if (res.ok) {
                const data = await res.json();
                setCommunications(data.communications || []);
            }
        } catch (error) {
            console.error("Failed to fetch communications:", error);
        } finally {
            setLoadingComms(false);
        }
    };

    useEffect(() => {
        fetchEventVendors();
    }, [eventId, refreshKey]);

    // Filter vendors by status
    const filteredVendors = statusFilter === "all"
        ? eventVendors
        : eventVendors.filter(v => v.outreach_status === statusFilter);

    if (isLoading) return (
        <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}
        </div>
    );

    if (eventVendors.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">Event Vendors</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="needs_attention">Needs Attention</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filteredVendors.map((association) => {
                    if (!association.vendors) return null;

                    const vendor = association.vendors;
                    const status = association.outreach_status as VendorOutreachStatus | null;
                    const budgetAmount = association.budget_allocation?.budget_amount;
                    const budgetComparison = compareBudget(association.quoted_cost, budgetAmount);

                    return (
                        <Card
                            key={association.id}
                            className={`overflow-hidden ${
                                status === "needs_attention" ? "border-yellow-300 bg-yellow-50/30" :
                                status === "confirmed" ? "border-green-200" :
                                status === "rejected" || status === "not_available" ? "opacity-60" : ""
                            }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold truncate">{vendor.name}</h4>
                                                <VendorStatusBadge
                                                    status={status}
                                                    timestamp={association.status_updated_at}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {association.event_services?.name || "Service"}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1 truncate">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    {vendor.contact_email || "No email"}
                                                </span>
                                                {vendor.contact_phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                                        {vendor.contact_phone}
                                                    </span>
                                                )}
                                                {(association.communication_count ?? 0) > 0 && (
                                                    <span className="flex items-center gap-1 text-blue-500">
                                                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                                                        {association.communication_count} message{(association.communication_count ?? 0) > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                                        {/* Budget comparison */}
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {formatCurrency(association.quoted_cost || vendor.cost_per_unit || 0)}
                                            </p>
                                            {budgetAmount && budgetComparison.result !== "unknown" && (
                                                <p className={`text-xs ${getVarianceColorClass(budgetComparison.variancePercent)}`}>
                                                    {budgetComparison.result === "over" && (
                                                        <span className="flex items-center gap-1 justify-end">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            {formatVariancePercent(budgetComparison.variancePercent)} over
                                                        </span>
                                                    )}
                                                    {budgetComparison.result === "within" && "Within budget"}
                                                    {budgetComparison.result === "under" && (
                                                        <span>{formatVariancePercent(Math.abs(budgetComparison.variancePercent))} under</span>
                                                    )}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                Quoted Cost
                                            </p>
                                        </div>

                                        {/* Action Menu */}
                                        <VendorActionMenu
                                            status={status}
                                            vendorName={vendor.name}
                                            vendorHasEmail={!!vendor.contact_email}
                                            onContact={() => handleContact(association.id)}
                                            onMarkAvailable={(amount) => handleMarkAvailable(association.id, amount)}
                                            onMarkNotAvailable={() => handleMarkNotAvailable(association.id)}
                                            onConfirm={() => handleConfirm(association.id)}
                                            onReject={(reason) => handleReject(association.id, reason)}
                                            onViewThread={() => openCommunicationThread(
                                                association.id,
                                                vendor.id,
                                                vendor.name
                                            )}
                                            isLoading={actionLoading === association.id}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredVendors.length === 0 && eventVendors.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    No vendors with status "{statusFilter}"
                </div>
            )}

            {/* Communication Thread Sheet */}
            <Sheet open={threadSheet.open} onOpenChange={(open) => setThreadSheet(prev => ({ ...prev, open }))}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Communications with {threadSheet.vendorName}</SheetTitle>
                        <SheetDescription>
                            View all email communications with this vendor for this event.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {loadingComms ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-lg" />
                                ))}
                            </div>
                        ) : communications.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                No communications yet
                            </p>
                        ) : (
                            communications.map((comm) => (
                                <div
                                    key={comm.id}
                                    className={`p-4 rounded-lg border ${
                                        comm.direction === "outbound"
                                            ? "bg-blue-50 border-blue-200 ml-4"
                                            : "bg-gray-50 border-gray-200 mr-4"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            {comm.direction === "outbound" ? "Sent" : "Received"}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comm.created_at).toLocaleDateString()}{" "}
                                            {new Date(comm.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                    <p className="font-medium text-sm">{comm.subject}</p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                        {comm.body?.substring(0, 200)}...
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
