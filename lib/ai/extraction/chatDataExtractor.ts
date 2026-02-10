/**
 * Extracts structured event data from a multi-turn chat conversation.
 * Runs after each AI response to incrementally build up extracted data.
 */

import { askClaudeForJSON } from "@/lib/ai/claude"
import type { ExtractedEventData } from "@/lib/types/conversation.types"

interface MessageForExtraction {
  role: "user" | "assistant"
  content: string
}

export async function extractEventDataFromChat(
  messages: MessageForExtraction[],
  previousData: ExtractedEventData | null
): Promise<ExtractedEventData> {
  // Only send the last few messages to keep costs down
  const recentMessages = messages.slice(-6)
  const transcript = recentMessages
    .map((m) => `${m.role === "user" ? "Prospect" : "Assistant"}: ${m.content}`)
    .join("\n")

  const prompt = `Analyze this conversation snippet and extract any event planning details mentioned.

Previous extracted data (update/merge, don't lose existing values):
${previousData ? JSON.stringify(previousData) : "None yet"}

Recent conversation:
"""
${transcript}
"""

Return a JSON object with these fields (only include fields where you have data):
- event_type: string (wedding, corporate, conference, birthday, gala, meeting, other)
- guest_count: number or string like "100-150"
- date: string in YYYY-MM-DD format or null
- date_flexibility: "exact" | "flexible" | "date_range"
- budget: number or null
- requirements: { catering?: boolean, av_setup?: boolean, overnight_rooms?: boolean, outdoor_space?: boolean, alcohol_service?: boolean, custom?: string[] }
- contact_info: { name?: string, email?: string, phone?: string, company?: string }
- urgency: "high" | "medium" | "low"
- confidence_score: number 0-1 (how confident the prospect seems about booking)

Merge with previous data — keep existing values if the conversation hasn't updated them.
Return valid JSON only.`

  try {
    const result = await askClaudeForJSON<ExtractedEventData>(prompt, {
      maxTokens: 1024,
    })
    return result
  } catch {
    // If extraction fails, return previous data or empty
    return previousData ?? {}
  }
}
