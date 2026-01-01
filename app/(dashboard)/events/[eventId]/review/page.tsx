"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, AlertCircle } from "lucide-react";
import { Event, Vendor, EventVendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/shared/Loading";
import { useToast } from "@/hooks/use-toast";

type EventVendorWithData = EventVendor & { vendors: Vendor | null };

export default function EventReviewPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [event, setEvent] = useState<Event | null>(null);
    const [vendors, setVendors] = useState<EventVendorWithData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, vendorsRes] = await Promise.all([
                    fetch(`/api/events/${eventId}`),
                    fetch(`/api/events/${eventId}/vendors`)
                ]);

                if (eventRes.ok && vendorsRes.ok) {
                    setEvent(await eventRes.json());
                    setVendors(await vendorsRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const handleReviewChange = (vendorId: string, field: string, value: any) => {
        setReviews(prev => ({
            ...prev,
            [vendorId]: {
                ...prev[vendorId],
                [field]: value
            }
        }));
    };

    const submitReviews = async () => {
        setIsSubmitting(true);
        try {
            // For each vendor, submit a review
            const promises = vendors.map(v => {
                if (!v.vendor_id || !reviews[v.vendor_id]) return Promise.resolve();
                return fetch(`/api/vendors/${v.vendor_id}/reviews`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_id: eventId,
                        ...reviews[v.vendor_id]
                    })
                });
            });

            await Promise.all(promises);

            toast({
                title: "Reviews Submitted",
                description: "Thank you for your feedback! Vendor scores have been updated.",
            });

            router.push(`/events/${eventId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Some reviews failed to submit.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading />;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Post-Event Review</h1>
                <p className="text-muted-foreground mt-2">Rate the performance of your vendors for {event.event_name}.</p>
            </div>

            <div className="space-y-6">
                {vendors.map((v) => {
                    if (!v.vendors) return null;
                    const vid = v.vendor_id;
                    const review = reviews[vid] || { quality_rating: 5, on_time: true, cost_accurate: true, would_use_again: true };

                    return (
                        <Card key={v.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{v.vendors.name}</CardTitle>
                                    <span className="text-sm font-medium text-gray-500 uppercase">{v.category}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold">Service Quality</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleReviewChange(vid, "quality_rating", star)}
                                                    className={`p-1 transition-colors ${review.quality_rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                                >
                                                    <Star className="h-8 w-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold">Performance Metrics</label>
                                        <div className="flex flex-wrap gap-4">
                                            <Button
                                                variant={review.on_time ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleReviewChange(vid, "on_time", !review.on_time)}
                                            >
                                                {review.on_time ? <Check className="mr-2 h-4 w-4" /> : null}
                                                On-Time
                                            </Button>
                                            <Button
                                                variant={review.cost_accurate ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleReviewChange(vid, "cost_accurate", !review.cost_accurate)}
                                            >
                                                {review.cost_accurate ? <Check className="mr-2 h-4 w-4" /> : null}
                                                Cost Accurate
                                            </Button>
                                            <Button
                                                variant={review.would_use_again ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleReviewChange(vid, "would_use_again", !review.would_use_again)}
                                            >
                                                {review.would_use_again ? <Check className="mr-2 h-4 w-4" /> : null}
                                                Would use again
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Notes & Comments</label>
                                    <Textarea
                                        placeholder="How was their communication? Any issues?"
                                        value={review.notes || ""}
                                        onChange={(e) => handleReviewChange(vid, "notes", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-center gap-4 py-8">
                <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Skip Review
                </Button>
                <Button onClick={submitReviews} disabled={isSubmitting || vendors.length === 0} className="px-8">
                    {isSubmitting ? "Submitting..." : "Complete & Save Reviews"}
                </Button>
            </div>
        </div>
    );
}
