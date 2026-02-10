"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PublishChecklist } from "./PublishChecklist"
import type { VenuePublicPage } from "@/lib/types/public-page.types"

interface PublishButtonProps {
  readonly venueId: string
  readonly pageData: VenuePublicPage
  readonly isDirty: boolean
  readonly onPublishSuccess?: () => void
}

export function PublishButton(
  { venueId, pageData, isDirty, onPublishSuccess }: PublishButtonProps
) {
  const [showChecklist, setShowChecklist] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const { toast } = useToast()

  // Handle keyboard shortcut Ctrl+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault()
        handleClick()
      }
    }

    globalThis.addEventListener("keydown", handleKeyDown)
    return () => globalThis.removeEventListener("keydown", handleKeyDown)
  }, [pageData])

  const handleClick = () => {
    setShowChecklist(true)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/venues/${venueId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageData }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish")
      }

      toast({
        title: "Page Published",
        description: "Your venue page is now live!",
      })

      setShowChecklist(false)
      onPublishSuccess?.()
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const isPublished = pageData.venue.page_status === "published"
  
  const getButtonText = () => {
    if (isPublishing) {
      return "Publishing..."
    }
    if (isPublished && !isDirty) {
      return "✓ Published"
    }
    if (isDirty) {
      return "Publish Changes"
    }
    return "Publish"
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isPublishing}
        className="gap-2"
      >
        {isPublishing ? (
          <>
            <span className="animate-spin">⏳</span>
            {getButtonText()}
          </>
        ) : (
          getButtonText()
        )}
      </Button>

      {showChecklist && (
        <PublishChecklist
          pageData={pageData}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onCancel={() => setShowChecklist(false)}
        />
      )}
    </>
  )
}
