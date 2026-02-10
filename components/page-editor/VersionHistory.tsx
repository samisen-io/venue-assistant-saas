"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loading } from "@/components/shared/Loading"
import { ErrorMessage } from "@/components/shared/ErrorMessage"
import { useToast } from "@/hooks/use-toast"
import { History, RotateCcw, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PageVersion {
  id: string
  published_at: string
  published_by: string
  version_number: number
}

interface VersionHistoryProps {
  readonly venueId: string
  readonly onVersionRestored?: () => void
}

export function VersionHistory({
  venueId,
  onVersionRestored,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<PageVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadVersions()
    }
  }, [open])

  const loadVersions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/venues/${venueId}/versions`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to load versions")
      }

      setVersions(result.versions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load versions")
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreClick = (versionId: string) => {
    setSelectedVersion(versionId)
    setShowConfirm(true)
  }

  const handleConfirmRestore = async () => {
    if (!selectedVersion) return

    setRestoring(true)
    try {
      const response = await fetch(
        `/api/venues/${venueId}/versions/${selectedVersion}/restore`,
        { method: "POST" }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to restore version")
      }

      toast({
        title: "Version Restored",
        description: "Your page has been restored to the selected version.",
      })

      setShowConfirm(false)
      setSelectedVersion(null)
      onVersionRestored?.()
      setOpen(false)
    } catch (err) {
      toast({
        title: "Restore Failed",
        description: err instanceof Error ? err.message : "Failed to restore version",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <Loading />
    }
    if (error) {
      return <ErrorMessage message={error} />
    }
    if (versions.length === 0) {
      return (
        <p className="text-center text-gray-500 py-8">
          No published versions yet. Publish your page to create a version.
        </p>
      )
    }
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="font-medium">
                Version {version.version_number}
              </div>
              <div className="text-sm text-gray-500">
                Published{" "}
                {formatDistanceToNow(new Date(version.published_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestoreClick(version.id)}
              disabled={restoring}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restore
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <History className="w-4 h-4" />
        Version History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {renderContent()}
          </div>

          {/* Restore Confirmation Dialog */}
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Restore Version?</DialogTitle>
              </DialogHeader>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This will replace your current page with the selected version. Your recent changes will be lost.
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirm(false)
                    setSelectedVersion(null)
                  }}
                  disabled={restoring}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRestore}
                  disabled={restoring}
                  className="gap-2"
                >
                  {restoring ? "Restoring..." : "Restore Version"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
