"use client";

import { useEffect, useState } from "react";
import { DollarSign, AlertCircle, CheckCircle2, MoreVertical } from "lucide-react";
import { EventVendor, Vendor } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface EventBudgetProps {
    eventId: string;
    totalBudget: number;
    refreshKey: number;
}

type EventVendorWithData = EventVendor & { vendors: Vendor | null };

export function EventBudget({ eventId, totalBudget, refreshKey }: EventBudgetProps) {
    const [eventVendors, setEventVendors] = useState<EventVendorWithData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBudgetDetails = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/events/${eventId}/vendors`);
                if (res.ok) {
                    const data = await res.json();
                    setEventVendors(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBudgetDetails();
    }, [eventId, refreshKey]);

    const totalQuoted = eventVendors.reduce((acc, curr) => acc + (curr.quoted_cost || 0), 0);
    const totalActual = eventVendors.reduce((acc, curr) => acc + (curr.actual_cost || curr.quoted_cost || 0), 0);
    const remainingBudget = totalBudget - totalActual;
    const percentSpent = Math.min(100, (totalActual / totalBudget) * 100);

    if (isLoading) return <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg" />
        <div className="h-64 bg-gray-100 rounded-lg" />
    </div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Allocated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Starting event budget</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Committed/Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalActual > totalBudget ? (
                                <span className="text-red-500 flex items-center gap-1 font-medium">
                                    <AlertCircle className="h-3 w-3" /> Over by {formatCurrency(totalActual - totalBudget)}
                                </span>
                            ) : (
                                <span className="text-green-600 font-medium">Within budget limits</span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(remainingBudget)}</div>
                        <Progress value={percentSpent} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Quoted</TableHead>
                                <TableHead className="text-right">Actual</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventVendors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No vendors assigned to this event yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                eventVendors.map((association) => {
                                    const variance = (association.actual_cost || association.quoted_cost || 0) - (association.quoted_cost || 0);
                                    return (
                                        <TableRow key={association.id}>
                                            <TableCell className="font-medium capitalize">{association.category}</TableCell>
                                            <TableCell>{association.vendors?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={association.confirmed ? "default" : "secondary"}>
                                                    {association.confirmed ? "Confirmed" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(association.quoted_cost || 0)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(association.actual_cost || association.quoted_cost || 0)}</TableCell>
                                            <TableCell className={`text-right ${variance > 0 ? "text-red-500" : "text-green-600"}`}>
                                                {variance === 0 ? "-" : formatCurrency(variance)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
