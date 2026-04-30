import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit/logger";
import { sendEmail } from "@/lib/email/resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const supabase = await createClient();
    const serviceRole = createServiceRoleClient();
    const { venueId } = await params;

    // 1. Verify Authentication & Permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Check if current user is an owner or admin of this venue.
    // Must use service role — the self-referential RLS policy on venue_team_members
    // blocks the regular client from reading the row even when it exists.
    const { data: membership } = await (serviceRole as any)
      .from("venue_team_members")
      .select("role")
      .eq("venue_id", venueId)
      .eq("profile_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return new NextResponse("Forbidden: Only Owners and Admins can invite team members.", { status: 403 });
    }

    // Parse request
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role || !["admin", "staff"].includes(role)) {
      return new NextResponse("Invalid request payload", { status: 400 });
    }

    // 2. User Lookup or Creation
    let targetProfileId: string | null = null;
    let emailSent = false;

    // Step 1: check profiles table by email (fastest, works for existing users)
    const { data: existingProfile } = await (serviceRole as any)
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      targetProfileId = existingProfile.id;

      // Fetch venue name for the notification email
      const { data: venue } = await (serviceRole as any)
        .from("venues")
        .select("name")
        .eq("id", venueId)
        .single();
      const venueName = venue?.name ?? "a venue";

      await sendEmail({
        to: email,
        from: email,
        subject: `You've been added to ${venueName}`,
        body: `Hi,\n\nYou've been added to ${venueName} as a ${role}.\n\nLog in to your account to get started: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.venuemanger.com"}/dashboard`,
      });
      emailSent = true;
    } else {
      // Step 2: try sending an invite email (new user)
      const { data: inviteData, error: inviteError } = await serviceRole.auth.admin.inviteUserByEmail(email);

      if (inviteError) {
        if ((inviteError as any).code === "email_exists") {
          // User exists in auth but has no profile row yet — find them and create the profile
          const { data: { users }, error: listError } = await serviceRole.auth.admin.listUsers({ perPage: 1000 });
          if (listError) {
            console.error("Error listing users:", listError);
            return new NextResponse("Failed to resolve user.", { status: 500 });
          }
          const authUser = users.find((u: any) => u.email === email);
          if (authUser) {
            await (serviceRole as any).from("profiles").upsert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || email.split("@")[0],
            });
            targetProfileId = authUser.id;
          }
        } else {
          console.error("Error inviting user:", inviteError);
          return new NextResponse("Failed to invite user: " + inviteError.message, { status: 500 });
        }
      } else if (inviteData.user) {
        targetProfileId = inviteData.user.id;
        emailSent = true;
      }
    }

    if (!targetProfileId) {
      return new NextResponse("Failed to resolve user identity.", { status: 500 });
    }

    // 3. Database Update: Upsert into venue_team_members so re-inviting after
    // removal works cleanly without a unique-constraint error.
    const { error: teamError } = await (serviceRole as any)
      .from("venue_team_members")
      .upsert(
        { venue_id: venueId, profile_id: targetProfileId, role },
        { onConflict: "venue_id,profile_id" }
      );

    if (teamError) {
      console.error("Error adding team member:", teamError);
      return new NextResponse("Failed to add user to team.", { status: 500 });
    }

    // 4. Audit Logging
    await logActivity({
      venueId,
      actorId: user.id,
      actionType: "create",
      entityType: "venue",
      entityId: venueId,
      description: `Invited ${email} to join the venue as ${role}.`,
      changes: { new: { email, role } }
    });

    return NextResponse.json({ success: true, emailSent });

  } catch (error: any) {
    console.error("Error in team invite API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
