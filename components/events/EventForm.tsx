"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { eventFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
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
import { Event, Space, VendorCategory } from "@/lib/types";
import { X } from "lucide-react";

// Schema extension to include space_id which isn't in base event schema but needed for creation
const eventFormWithSpaceSchema = eventFormSchema.extend({
    space_id: z.string().min(1, "Space is required"),
});

interface EventFormProps {
    initialData?: Event;
    spaces: Space[]; // Needed for space selection
    onSubmit: (values: any) => Promise<void>;
    isLoading?: boolean;
}

// Service category options with display names
const SERVICE_CATEGORIES: { value: VendorCategory; label: string }[] = [
    { value: "catering", label: "Catering" },
    { value: "av", label: "AV Equipment" },
    { value: "florals", label: "Florals & Decor" },
    { value: "photography", label: "Photography" },
    { value: "entertainment", label: "Entertainment" },
    { value: "parking", label: "Parking" },
    { value: "security", label: "Security" },
    { value: "other", label: "Other Services" },
];

type ServiceBudget = {
    category: VendorCategory;
    amount: number;
};

export function EventForm({ initialData, spaces, onSubmit, isLoading = false }: EventFormProps) {
    // Parse existing budget_breakdown into service budgets
    const initialServiceBudgets: ServiceBudget[] = initialData?.budget_breakdown
        ? Object.entries(initialData.budget_breakdown as Record<string, number>).map(([category, amount]) => ({
            category: category as VendorCategory,
            amount,
        }))
        : [];

    const [serviceBudgets, setServiceBudgets] = useState<ServiceBudget[]>(initialServiceBudgets);

    const form = useForm<z.infer<typeof eventFormWithSpaceSchema>>({
        resolver: zodResolver(eventFormWithSpaceSchema),
        mode: "onBlur", // Enable inline validation
        defaultValues: initialData ? {
            space_id: (initialData as any).space_id || "",
            event_name: initialData.event_name,
            event_type: initialData.event_type,
            event_date: initialData.event_date.split('T')[0], // simplistic date handling
            event_time: initialData.event_time || "",
            guest_count: initialData.guest_count,
            budget_total: initialData.budget_total,
            description: initialData.description || "",
            special_requirements: initialData.special_requirements || "",
        } : {
            space_id: "",
            event_name: "",
            event_type: "",
            event_date: "",
            event_time: "",
            guest_count: 0,
            budget_total: 0,
            description: "",
            special_requirements: "",
        },
    });

    // Helper functions for service management
    const toggleService = (category: VendorCategory) => {
        const exists = serviceBudgets.find(s => s.category === category);
        if (exists) {
            setServiceBudgets(serviceBudgets.filter(s => s.category !== category));
        } else {
            setServiceBudgets([...serviceBudgets, { category, amount: 0 }]);
        }
    };

    const updateServiceBudget = (category: VendorCategory, amount: number) => {
        setServiceBudgets(serviceBudgets.map(s =>
            s.category === category ? { ...s, amount } : s
        ));
    };

    const removeService = (category: VendorCategory) => {
        setServiceBudgets(serviceBudgets.filter(s => s.category !== category));
    };

    // Calculate total allocated budget
    const totalAllocated = serviceBudgets.reduce((sum, s) => sum + s.amount, 0);

    // Wrap onSubmit to include budget_breakdown
    const handleFormSubmit = async (values: any) => {
        const budget_breakdown = serviceBudgets.reduce((acc, s) => {
            acc[s.category] = s.amount;
            return acc;
        }, {} as Record<string, number>);

        await onSubmit({
            ...values,
            budget_breakdown,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="space_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Space</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select space" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {spaces.map((space) => (
                                        <SelectItem key={space.id} value={space.id}>
                                            {space.name} {space.capacity && `(${space.capacity} guests)`}
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
                    name="event_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Smith-Jones Wedding" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="event_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="wedding">Wedding</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="birthday">Birthday</SelectItem>
                                        <SelectItem value="conference">Conference</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="guest_count"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guest Count</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="event_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="budget_total"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Budget ($)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Service Categories Section */}
                <div className="space-y-4">
                    <div>
                        <FormLabel>Services Needed</FormLabel>
                        <FormDescription>
                            Select which vendor services you need for this event and allocate budget for each.
                        </FormDescription>
                    </div>

                    {/* Service Selection Checkboxes */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {SERVICE_CATEGORIES.map((service) => {
                            const isSelected = serviceBudgets.some(s => s.category === service.value);
                            return (
                                <div key={service.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={service.value}
                                        checked={isSelected}
                                        onCheckedChange={() => toggleService(service.value)}
                                    />
                                    <label
                                        htmlFor={service.value}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {service.label}
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Budget Allocation for Selected Services */}
                    {serviceBudgets.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <div className="text-sm font-medium">Budget Allocation</div>
                            {serviceBudgets.map((service) => {
                                const serviceLabel = SERVICE_CATEGORIES.find(s => s.category === service.category)?.label || service.category;
                                return (
                                    <div key={service.category} className="flex items-center gap-3">
                                        <div className="flex-1 flex items-center gap-2">
                                            <label className="text-sm min-w-[120px]">{serviceLabel}</label>
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={service.amount || ""}
                                                    onChange={(e) => updateServiceBudget(service.category, parseFloat(e.target.value) || 0)}
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeService(service.category)}
                                            className="h-9 w-9 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm font-medium">Total Allocated:</span>
                                <span className="text-sm font-bold">${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {totalAllocated > parseFloat(form.watch("budget_total")?.toString() || "0") && (
                                <p className="text-sm text-red-600">
                                    Warning: Allocated budget exceeds total budget
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description / Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Details about the event..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                    {isLoading || form.formState.isSubmitting ? (initialData ? "Saving..." : "Creating...") : (initialData ? "Save Changes" : "Create Event")}
                </Button>
            </form>
        </Form>
    );
}
