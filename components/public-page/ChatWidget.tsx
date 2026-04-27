"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageCircle, X, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { cn } from "@/lib/utils"

interface ChatWidgetProps {
  slug: string
  venueName: string
  greeting?: string | null
  preFilledDate?: string | null
  phone?: string | null
  email?: string | null
  hidePhone?: boolean
  hideEmail?: boolean
}

export function ChatWidget({
  slug,
  venueName,
  greeting,
  preFilledDate,
  phone,
  email,
  hidePhone,
  hideEmail,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  const showPhone = !hidePhone && !!phone
  const showEmail = !hideEmail && !!email

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

  // Close on Escape key
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
      {/* Floating chat button — mobile only */}
      <button
        data-testid="ai-chat-bubble"
        onClick={handleOpen}
        aria-label="Open chat"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:hidden",
          open && "pointer-events-none scale-0 opacity-0",
          !open && "scale-100 opacity-100"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel — full-screen on mobile only */}
      <div
        role="dialog"
        aria-label={`Chat with ${venueName}`}
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background shadow-2xl transition-all duration-300 ease-in-out lg:hidden",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="border-b bg-blue-600 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{venueName}</h3>
              <p className="text-xs text-blue-100">AI Planning Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              {showPhone && (
                <a
                  href={`tel:${phone}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-blue-500/50 hover:text-white"
                  aria-label="Call venue"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {showEmail && (
                <a
                  href={`mailto:${email}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-blue-500/50 hover:text-white"
                  aria-label="Email venue"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
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
          </div>
        </div>

        {/* Chat body — only mount after first open to avoid unnecessary API load */}
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
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  )
}
