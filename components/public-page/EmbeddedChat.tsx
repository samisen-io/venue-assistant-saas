"use client"

import { ChatContainer } from "@/components/chat/ChatContainer"
import { Sparkles, Phone, Mail } from "lucide-react"

interface EmbeddedChatProps {
  slug: string
  greeting?: string | null
  preFilledDate?: string | null
  phone?: string | null
  email?: string | null
  hidePhone?: boolean
  hideEmail?: boolean
}

export function EmbeddedChat({
  slug,
  greeting,
  preFilledDate,
  phone,
  email,
  hidePhone,
  hideEmail,
}: EmbeddedChatProps) {
  const showPhone = !hidePhone && !!phone
  const showEmail = !hideEmail && !!email

  return (
    <section
      id="ai-chat"
      className="hidden overflow-hidden rounded-xl border shadow-sm lg:block"
    >
      {/* Header with contact icons */}
      <div className="border-b bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-200" />
            <div>
              <h2 className="text-sm font-semibold">AI Planning Assistant</h2>
              <p className="text-xs text-blue-100">Plan your perfect event</p>
            </div>
          </div>

          {(showPhone || showEmail) && (
            <div className="flex items-center gap-1">
              {showPhone && (
                <a
                  href={`tel:${phone}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-blue-500/50 hover:text-white"
                  aria-label="Call venue"
                  title="Call Us"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {showEmail && (
                <a
                  href={`mailto:${email}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-blue-500/50 hover:text-white"
                  aria-label="Email venue"
                  title="Email Us"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="h-[460px]">
        <ChatContainer
          slug={slug}
          greeting={greeting}
          preFilledDate={preFilledDate}
        />
      </div>
    </section>
  )
}
