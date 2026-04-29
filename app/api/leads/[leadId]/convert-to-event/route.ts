/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAuthedUserAndVenue(supabase: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, venueId: null };
    
    // Check old owner_id or new venue_team_members
    const { data: member } = await supabase
        .from("venue_team_members")
        .select("venue_id")
        .eq("profile_id", user.id)
        .limit(1)
        .maybeSingle();
        
    return { user, venueId: member?.venue_id ?? null };
}

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const supabase = await createClient();
        const { user, venueId } = await getAuthedUserAndVenue(supabase);
        if (!user || !venueId) return new NextResponse("Unauthorized", { status: 401 });

        const { leadId } = await params;

        // Fetch the lead
        const { data: lead, error: leadError } = await (supabase as any)
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
            const { data: existingClient } = await (supabase as any)
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
            const { data: newClient, error: clientError } = await (supabase as any)
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
        const { data: spaces } = await (supabase as any)
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

        const { data: event, error: eventError } = await (supabase as any)
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
        await (supabase as any)
            .from("leads")
            .update({
                status: "won",
                updated_at: new Date().toISOString(),
            })
            .eq("id", leadId);

        // Create a lead activity (legacy)
        await (supabase as any).from("lead_activities").insert({
            lead_id: leadId,
            activity_type: "converted_to_event",
            description: `Lead converted to event: ${event.event_name}`,
            metadata: { event_id: event.id },
        });

        // Global Audit Trail
        const { logActivity } = await import("@/lib/audit/logger");
        await logActivity({
            venueId,
            actorId: user.id,
            actionType: "create",
            entityType: "event",
            entityId: event.id,
            description: `Converted lead ${lead.contact_name} into an Event.`,
            changes: { new: eventData }
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
