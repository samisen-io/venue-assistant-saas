"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/EventForm";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Event, Space } from "@/lib/types";

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [event, setEvent] = useState<Event | null>(null);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eventRes, spacesRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch("/api/spaces")
            ]);

            if (!eventRes.ok || !spacesRes.ok) throw new Error("Failed to fetch data");

            const eventData = await eventRes.json();
            const spacesData = await spacesRes.json();

            setEvent(eventData);
            setSpaces(spacesData);
        } catch (err) {
            console.error(err);
            setError("Could not load event data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const handleSubmit = async (values: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.status === 409) {
                const data = await res.json();
                const conflictNames = data.conflictingEvents
                    ?.map((e: any) => e.event_name)
                    .join(", ");
                toast({
                    title: "Space Conflict",
                    description: conflictNames
                        ? `This space is already booked by: ${conflictNames}. Please choose a different space or time.`
                        : "This space is already booked for the selected time.",
                    variant: "destructive",
                });
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to update event");
            }

            toast({
                title: "Success",
                description: "Event updated successfully",
            });

            router.push(`/events/${eventId}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loading />;

    if (error || !event) return <ErrorMessage message={error || "Event not found"} onRetry={fetchData} />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <EventForm
                    initialData={event}
                    spaces={spaces}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                />
            </div>
        </div>
    );
}
