import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const supabase = await createClient();
    const serviceRole = createServiceRoleClient();
    const { venueId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Verify caller is a member of this venue (service role to bypass circular RLS)
    const { data: membership } = await (serviceRole as any)
      .from("venue_team_members")
      .select("role")
      .eq("venue_id", venueId)
      .eq("profile_id", user.id)
      .single();

    if (!membership) return new NextResponse("Forbidden", { status: 403 });

    const { data, error } = await (serviceRole as any)
      .from("venue_team_members")
      .select(`
        id,
        profile_id,
        role,
        created_at,
        profiles (
          full_name,
          email
        )
      `)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
