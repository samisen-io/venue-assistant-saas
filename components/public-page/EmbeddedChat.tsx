"use client"

import { ChatContainer } from "@/components/chat/ChatContainer"

interface EmbeddedChatProps {
  slug: string
  greeting?: string | null
  preFilledDate?: string | null
}

export function EmbeddedChat({ slug, greeting, preFilledDate }: EmbeddedChatProps) {
  return (
    <section id="ai-chat" className="overflow-hidden rounded-xl border">
      <div className="border-b bg-blue-600 px-4 py-3 text-white">
        <h2 className="text-sm font-semibold">Start Planning</h2>
        <p className="text-xs text-blue-100">AI Planning Assistant</p>
      </div>
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
