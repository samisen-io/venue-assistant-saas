"use client"

import { useEffect, useRef } from "react"
import { useChat } from "@/hooks/useChat"
import { ChatMessage, TypingIndicator } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ChatSuggestions } from "./ChatSuggestions"
import { SuggestedActions } from "./SuggestedActions"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"
import type { SuggestedAction } from "@/lib/types/conversation.types"

interface ChatContainerProps {
  slug: string
  preFilledDate?: string | null
  greeting?: string | null
}

export function ChatContainer({ slug, preFilledDate, greeting }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    error,
    suggestedActions,
    sendMessage,
    retryLast,
    clearError,
  } = useChat({ slug, preFilledDate })

  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  const handleSuggestedAction = (action: SuggestedAction) => {
    sendMessage(action.label)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <ChatSuggestions onSelect={sendMessage} disabled={isLoading} />
        ) : (
          <div className="space-y-4 p-4">
            {/* Greeting message */}
            {greeting && (
              <ChatMessage
                role="assistant"
                content={greeting}
              />
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}

            {isLoading && <TypingIndicator />}

            {/* Suggested actions after last AI message */}
            {!isLoading && suggestedActions.length > 0 && (
              <SuggestedActions
                actions={suggestedActions}
                onAction={handleSuggestedAction}
                disabled={isLoading}
              />
            )}

            {/* Error state */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={() => {
                    clearError()
                    retryLast()
                  }}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
