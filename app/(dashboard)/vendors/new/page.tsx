"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorForm } from "@/components/vendors/VendorForm";
import { useToast } from "@/hooks/use-toast";
import { Venue } from "@/lib/types";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

export default function NewVendorPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await fetch("/api/venues");
                if (!res.ok) throw new Error("Failed to fetch venues");
                const data = await res.json();
                setVenues(data);
            } catch (err) {
                console.error(err);
                setError("Could not load venues required to register a vendor.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVenues();
    }, []);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to create vendor");

            toast({
                title: "Success",
                description: "Vendor registered successfully",
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
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;

    if (venues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Venues Found</h3>
                <p className="text-gray-500 mb-4">You need to create a venue before you can register vendors for it.</p>
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
            <h1 className="text-2xl font-bold mb-6">Register New Vendor</h1>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <VendorForm venues={venues} onSubmit={handleSubmit} isLoading={isSubmitting} />
            </div>
        </div>
    );
}
