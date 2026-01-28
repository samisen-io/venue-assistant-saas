import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface EventTableProps {
    events: (Event & { venues?: { name: string }; spaces?: { id: string; name: string; capacity?: number; space_type?: string } })[];
}

function getStatusColor(status: string | null) {
    switch (status) {
        case "planning": return "bg-blue-100 text-blue-800";
        case "confirmed": return "bg-green-100 text-green-800";
        case "completed": return "bg-gray-100 text-gray-800";
        case "cancelled": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

export function EventTable({ events }: EventTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Space</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Guests</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => (
                        <TableRow key={event.id}>
                            <TableCell className="font-medium">
                                <Link href={`/events/${event.id}`} className="hover:text-blue-600 hover:underline">
                                    {event.event_name}
                                </Link>
                            </TableCell>
                            <TableCell>{event.venues?.name || "—"}</TableCell>
                            <TableCell>{event.spaces?.name || "—"}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getStatusColor(event.status)}>
                                    {event.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(event.event_date), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">{event.guest_count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(event.budget_total)}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/events/${event.id}`}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
