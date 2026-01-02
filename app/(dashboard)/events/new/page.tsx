"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/EventForm";
import NaturalLanguageEventForm from "@/components/events/NaturalLanguageEventForm";
import EventExtractionPreview from "@/components/events/EventExtractionPreview";
import { useToast } from "@/hooks/use-toast";
import { EventService, Space } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText } from "lucide-react";

export default function NewEventPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [eventServices, setEventServices] = useState<EventService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [extractedData, setExtractedData] = useState<any>(null);
    const [nlEnabled, setNlEnabled] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch spaces
                const spacesRes = await fetch("/api/spaces");
                if (!spacesRes.ok) throw new Error("Failed to fetch spaces");
                const spacesData = await spacesRes.json();
                setSpaces(spacesData);

                // Fetch event services
                const servicesRes = await fetch("/api/event-services");
                if (servicesRes.ok) {
                    const servicesData = await servicesRes.json();
                    setEventServices(servicesData);
                }

                // Check if NL event creation is enabled
                const nlRes = await fetch("/api/ai/extract-event");
                if (nlRes.ok) {
                    const nlData = await nlRes.json();
                    setNlEnabled(nlData.status === 'ready');
                }
            } catch (err) {
                setError("Could not load spaces required to create an event.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExtract = (data: any) => {
        setExtractedData(data);
    };

    const handleConfirmExtraction = async (editedData: any) => {
        const serviceIdBySlug = new Map(eventServices.map((service) => [service.slug, service.id]));
        const event_service_requirements = (editedData.needed_categories || [])
            .map((slug: string) => {
                const serviceId = serviceIdBySlug.get(slug);
                if (!serviceId) return null;
                return { event_service_id: serviceId, budget_amount: 0 };
            })
            .filter(Boolean);

        // Convert extracted data to event form values
        const eventData = {
            event_name: editedData.event_name,
            event_type: editedData.event_type,
            event_date: editedData.event_date || new Date().toISOString().split('T')[0],
            event_time: editedData.event_time || '12:00',
            guest_count: editedData.guest_count || 0,
            budget_total: editedData.budget_total || 0,
            description: editedData.description || '',
            special_requirements: editedData.special_requirements || '',
            space_id: spaces[0]?.id, // Default to first space, user can change in form
            event_service_requirements,
        };

        await handleSubmit(eventData);
    };

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create event");

            toast({
                title: "Success",
                description: "Event created successfully",
            });

            router.push("/events");
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;

    // If no spaces exist, we can't create an event
    if (spaces.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Spaces Found</h3>
                <p className="text-gray-500 mb-4">You need to create a space before you can create an event.</p>
                <button
                    onClick={() => router.push('/spaces/new')}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                    Create Space
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

            {nlEnabled ? (
                <Tabs defaultValue="quick" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="quick" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Quick Create
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Manual Form
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="quick" className="space-y-6">
                        <div className="bg-white rounded-lg border p-6 shadow-sm">
                            {extractedData ? (
                                <EventExtractionPreview
                                    data={extractedData}
                                    onConfirm={handleConfirmExtraction}
                                    onCancel={() => setExtractedData(null)}
                                />
                            ) : (
                                <NaturalLanguageEventForm onExtract={handleExtract} />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="manual">
                        <div className="bg-white rounded-lg border p-6 shadow-sm">
                            <EventForm spaces={spaces} onSubmit={handleSubmit} isLoading={isSubmitting} />
                        </div>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    <EventForm spaces={spaces} onSubmit={handleSubmit} isLoading={isSubmitting} />
                </div>
            )}
        </div>
    );
}
