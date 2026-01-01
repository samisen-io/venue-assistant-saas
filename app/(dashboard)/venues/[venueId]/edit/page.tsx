"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { VenueForm } from "@/components/venues/VenueForm";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Venue } from "@/lib/types";
import { z } from "zod";
import { venueFormSchema } from "@/lib/utils/validation";

export default function EditVenuePage({ params }: { params: Promise<{ venueId: string }> }) {
    // Unwrap params using React.use()
    const { venueId } = use(params);

    const router = useRouter();
    const { toast } = useToast();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchVenue = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/venues/${venueId}`);
            if (!res.ok) throw new Error("Failed to fetch venue");
            const data = await res.json();
            setVenue(data);
        } catch (err) {
            setError("Could not load venue details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVenue();
    }, [venueId]);

    const handleSubmit = async (values: z.infer<typeof venueFormSchema>) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/venues/${venueId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update venue");

            toast({
                title: "Success",
                description: "Venue updated successfully",
            });

            router.push("/venues");
            router.refresh();
        } catch (error) {
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

    if (error || !venue) return <ErrorMessage message={error || "Venue not found"} onRetry={fetchVenue} />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Venue</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <VenueForm
                    initialData={venue}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                />
            </div>
        </div>
    );
}
