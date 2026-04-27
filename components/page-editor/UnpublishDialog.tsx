"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"

interface UnpublishDialogProps {
  venueId: string
  isPublished: boolean
  onUnpublishSuccess?: () => void
}

export function UnpublishDialog({
  venueId,
  isPublished,
  onUnpublishSuccess,
}: UnpublishDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUnpublish = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/venues/${venueId}/unpublish`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to unpublish")
      }

      toast({
        title: "Page Unpublished",
        description: "Your venue page is now offline.",
      })

      setOpen(false)
      onUnpublishSuccess?.()
    } catch (error) {
      toast({
        title: "Unpublish Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isPublished) return null

  return (
    <>
      <Button
        data-testid="unpublish-btn"
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Unpublish
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unpublish Page?</DialogTitle>
          </DialogHeader>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This will take your venue page offline. Visitors will see a "This page is not currently available" message.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnpublish}
              disabled={isLoading}
            >
              {isLoading ? "Unpublishing..." : "Unpublish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
