"use client";

import { useRouter } from "next/navigation";
import { SpaceForm } from "@/components/spaces/SpaceForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function NewSpacePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/spaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Failed to create space");
            }

            toast({
                title: "Success",
                description: "Space created successfully",
            });

            router.push("/spaces");
            router.refresh();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Space</h1>
                <p className="text-gray-500 mt-1">Add a bookable space to your venue</p>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <SpaceForm onSubmit={handleSubmit} isLoading={isSubmitting} />
            </div>
        </div>
    );
}
