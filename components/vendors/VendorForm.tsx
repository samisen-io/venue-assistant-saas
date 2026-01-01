"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { vendorFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Vendor, Venue } from "@/lib/types";

// Explicitly define the form values type to avoid 'unknown' issues
const vendorFormWithVenueSchema = vendorFormSchema.extend({
    venue_id: z.string().min(1, "Venue is required"),
});

type VendorFormValues = z.infer<typeof vendorFormWithVenueSchema>;

interface VendorFormProps {
    initialData?: Vendor;
    venues: Venue[];
    onSubmit: (values: VendorFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function VendorForm({ initialData, venues, onSubmit, isLoading = false }: VendorFormProps) {
    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorFormWithVenueSchema) as any, // Cast to any to bypass the complex type mismatch
        defaultValues: {
            venue_id: initialData?.venue_id || "",
            name: initialData?.name || "",
            category: initialData?.category || "",
            contact_name: initialData?.contact_name || "",
            contact_email: initialData?.contact_email || "",
            contact_phone: initialData?.contact_phone || "",
            cost_structure: initialData?.cost_structure || "per_unit",
            cost_per_unit: initialData?.cost_per_unit || 0,
            website: initialData?.website || "",
            notes: initialData?.notes || "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="venue_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Venue</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select venue" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {venues.map((venue) => (
                                        <SelectItem key={venue.id} value={venue.id}>
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vendor Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Catering" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="catering">Catering</SelectItem>
                                        <SelectItem value="av">A/V</SelectItem>
                                        <SelectItem value="florals">Florals</SelectItem>
                                        <SelectItem value="parking">Parking</SelectItem>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="entertainment">Entertainment</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Person</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jane Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="jane@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="(555) 555-5555" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="cost_structure"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cost Structure</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="per_unit">Per Guest/Unit</SelectItem>
                                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cost_per_unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>List Price / Unit Cost ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Specialties, restrictions, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (initialData ? "Saving..." : "Creating...") : (initialData ? "Save Changes" : "Create Vendor")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
