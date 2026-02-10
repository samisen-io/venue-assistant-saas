"use client"

import { useState, useCallback, useRef } from "react"
import type {
  ChatRequest,
  ChatResponse,
  SuggestedAction,
  ExtractedEventData,
} from "@/lib/types/conversation.types"

export interface ChatMessageItem {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  suggestedActions?: SuggestedAction[]
}

interface UseChatOptions {
  slug: string
  preFilledDate?: string | null
}

interface UseChatReturn {
  messages: ChatMessageItem[]
  isLoading: boolean
  error: string | null
  conversationId: string | null
  suggestedActions: SuggestedAction[]
  extractedData: ExtractedEventData | null
  sendMessage: (text: string) => Promise<void>
  retryLast: () => Promise<void>
  clearError: () => void
}

function getSessionId(): string {
  const key = "venue-chat-session"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function useChat({ slug, preFilledDate }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(`venue-chat-conv-${slug}`)
  })
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([])
  const [extractedData, setExtractedData] = useState<ExtractedEventData | null>(null)
  const lastUserMessageRef = useRef<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessageItem = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: formatTime(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)
      lastUserMessageRef.current = text

      try {
        const body: ChatRequest = {
          message: text,
          conversation_id: conversationId,
          session_id: getSessionId(),
        }

        if (!conversationId && preFilledDate) {
          body.message = `I'm interested in ${preFilledDate}. ${text}`
        }

        const res = await fetch(`/api/venues/public/${slug}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          throw new Error(errData?.error || "Failed to get response")
        }

        const data: ChatResponse = await res.json()

        if (data.conversation_id && data.conversation_id !== conversationId) {
          setConversationId(data.conversation_id)
          sessionStorage.setItem(`venue-chat-conv-${slug}`, data.conversation_id)
        }

        const aiMsg: ChatMessageItem = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.ai_response,
          timestamp: formatTime(),
          suggestedActions: data.suggested_actions,
        }

        setMessages((prev) => [...prev, aiMsg])
        setSuggestedActions(data.suggested_actions ?? [])
        if (data.extracted_data) {
          setExtractedData(data.extracted_data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    },
    [slug, conversationId, preFilledDate]
  )

  const retryLast = useCallback(async () => {
    if (!lastUserMessageRef.current) return
    // Remove the last user message before re-sending
    setMessages((prev) => prev.slice(0, -1))
    await sendMessage(lastUserMessageRef.current)
  }, [sendMessage])

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    error,
    conversationId,
    suggestedActions,
    extractedData,
    sendMessage,
    retryLast,
    clearError,
  }
}
