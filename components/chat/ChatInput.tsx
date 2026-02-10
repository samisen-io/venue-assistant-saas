"use client"

import { useCallback, useRef, KeyboardEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Describe your event in your own words...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      const el = textareaRef.current
      if (!el) return
      const value = el.value.trim()
      if (!value || disabled) return
      onSend(value)
      el.value = ""
      el.style.height = "auto"
    },
    [onSend, disabled]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t bg-background p-3"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm leading-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        onInput={adjustHeight}
        onKeyDown={handleKeyDown}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled}
        className="h-10 w-10 shrink-0 rounded-xl"
      >
        <SendHorizontal className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}
