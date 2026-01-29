"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clientFormSchema } from "@/lib/utils/validation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Client, Venue } from "@/lib/types";

const clientFormWithVenueSchema = clientFormSchema.extend({
    venue_id: z.string().min(1, "Venue is required"),
});

type ClientFormValues = z.infer<typeof clientFormWithVenueSchema>;

interface ClientFormProps {
    initialData?: Client;
    venues: Venue[];
    onSubmit: (values: ClientFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function ClientForm({ initialData, venues, onSubmit, isLoading = false }: ClientFormProps) {
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormWithVenueSchema) as any,
        defaultValues: {
            venue_id: initialData?.venue_id || venues[0]?.id || "",
            company_name: initialData?.company_name || "",
            contact_name: initialData?.contact_name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            notes: initialData?.notes || "",
            notify_on_booking_updates: initialData?.notify_on_booking_updates ?? true,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* venue_id is auto-selected (one venue per user by design) */}
                <input type="hidden" {...form.register("venue_id")} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Corp" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jamie Lee" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="jamie@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="(555) 555-5555" {...field} />
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
                                <Textarea placeholder="Preferences, contract notes, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notify_on_booking_updates"
                    render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Notify client about booking updates</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Enable to send booking confirmations and updates (email automation is set up later).
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (initialData ? "Saving..." : "Creating...") : (initialData ? "Save Changes" : "Create Client")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
