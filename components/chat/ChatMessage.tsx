"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn("max-w-[80%] space-y-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-muted text-foreground"
          )}
        >
          {content}
        </div>
        {timestamp && (
          <p
            className={cn(
              "px-1 text-[10px] text-muted-foreground",
              isUser && "text-right"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
