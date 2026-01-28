"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Calendar, Edit, Mail, Phone, Plus, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientCommunicationSchema } from "@/lib/utils/validation";
import { useClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loading } from "@/components/shared/Loading";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { formatDate, formatTime } from "@/lib/utils/format";
import { CommunicationFormInput } from "@/lib/types";

interface ClientDetailProps {
    clientId: string;
}

const messageTypeLabels: Record<CommunicationFormInput['message_type'], string> = {
    booking_confirmed: "Booking Confirmed",
    booking_updated: "Booking Updated",
    booking_cancelled: "Booking Cancelled",
    general: "General",
    reminder: "Reminder",
};

const statusBadgeClass = (status?: string | null) => {
    switch (status) {
        case "confirmed":
            return "bg-green-100 text-green-800";
        case "completed":
            return "bg-blue-100 text-blue-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        case "in_progress":
            return "bg-yellow-100 text-yellow-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export function ClientDetail({ clientId }: ClientDetailProps) {
    const { client, communications, loading, error, refetch } = useClient(clientId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CommunicationFormInput>({
        resolver: zodResolver(clientCommunicationSchema) as any,
        defaultValues: {
            event_id: null,
            message_type: "general",
            subject: "",
            body: "",
        },
    });

    const bookingHistory = useMemo(() => {
        const events = client?.events || [];
        return [...events].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    }, [client?.events]);

    const handleLogCommunication = async (values: CommunicationFormInput) => {
        if (!client) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/clients/${client.id}/communications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to log communication");

            form.reset({
                event_id: null,
                message_type: "general",
                subject: "",
                body: "",
            });
            setIsDialogOpen(false);
            await refetch();
        } catch (err) {
            console.error(err);
            alert("Could not log communication. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loading />;

    if (error) return <ErrorMessage message={error} onRetry={refetch} />;

    if (!client) return <ErrorMessage message="Client not found" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {client.company_name || client.contact_name}
                    </h1>
                    <p className="text-gray-500 mt-1">Client details and booking history</p>
                </div>
                <Button asChild>
                    <Link href={`/clients/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Client
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Primary booking contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {client.company_name && (
                            <Badge variant="secondary">{client.company_name}</Badge>
                        )}
                        <Badge variant="outline">{client.contact_name}</Badge>
                        <Badge variant="outline" className={client.notify_on_booking_updates ? "text-green-700" : "text-gray-500"}>
                            {client.notify_on_booking_updates ? (
                                <span className="inline-flex items-center gap-2">
                                    <Bell className="h-3.5 w-3.5" />
                                    Receives updates
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <BellOff className="h-3.5 w-3.5" />
                                    Notifications off
                                </span>
                            )}
                        </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {client.email && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${client.email}`} className="hover:underline">
                                    {client.email}
                                </a>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${client.phone}`} className="hover:underline">
                                    {client.phone}
                                </a>
                            </div>
                        )}
                    </div>

                    {client.notes && (
                        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
                            {client.notes}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="bookings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="bookings">Booking History</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking History</CardTitle>
                            <CardDescription>
                                {bookingHistory.length} event{bookingHistory.length === 1 ? "" : "s"} linked to this client
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bookingHistory.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    No bookings linked yet. Assign this client to an event to see history here.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookingHistory.map((event) => (
                                        <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <Link href={`/events/${event.id}`} className="font-semibold hover:underline">
                                                    {event.event_name}
                                                </Link>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(event.event_date)}
                                                    {event.event_time && (
                                                        <span>- {formatTime(event.event_time)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className={statusBadgeClass(event.status)}>
                                                {event.status || "planning"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="communications">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Communication Log</h3>
                            <p className="text-sm text-muted-foreground">Track important updates sent to this client.</p>
                        </div>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Log Communication
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="py-6">
                            {communications.length === 0 ? (
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    No communications logged yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {communications.map((comm) => (
                                        <div key={comm.id} className="rounded-lg border p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">
                                                    {messageTypeLabels[comm.message_type as CommunicationFormInput['message_type']] || comm.message_type}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {comm.sent_at ? formatDate(comm.sent_at) : comm.created_at ? formatDate(comm.created_at) : ""}
                                                </span>
                                            </div>
                                            {comm.subject && (
                                                <p className="text-sm font-medium">{comm.subject}</p>
                                            )}
                                            {comm.body && (
                                                <p className="text-sm text-gray-600 whitespace-pre-line">{comm.body}</p>
                                            )}
                                            {(comm as any).events && (
                                                <div className="text-xs text-muted-foreground">
                                                    Linked Event: {(comm as any).events.event_name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Log Communication</DialogTitle>
                        <DialogDescription>
                            Record an important message sent to this client.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogCommunication)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="message_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(messageTypeLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
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
                                name="event_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Event (Optional)</FormLabel>
                                        <Select
                                            value={field.value ?? "none"}
                                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">No event</SelectItem>
                                                {bookingHistory.map((event) => (
                                                    <SelectItem key={event.id} value={event.id}>
                                                        {event.event_name}
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
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Booking update" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="body"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Write a short summary of the communication..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Log"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
