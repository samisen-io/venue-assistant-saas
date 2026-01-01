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
import { Event, Space } from "@/lib/types";

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

export function EventForm({ initialData, spaces, onSubmit, isLoading = false }: EventFormProps) {
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
