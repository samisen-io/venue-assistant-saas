"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { VendorForm } from "@/components/vendors/VendorForm";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Vendor, Venue } from "@/lib/types";

export default function EditVendorPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [vendorRes, venuesRes] = await Promise.all([
                fetch(`/api/vendors/${vendorId}`),
                fetch("/api/venues")
            ]);

            if (!vendorRes.ok || !venuesRes.ok) throw new Error("Failed to fetch data");

            const vendorData = await vendorRes.json();
            const venuesData = await venuesRes.json();

            setVendor(vendorData);
            setVenues(venuesData);
        } catch (err) {
            console.error(err);
            setError("Could not load vendor data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vendorId]);

    const handleSubmit = async (values: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/vendors/${vendorId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update vendor");

            toast({
                title: "Success",
                description: "Vendor updated successfully",
            });

            router.push("/vendors");
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

    if (error || !vendor) return <ErrorMessage message={error || "Vendor not found"} onRetry={fetchData} />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Vendor</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <VendorForm
                    initialData={vendor}
                    venues={venues}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                />
            </div>
        </div>
    );
}
