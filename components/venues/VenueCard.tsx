import Link from "next/link";
import { Edit, MapPin, Users } from "lucide-react";
import { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface VenueCardProps {
    venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{venue.name}</CardTitle>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {venue.venue_type?.replace('_', ' ')}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Capacity: {venue.capacity} guests</span>
                    </div>
                    {(venue.city || venue.state) && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                                {[venue.address, venue.city, venue.state].filter(Boolean).join(", ")}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/venues/${venue.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
