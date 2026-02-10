"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

const SUGGESTIONS = [
  "I need a venue for 100 people in May",
  "Corporate retreat for 2 days, 80 attendees",
  "Wedding reception, 200 guests, September",
  "Birthday party for 50 guests this summer",
]

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void
  disabled?: boolean
}

export function ChatSuggestions({ onSelect, disabled }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <MessageCircle className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">How can I help you plan?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tell me about your event, or try one of these:
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="h-auto w-full justify-start whitespace-normal rounded-xl px-3.5 py-2.5 text-left text-xs"
            disabled={disabled}
            onClick={() => onSelect(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}
