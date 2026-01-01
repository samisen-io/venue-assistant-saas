"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { spaceFormSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Space } from "@/lib/types";

interface SpaceFormProps {
    initialData?: Space;
    onSubmit: (values: z.infer<typeof spaceFormSchema>) => Promise<void>;
    isLoading?: boolean;
}

export function SpaceForm({ initialData, onSubmit, isLoading = false }: SpaceFormProps) {
    const form = useForm<z.infer<typeof spaceFormSchema>>({
        resolver: zodResolver(spaceFormSchema),
        mode: "onBlur",
        defaultValues: initialData ? {
            name: initialData.name,
            capacity: initialData.capacity || 0,
            space_type: initialData.space_type || "",
            floor_level: initialData.floor_level || "",
            square_footage: initialData.square_footage || 0,
            hourly_rate: initialData.hourly_rate || 0,
            notes: initialData.notes || "",
        } : {
            name: "",
            capacity: 0,
            space_type: "",
            floor_level: "",
            square_footage: 0,
            hourly_rate: 0,
            notes: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Space Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="Grand Ballroom" {...field} />
                            </FormControl>
                            <FormDescription>
                                The name of this bookable space
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="space_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Space Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ballroom">Ballroom</SelectItem>
                                        <SelectItem value="conference_room">Conference Room</SelectItem>
                                        <SelectItem value="meeting_room">Meeting Room</SelectItem>
                                        <SelectItem value="outdoor_garden">Outdoor Garden</SelectItem>
                                        <SelectItem value="rooftop">Rooftop</SelectItem>
                                        <SelectItem value="banquet_hall">Banquet Hall</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity *</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="200" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Maximum number of guests
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="floor_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Floor Level</FormLabel>
                                <FormControl>
                                    <Input placeholder="2nd Floor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="square_footage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Square Footage</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="5000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hourly_rate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hourly Rate ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="500.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional details about this space (amenities, setup options, restrictions, etc.)"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                    {isLoading || form.formState.isSubmitting ? (initialData ? "Saving..." : "Creating...") : (initialData ? "Save Changes" : "Create Space")}
                </Button>
            </form>
        </Form>
    );
}
