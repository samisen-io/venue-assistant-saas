"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Vendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VendorCard } from "@/components/vendors/VendorCard";
import { Loading } from "@/components/shared/Loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const fetchVendors = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/vendors");
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch vendors");
            }
            const data = await res.json();
            setVendors(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Could not load vendors. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter((vendor) => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={fetchVendors} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                <Button asChild>
                    <Link href="/vendors/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Vendor
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="catering">Catering</SelectItem>
                            <SelectItem value="av">A/V</SelectItem>
                            <SelectItem value="florals">Florals</SelectItem>
                            <SelectItem value="parking">Parking</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredVendors.length === 0 ? (
                <EmptyState
                    title={searchTerm || selectedCategory !== "all" ? "No matches found" : "No vendors found"}
                    description={searchTerm || selectedCategory !== "all"
                        ? "Try adjusting your search filters to find more vendors."
                        : "Add vendors to your database to track performance and get AI-powered recommendations for events."}
                    actionLabel={searchTerm || selectedCategory !== "all" ? "Clear Filters" : "Add Vendor"}
                    {...(searchTerm || selectedCategory !== "all"
                        ? {
                            onAction: () => {
                                setSearchTerm("");
                                setSelectedCategory("all");
                            }
                        }
                        : { actionHref: "/vendors/new" }
                    )}
                />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredVendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                </div>
            )}
        </div>
    );
}
