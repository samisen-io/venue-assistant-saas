"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/ClientForm";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Client, Venue } from "@/lib/types";

export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [clientRes, venuesRes] = await Promise.all([
                fetch(`/api/clients/${clientId}`),
                fetch("/api/venues"),
            ]);

            if (!clientRes.ok || !venuesRes.ok) throw new Error("Failed to fetch data");

            const clientData = await clientRes.json();
            const venuesData = await venuesRes.json();

            setClient(clientData);
            setVenues(venuesData);
        } catch (err) {
            console.error(err);
            setError("Could not load client data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clientId]);

    const handleSubmit = async (values: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update client");

            toast({
                title: "Success",
                description: "Client updated successfully",
            });

            router.push(`/clients/${clientId}`);
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

    if (error || !client) return <ErrorMessage message={error || "Client not found"} onRetry={fetchData} />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <ClientForm initialData={client} venues={venues} onSubmit={handleSubmit} isLoading={isSaving} />
            </div>
        </div>
    );
}
