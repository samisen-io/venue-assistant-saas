import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit/logger";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ venueId: string; memberId: string }> }
) {
  try {
    const supabase = await createClient();
    const serviceRole = createServiceRoleClient();
    const { venueId, memberId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Only owners and admins can remove members.
    // Must use service role — same circular RLS issue as the invite route.
    const { data: membership } = await (serviceRole as any)
      .from("venue_team_members")
      .select("role")
      .eq("venue_id", venueId)
      .eq("profile_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch the member being removed so we can log their email
    const { data: target } = await (serviceRole as any)
      .from("venue_team_members")
      .select("role, profiles(email)")
      .eq("id", memberId)
      .eq("venue_id", venueId)
      .single();

    if (!target) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Owners cannot be removed
    if (target.role === "owner") {
      return new NextResponse("Cannot remove the venue owner.", { status: 400 });
    }

    const { error } = await (serviceRole as any)
      .from("venue_team_members")
      .delete()
      .eq("id", memberId)
      .eq("venue_id", venueId);

    if (error) {
      console.error("Error removing team member:", error);
      return new NextResponse("Failed to remove team member.", { status: 500 });
    }

    await logActivity({
      venueId,
      actorId: user.id,
      actionType: "delete",
      entityType: "venue",
      entityId: venueId,
      description: `Removed ${target.profiles?.email ?? "a team member"} from the venue.`,
      changes: { old: { role: target.role } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in team member DELETE:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
