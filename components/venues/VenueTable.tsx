import Link from "next/link";
import { Edit, Globe } from "lucide-react";
import { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface VenueTableProps {
    venues: Venue[];
}

export function VenueTable({ venues }: VenueTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Capacity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {venues.map((venue) => (
                        <TableRow key={venue.id}>
                            <TableCell className="font-medium">{venue.name}</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    {venue.venue_type?.replace("_", " ")}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">{venue.capacity}</TableCell>
                            <TableCell>
                                {[venue.address, venue.city, venue.state].filter(Boolean).join(", ") || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/venues/${venue.id}/public-page`}>
                                            <Globe className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/venues/${venue.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
