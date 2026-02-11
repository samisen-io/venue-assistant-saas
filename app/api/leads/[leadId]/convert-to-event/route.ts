/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAuthedVenueId(supabase: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: venue } = await supabase
        .from("venues")
        .select("id")
        .eq("owner_id", user.id)
        .single();
    return venue?.id ?? null;
}

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const supabase = await createClient();
        const venueId = await getAuthedVenueId(supabase);
        if (!venueId) return new NextResponse("Unauthorized", { status: 401 });

        const { leadId } = await params;

        // Fetch the lead
        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .select("*")
            .eq("id", leadId)
            .eq("venue_id", venueId)
            .single();

        if (leadError || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Check if lead is already won or has been converted
        if (lead.status === "won") {
            return NextResponse.json(
                { error: "This lead has already been converted" },
                { status: 400 }
            );
        }

        // Find or create a client
        let clientId: string | null = null;

        if (lead.contact_email) {
            // Try to find existing client by email
            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("venue_id", venueId)
                .eq("email", lead.contact_email)
                .single();

            if (existingClient) {
                clientId = existingClient.id;
            }
        }

        // If no existing client found, create a new one
        if (!clientId) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({
                    venue_id: venueId,
                    contact_name: lead.contact_name || "Unknown Contact",
                    company_name: lead.company || null,
                    email: lead.contact_email || null,
                    phone: lead.contact_phone || null,
                })
                .select()
                .single();

            if (clientError) {
                console.error("Error creating client:", clientError);
                return NextResponse.json(
                    { error: "Failed to create client" },
                    { status: 500 }
                );
            }

            clientId = newClient.id;
        }

        // Get the first space (user can change this in the event form if needed)
        const { data: spaces } = await supabase
            .from("spaces")
            .select("id")
            .eq("venue_id", venueId)
            .limit(1);

        if (!spaces || spaces.length === 0) {
            return NextResponse.json(
                { error: "No spaces available. Please create a space first." },
                { status: 400 }
            );
        }

        // Create the event
        const eventData = {
            venue_id: venueId,
            client_id: clientId,
            space_id: spaces[0].id,
            event_name: `${lead.contact_name || "Event"} - ${lead.event_type || "Event"}`,
            event_type: lead.event_type || "other",
            event_date: lead.event_date || new Date().toISOString().split("T")[0],
            event_time: "12:00", // Default time, user can edit
            guest_count: lead.guest_count || 0,
            budget_total: lead.estimated_budget || 0,
            description: lead.notes || "",
            special_requirements: "",
            status: "planning",
        };

        const { data: event, error: eventError } = await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();

        if (eventError) {
            console.error("Error creating event:", eventError);
            return NextResponse.json(
                { error: "Failed to create event" },
                { status: 500 }
            );
        }

        // Update lead status to won
        await supabase
            .from("leads")
            .update({
                status: "won",
                updated_at: new Date().toISOString(),
            })
            .eq("id", leadId);

        // Create a lead activity
        await supabase.from("lead_activities").insert({
            lead_id: leadId,
            activity_type: "converted_to_event",
            description: `Lead converted to event: ${event.event_name}`,
            metadata: { event_id: event.id },
        });

        return NextResponse.json({
            success: true,
            event_id: event.id,
            client_id: clientId,
        });
    } catch (error: any) {
        console.error("Error converting lead to event:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
