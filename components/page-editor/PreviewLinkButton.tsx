"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loading } from "@/components/shared/Loading"
import { useToast } from "@/hooks/use-toast"
import { Eye, Copy, Check, AlertCircle } from "lucide-react"

interface PreviewLinkButtonProps {
  venueId: string
  venueSlug?: string
}

export function PreviewLinkButton({ venueId, venueSlug }: PreviewLinkButtonProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleOpenClick = async () => {
    setOpen(true)
    if (!previewUrl) {
      setLoading(true)
      try {
        const response = await fetch(`/api/venues/${venueId}/preview-token`, {
          method: "POST",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate preview link")
        }

        setPreviewUrl(result.previewUrl)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate preview link",
          variant: "destructive",
        })
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCopy = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Preview link copied to clipboard",
      })
    }
  }

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank")
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenClick}
        disabled={!venueSlug}
        title={!venueSlug ? "Save venue slug first" : "Get shareable preview link"}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Preview Link
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Your Venue Page</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <Loading />
            ) : (
              <>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    This preview link is valid for 24 hours. Share it to get feedback on your page before publishing.
                  </AlertDescription>
                </Alert>

                {previewUrl && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-3 rounded border border-gray-300 break-all text-sm font-mono">
                      {previewUrl}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleOpenInNewTab}
                        className="flex-1 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Open Preview
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="flex-1 gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
