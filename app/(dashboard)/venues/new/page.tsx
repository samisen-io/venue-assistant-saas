"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VenueForm } from "@/components/venues/VenueForm";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { venueFormSchema } from "@/lib/utils/validation";

export default function NewVenuePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: z.infer<typeof venueFormSchema>) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/venues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create venue");

            toast({
                title: "Success",
                description: "Venue created successfully",
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
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add New Venue</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <VenueForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </div>
    );
}
