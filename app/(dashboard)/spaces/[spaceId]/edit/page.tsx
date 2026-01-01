"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Space } from "@/lib/types";
import { SpaceForm } from "@/components/spaces/SpaceForm";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { useToast } from "@/hooks/use-toast";

export default function EditSpacePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const spaceId = params?.spaceId as string;

    const [space, setSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const res = await fetch(`/api/spaces/${spaceId}`);
                if (!res.ok) throw new Error("Failed to fetch space");
                const data = await res.json();
                setSpace(data);
            } catch (err) {
                setError("Could not load space details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (spaceId) {
            fetchSpace();
        }
    }, [spaceId]);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/spaces/${spaceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update space");

            toast({
                title: "Success",
                description: "Space updated successfully",
            });

            router.push(`/spaces/${spaceId}`);
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

    if (!space) return <ErrorMessage message="Space not found" />;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Space</h1>
                <p className="text-gray-500 mt-1">Update space details</p>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <SpaceForm initialData={space} onSubmit={handleSubmit} isLoading={isSubmitting} />
            </div>
        </div>
    );
}
