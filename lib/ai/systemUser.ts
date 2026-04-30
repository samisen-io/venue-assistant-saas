import { createServiceRoleClient } from "@/lib/supabase/server";

const AI_AGENT_EMAIL = "ai-agent@system.local";
const AI_AGENT_NAME = "AI Assistant";

/**
 * Ensures the global AI Agent profile exists in the database.
 * Returns the UUID of the AI Agent profile.
 */
export async function getAIAgentProfileId(): Promise<string> {
  const supabase = createServiceRoleClient();

  // Try to find the existing AI agent profile
  const { data: existingProfile, error: fetchError } = await (supabase as any)
    .from("profiles")
    .select("id")
    .eq("email", AI_AGENT_EMAIL)
    .limit(1)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile.id;
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching AI profile:", fetchError);
    throw fetchError;
  }

  // If not found, create a pseudo-user in auth.users via service role
  // Note: Since this is a system user, we just create a dummy auth user and let the trigger create the profile.
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: AI_AGENT_EMAIL,
    email_confirm: true,
    password: "system-generated-password-" + Math.random().toString(36).substring(2),
    user_metadata: { full_name: AI_AGENT_NAME },
  });

  if (authError) {
    // If it fails because the email already exists but the profile was deleted, just try inserting the profile directly
    if (authError.message.includes("already exists")) {
       const { data: fallbackUser } = await supabase.auth.admin.listUsers();
       const existingAuth = fallbackUser.users.find((u: any) => u.email === AI_AGENT_EMAIL);
       if (existingAuth) {
          await (supabase as any).from("profiles").upsert({
             id: existingAuth.id,
             email: AI_AGENT_EMAIL,
             full_name: AI_AGENT_NAME
          });
          return existingAuth.id;
       }
    }
    throw authError;
  }

  return authUser.user.id;
}
