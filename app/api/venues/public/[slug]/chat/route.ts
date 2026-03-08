/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { askClaude } from "@/lib/ai/claude"
import { buildVenueChatSystemPrompt } from "@/lib/ai/prompts/venueChat"
import { extractEventDataFromChat } from "@/lib/ai/extraction/chatDataExtractor"
import { shouldEscalate } from "@/lib/ai/escalation"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/utils/rateLimit"
import { fetchVenuePublicPageData } from "@/lib/public-page/fetchPublicVenue"
import { shouldCreateLead, createLeadFromConversation } from "@/lib/leads/leadCreator"
import { canSendChatMessage } from "@/lib/subscription/limits"
import { checkAvailability } from "@/lib/ai/tools/availabilityChecker"
import type { ChatResponse, ExtractedEventData, SuggestedAction } from "@/lib/types/conversation.types"

function extractDatesFromMessage(message: string): string[] {
  const dates: string[] = []
  const now = new Date()
  const currentYear = now.getFullYear()

  // ISO format: 2026-06-14
  const isoRegex = /\b(\d{4})-(\d{2})-(\d{2})\b/g
  let m: RegExpExecArray | null
  while ((m = isoRegex.exec(message)) !== null) {
    dates.push(m[0])
  }

  // "June 14", "June 14th", "June 14, 2026"
  const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"]
  const monthRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/gi
  while ((m = monthRegex.exec(message)) !== null) {
    const monthIdx = monthNames.indexOf(m[1].toLowerCase())
    const day = parseInt(m[2])
    let year = m[3] ? parseInt(m[3]) : currentYear
    if (!m[3] && (monthIdx < now.getMonth() || (monthIdx === now.getMonth() && day < now.getDate()))) {
      year = currentYear + 1
    }
    if (monthIdx >= 0 && day >= 1 && day <= 31) {
      dates.push(`${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
    }
  }

  // MM/DD/YYYY or MM/DD
  const slashRegex = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g
  while ((m = slashRegex.exec(message)) !== null) {
    const month = parseInt(m[1])
    const day = parseInt(m[2])
    let year = m[3] ? parseInt(m[3]) : currentYear
    if (year < 100) year += 2000
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      dates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
    }
  }

  return [...new Set(dates)]
}

const CHAT_RATE_LIMIT = {
  limit: 30,
  windowSeconds: 3600,
  identifier: "venue-chat",
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limit
    const ip = getClientIp(request)
    const rl = checkRateLimit(ip, CHAT_RATE_LIMIT)
    if (!rl.success) return rateLimitResponse(rl)

    const { slug } = await params
    const body = await request.json()
    const { message, conversation_id, session_id } = body as {
      message?: string
      conversation_id?: string | null
      session_id?: string
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    // Load venue data
    const venueData = await fetchVenuePublicPageData({ slug, publishedOnly: true })
    if (!venueData) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    const { venue, spaces, packages, packageAddons, amenities, eventTypes, aiSettings } = venueData
    const supabase = createServiceRoleClient()

    // Check the venue owner's plan allows more AI chat messages
    if (venue.owner_id) {
      const chatLimit = await canSendChatMessage(venue.owner_id, venue.id)
      if (!chatLimit.allowed) {
        return NextResponse.json(
          { error: "This venue's AI assistant is temporarily unavailable. Please contact the venue directly." },
          { status: 429 }
        )
      }
    }

    // ---- Conversation management ----
    let convId = conversation_id
    let previousMessages: { role: "user" | "assistant"; content: string }[] = []
    let previousExtracted: ExtractedEventData | null = null
    let messageCount = 0

    if (convId) {
      // Load existing conversation
      const { data: conv } = await (supabase as any)
        .from("conversations")
        .select("id, extracted_data, message_count")
        .eq("id", convId)
        .eq("venue_id", venue.id)
        .limit(1)
        .single()

      if (conv) {
        previousExtracted = (conv.extracted_data as ExtractedEventData) ?? null
        messageCount = conv.message_count ?? 0

        // Load message history
        const { data: msgs } = await (supabase as any)
          .from("conversation_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })
          .limit(20)

        previousMessages = (msgs ?? []) as { role: "user" | "assistant"; content: string }[]
      } else {
        // Invalid conversation_id, create new
        convId = null
      }
    }

    if (!convId) {
      // Create new conversation
      const { data: newConv, error: convError } = await (supabase as any)
        .from("conversations")
        .insert({
          venue_id: venue.id,
          session_id: session_id || null,
          status: "active",
          message_count: 0,
        })
        .select("id")
        .single()

      if (convError || !newConv) {
        console.error("Failed to create conversation:", convError)
        return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 })
      }
      convId = newConv.id as string
    }

    // Store user message
    await (supabase as any).from("conversation_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message.trim(),
    })

    messageCount += 1

    // ---- Check escalation ----
    const escalation = shouldEscalate({
      extractedData: previousExtracted,
      messageCount,
      aiSettings,
      spaces,
      lastUserMessage: message,
    })

    // ---- Build AI prompt and get response ----
    const systemPrompt = buildVenueChatSystemPrompt({
      venue,
      spaces,
      packages,
      addons: packageAddons,
      amenities,
      eventTypes,
      aiSettings,
    })

    // Check availability for any dates mentioned in the message
    let availabilityContext = ""
    const mentionedDates = extractDatesFromMessage(message)
    if (mentionedDates.length > 0) {
      const results = await Promise.all(
        mentionedDates.map((date) => checkAvailability(venue.id, date).catch(() => null))
      )
      const lines = results
        .filter(Boolean)
        .map((r) => {
          if (!r) return null
          const label = r.available ? "AVAILABLE" : `NOT AVAILABLE (${r.status})`
          return `- ${r.date}: ${label}${r.note ? ` — ${r.note}` : ""}`
        })
        .filter(Boolean)
      if (lines.length > 0) {
        availabilityContext = `\n\n[AVAILABILITY CHECK RESULTS — report these facts accurately]\n${lines.join("\n")}`
      }
    }

    // Build the messages transcript for Claude
    const transcript = [...previousMessages, { role: "user" as const, content: message.trim() }]
      .map((m) => `${m.role === "user" ? "Prospect" : "You"}:\n${m.content}`)
      .join("\n\n")

    let aiPrompt: string
    if (escalation.escalate) {
      aiPrompt = `${transcript}${availabilityContext}\n\nIMPORTANT: The system has determined this conversation should be escalated to the venue manager. Your response should:\n1. Address the prospect's latest message helpfully.\n2. Smoothly transition to suggesting they connect with the venue manager.\n3. Use this escalation message naturally: "${escalation.reason}"\n4. Ask for their email or phone so the manager can reach out.\n\nRespond as "You:" (the assistant).`
    } else {
      aiPrompt = `${transcript}${availabilityContext}\n\nRespond as "You:" (the assistant). Remember to follow the conversation flow stages and keep your response natural and conversational.`
    }

    const aiResponse = await askClaude(aiPrompt, {
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.7,
    })

    // Clean up response — remove any "You:" prefix the model might add
    const cleanResponse = aiResponse.replace(/^You:\s*/i, "").trim()

    // Store AI response
    await (supabase as any).from("conversation_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: cleanResponse,
    })

    // Update conversation metadata
    await (supabase as any)
      .from("conversations")
      .update({
        message_count: messageCount + 1, // +1 for the AI reply
        last_message_at: new Date().toISOString(),
        status: escalation.escalate ? "escalated" : "active",
      })
      .eq("id", convId)

    // ---- Extract data (async, non-blocking for response) ----
    const allMessages = [
      ...previousMessages,
      { role: "user" as const, content: message.trim() },
      { role: "assistant" as const, content: cleanResponse },
    ]

    // Fire extraction in background — don't block the response
    extractEventDataFromChat(allMessages, previousExtracted)
      .then(async (extracted) => {
        await (supabase as any)
          .from("conversations")
          .update({ extracted_data: extracted })
          .eq("id", convId)

        // Auto-create lead if triggers are met
        const leadCtx = {
          conversationId: convId!,
          venueId: venue.id,
          messageCount: messageCount + 1,
          extractedData: extracted,
          lastUserMessage: message.trim(),
        }
        if (shouldCreateLead(leadCtx)) {
          createLeadFromConversation(leadCtx).catch((err) =>
            console.error("Auto lead creation error:", err)
          )
        }
      })
      .catch((err) => {
        console.error("Data extraction error:", err)
      })

    // ---- Build suggested actions ----
    const suggestedActions: SuggestedAction[] = []
    if (!escalation.escalate) {
      if (messageCount <= 2) {
        suggestedActions.push(
          { label: "Check available dates", action: "check_dates" },
          { label: "See pricing packages", action: "view_pricing" }
        )
      } else if (messageCount <= 5) {
        suggestedActions.push(
          { label: "Get a quote", action: "request_quote" },
          { label: "Speak to manager", action: "escalate" }
        )
      } else {
        suggestedActions.push(
          { label: "Request a proposal", action: "request_proposal" },
          { label: "Schedule a tour", action: "schedule_tour" }
        )
      }
    } else {
      suggestedActions.push(
        { label: "Share my email", action: "share_email" },
        { label: "Call the venue", action: "call_venue" }
      )
    }

    const response: ChatResponse = {
      conversation_id: convId,
      ai_response: cleanResponse,
      suggested_actions: suggestedActions,
      escalate_to_human: escalation.escalate,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
