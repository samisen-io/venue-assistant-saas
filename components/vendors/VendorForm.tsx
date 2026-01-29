"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { EventService, Vendor, Venue } from "@/lib/types";

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
    const [eventServices, setEventServices] = useState<EventService[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    // Auto-select the only venue (one venue per user by design)
    const defaultVenueId = initialData?.venue_id || venues[0]?.id || "";

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorFormWithVenueSchema) as any, // Cast to any to bypass the complex type mismatch
        defaultValues: {
            venue_id: defaultVenueId,
            name: initialData?.name || "",
            event_service_ids: (initialData as any)?.vendor_services?.map((service: any) => service.event_service_id) || [],
            contact_name: initialData?.contact_name || "",
            contact_email: initialData?.contact_email || "",
            contact_phone: initialData?.contact_phone || "",
            cost_structure: initialData?.cost_structure || "per_unit",
            cost_per_unit: initialData?.cost_per_unit || 0,
            website: initialData?.website || "",
            notes: initialData?.notes || "",
        },
    });

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoadingServices(true);
            try {
                const res = await fetch("/api/event-services");
                if (!res.ok) throw new Error("Failed to fetch services");
                const data = await res.json();
                setEventServices(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* venue_id is auto-selected (one venue per user by design) */}
                <input type="hidden" {...form.register("venue_id")} />

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
                        name="event_service_ids"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Services Offered</FormLabel>
                                {isLoadingServices ? (
                                    <div className="text-sm text-muted-foreground">Loading services...</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {eventServices.map((service) => {
                                            const isChecked = field.value?.includes(service.id);
                                            return (
                                                <div key={service.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`service-${service.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const next = checked
                                                                ? [...(field.value || []), service.id]
                                                                : (field.value || []).filter((id) => id !== service.id);
                                                            field.onChange(next);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`service-${service.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {service.name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
