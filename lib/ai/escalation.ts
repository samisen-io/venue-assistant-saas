/**
 * Escalation logic — determines when a conversation should be
 * handed off from the AI to a human venue manager.
 */

import type { Database } from "@/lib/types/database.types"
import type { ExtractedEventData } from "@/lib/types/conversation.types"

type VenueAISettingsRow = Database["public"]["Tables"]["venue_ai_settings"]["Row"]
type SpaceRow = Database["public"]["Tables"]["spaces"]["Row"]

interface EscalationInput {
  extractedData: ExtractedEventData | null
  messageCount: number
  aiSettings: VenueAISettingsRow | null
  spaces: SpaceRow[]
  lastUserMessage: string
}

interface EscalationResult {
  escalate: boolean
  reason: string
}

const NEGATIVE_KEYWORDS = [
  "frustrated",
  "disappointed",
  "annoyed",
  "angry",
  "terrible",
  "awful",
  "horrible",
  "unacceptable",
  "ridiculous",
  "waste of time",
  "speak to someone",
  "speak to a person",
  "talk to a human",
  "real person",
  "manager",
  "complaint",
]

const COMPLEX_KEYWORDS = [
  "contract",
  "insurance",
  "liability",
  "legal",
  "cancellation policy",
  "refund",
  "custom build",
  "multi-day",
  "exclusive use",
  "buyout",
  "partnership",
  "sponsorship",
]

export function shouldEscalate(input: EscalationInput): EscalationResult {
  const { extractedData, messageCount, aiSettings, spaces, lastUserMessage } = input
  const msg = lastUserMessage.toLowerCase()
  const managerName = aiSettings?.manager_name || "the venue manager"

  // 1. Explicit human request
  if (NEGATIVE_KEYWORDS.some((kw) => msg.includes(kw))) {
    if (aiSettings?.escalate_on_negative_sentiment !== false) {
      return {
        escalate: true,
        reason: `I'd love to connect you with ${managerName} who can assist you personally. Let me arrange that!`,
      }
    }
  }

  // 2. Complex questions
  if (COMPLEX_KEYWORDS.some((kw) => msg.includes(kw))) {
    if (aiSettings?.escalate_on_complex_questions !== false) {
      return {
        escalate: true,
        reason: `That's a great question! ${managerName} would be the best person to discuss the specifics with you.`,
      }
    }
  }

  // 3. Guest count exceeds max capacity by threshold
  if (extractedData?.guest_count && typeof extractedData.guest_count === "number") {
    const maxCapacity = spaces.reduce((max, s) => Math.max(max, s.capacity ?? 0), 0)
    const threshold = aiSettings?.escalate_capacity_threshold ?? 20
    if (maxCapacity > 0 && extractedData.guest_count > maxCapacity * (1 + threshold / 100)) {
      return {
        escalate: true,
        reason: `For an event of that size, ${managerName} can discuss creative setup options to accommodate your group.`,
      }
    }
  }

  // 4. Event too close (urgent timeline)
  if (extractedData?.date) {
    const eventDate = new Date(extractedData.date)
    const daysAway = Math.ceil(
      (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    const minDays = aiSettings?.escalate_min_days_away ?? 14
    if (daysAway > 0 && daysAway < minDays) {
      return {
        escalate: true,
        reason: `Since your event is coming up soon, let me connect you with ${managerName} to expedite the planning process!`,
      }
    }
  }

  // 5. Too many messages without resolution
  const maxMessages = aiSettings?.escalate_after_messages ?? 10
  if (messageCount >= maxMessages) {
    return {
      escalate: true,
      reason: `I want to make sure you get the best assistance. Let me connect you with ${managerName} who can help with all the details!`,
    }
  }

  // 6. Budget concerns
  if (aiSettings?.escalate_on_budget_concerns !== false) {
    const budgetKeywords = [
      "too expensive",
      "over budget",
      "can't afford",
      "cheaper",
      "discount",
      "negotiate",
      "lower price",
    ]
    if (budgetKeywords.some((kw) => msg.includes(kw))) {
      return {
        escalate: true,
        reason: `${managerName} would be happy to discuss flexible options that work within your budget.`,
      }
    }
  }

  return { escalate: false, reason: "" }
}
