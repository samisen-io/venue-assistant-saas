import Link from "next/link";
import { Edit, Users, MapPin, DollarSign } from "lucide-react";
import { Space } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpaceCardProps {
    space: Space;
}

const spaceTypeLabels: Record<string, string> = {
    ballroom: "Ballroom",
    conference_room: "Conference Room",
    meeting_room: "Meeting Room",
    outdoor_garden: "Outdoor Garden",
    rooftop: "Rooftop",
    banquet_hall: "Banquet Hall",
    other: "Other"
};

export function SpaceCard({ space }: SpaceCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{space.name}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50">
                        {spaceTypeLabels[space.space_type || 'other'] || space.space_type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                    {space.capacity && (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{space.capacity}</span>
                            <span className="text-gray-500">guests</span>
                        </div>
                    )}
                    {space.floor_level && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{space.floor_level}</span>
                        </div>
                    )}
                    {space.hourly_rate && (
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">${space.hourly_rate}</span>
                            <span className="text-gray-500">/ hour</span>
                        </div>
                    )}
                    {space.square_footage && (
                        <div className="text-xs text-gray-500 mt-2">
                            {space.square_footage.toLocaleString()} sq ft
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button asChild variant="outline" className="flex-1">
                    <Link href={`/spaces/${space.id}`}>
                        View Details
                    </Link>
                </Button>
                <Button asChild variant="default" className="flex-1">
                    <Link href={`/spaces/${space.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
