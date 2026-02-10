"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ConversationTranscriptProps {
  messages: any[]
}

export function ConversationTranscript({ messages }: ConversationTranscriptProps) {
  const [expanded, setExpanded] = useState(false)

  if (!messages || messages.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        No conversation transcript available.
      </div>
    )
  }

  const displayMessages = expanded ? messages : messages.slice(0, 4)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Conversation ({messages.length} messages)
        </h3>
        {messages.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" /> Show all
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        {displayMessages.map((msg: any, i: number) => {
          const isUser = msg.role === "user"
          return (
            <div
              key={msg.id || i}
              className={cn(
                "flex gap-2 text-sm",
                isUser && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                  isUser
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2",
                  isUser ? "bg-blue-100 text-blue-900" : "bg-white"
                )}
              >
                <p className="whitespace-pre-wrap text-xs leading-relaxed">
                  {msg.content}
                </p>
                {msg.created_at && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
