"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { cn } from "@/lib/utils"

interface ChatWidgetProps {
  slug: string
  venueName: string
  greeting?: string | null
  preFilledDate?: string | null
}

export function ChatWidget({
  slug,
  venueName,
  greeting,
  preFilledDate,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  const handleOpen = useCallback(() => {
    setOpen(true)
    setHasOpened(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  // Listen for hash navigation (#ai-chat) to open widget
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === "#ai-chat") {
        handleOpen()
        // Clear the hash so it can be triggered again
        history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    }
    onHashChange()
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [handleOpen])

  // Trap focus inside the chat panel when open (basic implementation)
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, handleClose])

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={handleOpen}
        aria-label="Open chat"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          open && "pointer-events-none scale-0 opacity-0",
          !open && "scale-100 opacity-100"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel - floating on desktop, full-screen on mobile */}
      <div
        role="dialog"
        aria-label={`Chat with ${venueName}`}
        aria-modal="true"
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl transition-all duration-300 ease-in-out",
          // Mobile: full screen
          "inset-0 md:inset-auto",
          // Desktop: floating panel bottom-right
          "md:bottom-5 md:right-5 md:h-[600px] md:w-[400px] md:rounded-2xl md:border",
          // Open/close animations
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-blue-600 px-4 py-3 text-white">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{venueName}</h3>
            <p className="text-xs text-blue-100">AI Planning Assistant</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-white hover:bg-blue-500/50 hover:text-white"
            onClick={handleClose}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat body - only mount ChatContainer after first open to avoid unnecessary API load */}
        {hasOpened && (
          <ChatContainer
            slug={slug}
            greeting={greeting}
            preFilledDate={preFilledDate}
          />
        )}
      </div>

      {/* Backdrop on mobile when chat is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  )
}
