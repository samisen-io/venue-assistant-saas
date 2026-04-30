import { createServiceRoleClient } from "@/lib/supabase/server";

export type AuditActionType =
  | "create"
  | "update"
  | "delete"
  | "ai_auto_book"
  | "ai_draft_proposal"
  | "ai_email_sent";

export type EntityType = "event" | "lead" | "proposal" | "vendor" | "space" | "venue";

export interface AuditLogPayload {
  venueId: string;
  actorId: string | null;
  actionType: AuditActionType;
  entityType: EntityType;
  entityId: string;
  changes?: {
    old?: Record<string, any>;
    new?: Record<string, any>;
  };
  description: string;
}

/**
 * Logs an activity to the global audit_logs table.
 * Uses the Service Role client to bypass RLS for inserts.
 */
export async function logActivity(payload: AuditLogPayload): Promise<void> {
  const supabase = createServiceRoleClient();

  try {
    const { error } = await (supabase as any).from("audit_logs").insert({
      venue_id: payload.venueId,
      actor_id: payload.actorId,
      action_type: payload.actionType,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      changes: payload.changes || null,
      description: payload.description,
    });

    if (error) {
      console.error("Failed to insert audit log:", error);
    }
  } catch (err) {
    console.error("Error in logActivity:", err);
  }
}
