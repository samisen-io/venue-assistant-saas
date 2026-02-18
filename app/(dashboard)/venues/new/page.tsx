"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VenueForm } from "@/components/venues/VenueForm";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { venueFormSchema } from "@/lib/utils/validation";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useVenueContext } from "@/lib/context/VenueContext";
import type { Venue } from "@/lib/types";

export default function NewVenuePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { refreshVenues, setActiveVenue } = useVenueContext();
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [limitMessage, setLimitMessage] = useState<string | undefined>();

    const handleSubmit = async (values: z.infer<typeof venueFormSchema>) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/venues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.status === 403) {
                const data = await res.json();
                if (data.code === "LIMIT_REACHED") {
                    setLimitMessage(data.error);
                    setShowUpgradePrompt(true);
                    return;
                }
            }

            if (!res.ok) throw new Error("Failed to create venue");

            const newVenue: Venue = await res.json();

            toast({
                title: "Success",
                description: "Venue created successfully",
            });

            // Refresh context and switch to the newly created venue
            await refreshVenues();
            setActiveVenue(newVenue);

            router.push("/venues");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add New Venue</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <VenueForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            <UpgradePrompt
                open={showUpgradePrompt}
                onOpenChange={setShowUpgradePrompt}
                message={limitMessage}
                resource="venue"
            />
        </div>
    );
}
