import Link from "next/link";
import { Eye, Edit } from "lucide-react";
import { Space } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SpaceTableProps {
    spaces: Space[];
}

const spaceTypeLabels: Record<string, string> = {
    ballroom: "Ballroom",
    conference_room: "Conference Room",
    meeting_room: "Meeting Room",
    outdoor_garden: "Outdoor Garden",
    rooftop: "Rooftop",
    banquet_hall: "Banquet Hall",
    other: "Other",
};

export function SpaceTable({ spaces }: SpaceTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Capacity</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead className="text-right">Hourly Rate</TableHead>
                        <TableHead className="text-right">Sq Ft</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {spaces.map((space) => (
                        <TableRow key={space.id}>
                            <TableCell className="font-medium">
                                <Link href={`/spaces/${space.id}`} className="hover:text-blue-600 hover:underline">
                                    {space.name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-blue-50">
                                    {spaceTypeLabels[space.space_type || "other"] || space.space_type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{space.capacity || "—"}</TableCell>
                            <TableCell>{space.floor_level || "—"}</TableCell>
                            <TableCell className="text-right">
                                {space.hourly_rate ? `$${space.hourly_rate}` : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                                {space.square_footage ? space.square_footage.toLocaleString() : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/spaces/${space.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/spaces/${space.id}/edit`}>
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
