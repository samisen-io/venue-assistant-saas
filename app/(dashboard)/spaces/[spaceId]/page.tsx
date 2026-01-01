"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Users, MapPin, DollarSign, Maximize } from "lucide-react";
import { Space } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

const spaceTypeLabels: Record<string, string> = {
    ballroom: "Ballroom",
    conference_room: "Conference Room",
    meeting_room: "Meeting Room",
    outdoor_garden: "Outdoor Garden",
    rooftop: "Rooftop",
    banquet_hall: "Banquet Hall",
    other: "Other"
};

export default function SpaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const spaceId = params?.spaceId as string;

    const [space, setSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSpaceData = async () => {
        setIsLoading(true);
        setError("");

        try {
            const spaceRes = await fetch(`/api/spaces/${spaceId}`);
            if (!spaceRes.ok) {
                throw new Error("Failed to fetch space details");
            }
            const spaceData = await spaceRes.json();
            setSpace(spaceData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Could not load space details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (spaceId) {
            fetchSpaceData();
        }
    }, [spaceId]);

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchSpaceData} />;

    if (!space) return <ErrorMessage message="Space not found" />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{space.name}</h1>
                            <Badge variant="outline" className="bg-blue-50">
                                {spaceTypeLabels[space.space_type || 'other'] || space.space_type}
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-1">Space Details</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href={`/spaces/${space.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Space
                    </Link>
                </Button>
            </div>

            {/* Space Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Space Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Capacity
                            </p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                                {space.capacity || "N/A"}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">guests</p>
                        </div>

                        {space.hourly_rate && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Hourly Rate
                                </p>
                                <p className="text-2xl font-bold text-green-700 mt-1">
                                    ${space.hourly_rate}
                                </p>
                                <p className="text-xs text-green-600 mt-1">per hour</p>
                            </div>
                        )}

                        {space.square_footage && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-sm text-purple-600 font-medium flex items-center gap-2">
                                    <Maximize className="h-4 w-4" />
                                    Square Footage
                                </p>
                                <p className="text-2xl font-bold text-purple-700 mt-1">
                                    {space.square_footage.toLocaleString()}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">sq ft</p>
                            </div>
                        )}

                        {space.floor_level && (
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </p>
                                <p className="text-lg font-bold text-gray-800 mt-1">
                                    {space.floor_level}
                                </p>
                            </div>
                        )}
                    </div>

                    {space.notes && (
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{space.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
