"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/ClientForm";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Venue } from "@/lib/types";

export default function NewClientPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchVenues = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/venues");
            if (!res.ok) throw new Error("Failed to fetch venues");
            const data = await res.json();
            setVenues(data);
        } catch (err) {
            console.error(err);
            setError("Could not load venues. Please create a venue first.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleSubmit = async (values: any) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create client");

            toast({
                title: "Success",
                description: "Client created successfully",
            });

            router.push("/clients");
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

    if (error) return <ErrorMessage message={error} onRetry={fetchVenues} />;

    if (venues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Venue Found</h3>
                <p className="text-gray-500 mb-4">You need to create a venue before you can add clients.</p>
                <button
                    onClick={() => router.push('/venues/new')}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                    Create Venue
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add Client</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <ClientForm venues={venues} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        </div>
    );
}
