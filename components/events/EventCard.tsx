import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, DollarSign, MapPin, Users, Building2 } from "lucide-react";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
    event: Event & { venues?: { name: string }; spaces?: { id: string; name: string; capacity?: number; space_type?: string } };
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

export function EventCard({ event }: EventCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">{event.event_name}</CardTitle>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venues?.name || "Unknown Venue"}
                        </div>
                        {event.spaces?.name && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {event.spaces.name}
                                {event.spaces.capacity && <span className="text-xs">({event.spaces.capacity} cap.)</span>}
                            </div>
                        )}
                    </div>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDays className="h-4 w-4" />
                        <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
                        {event.event_time && <span>at {event.event_time}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{event.guest_count} Guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: {formatCurrency(event.budget_total)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/events/${event.id}`}>
                        Manage Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
