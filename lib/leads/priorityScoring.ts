/**
 * Calculates a priority score (0-100) for a lead based on multiple factors.
 */

import type { ExtractedEventData } from "@/lib/types/conversation.types"

interface PriorityInput {
  estimatedBudget?: number | null
  guestCount?: number | string | null
  eventDate?: string | null
  dateFlexibility?: string | null
  contactInfoCompleteness: number // 0-1
  messageCount: number
  confidenceScore?: number | null
}

export function calculatePriorityScore(input: PriorityInput): number {
  let score = 0

  // Budget size (0-25 points)
  if (input.estimatedBudget) {
    if (input.estimatedBudget >= 20000) score += 25
    else if (input.estimatedBudget >= 10000) score += 20
    else if (input.estimatedBudget >= 5000) score += 15
    else if (input.estimatedBudget >= 2000) score += 10
    else score += 5
  }

  // Timeline urgency (0-25 points)
  if (input.eventDate) {
    const daysAway = Math.ceil(
      (new Date(input.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (daysAway > 0 && daysAway <= 30) score += 25
    else if (daysAway <= 60) score += 20
    else if (daysAway <= 90) score += 15
    else if (daysAway <= 180) score += 10
    else score += 5
  }

  // Contact info completeness (0-20 points)
  score += Math.round(input.contactInfoCompleteness * 20)

  // Engagement level (0-15 points)
  if (input.messageCount >= 8) score += 15
  else if (input.messageCount >= 5) score += 12
  else if (input.messageCount >= 3) score += 8
  else score += 3

  // AI confidence (0-15 points)
  if (input.confidenceScore != null) {
    score += Math.round(input.confidenceScore * 15)
  }

  return Math.min(100, Math.max(0, score))
}

export function priorityFromExtractedData(
  extracted: ExtractedEventData | null,
  messageCount: number
): number {
  if (!extracted) return 30

  const contactFields = [
    extracted.contact_info?.name,
    extracted.contact_info?.email,
    extracted.contact_info?.phone,
    extracted.contact_info?.company,
  ]
  const completeness = contactFields.filter(Boolean).length / contactFields.length

  const guestNum =
    typeof extracted.guest_count === "number"
      ? extracted.guest_count
      : typeof extracted.guest_count === "string"
        ? parseInt(extracted.guest_count, 10) || null
        : null

  return calculatePriorityScore({
    estimatedBudget: extracted.budget,
    guestCount: guestNum,
    eventDate: extracted.date,
    dateFlexibility: extracted.date_flexibility,
    contactInfoCompleteness: completeness,
    messageCount,
    confidenceScore: extracted.confidence_score,
  })
}
