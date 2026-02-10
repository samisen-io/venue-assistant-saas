"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"
import type { VenuePublicPage } from "@/lib/types/public-page.types"

interface PublishChecklistProps {
  readonly pageData: VenuePublicPage
  readonly isPublishing: boolean
  readonly onPublish: () => void
  readonly onCancel: () => void
}

interface ValidationItem {
  id: string
  label: string
  required: boolean
  passed: boolean
  message?: string
}

export function PublishChecklist(
  { pageData, isPublishing, onPublish, onCancel }: PublishChecklistProps
) {
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false)

  // Validation checks
  const validationItems: ValidationItem[] = [
    {
      id: "hero_image",
      label: "Hero image uploaded",
      required: true,
      passed: !!pageData.venue.hero_image_url,
    },
    {
      id: "gallery_photos",
      label: "At least 5 gallery photos",
      required: true,
      passed: pageData.photos.length >= 5,
      message: `Current: ${pageData.photos.length} photos`,
    },
    {
      id: "spaces",
      label: "At least 1 space defined",
      required: true,
      passed: pageData.spaces.length >= 1,
      message: `Current: ${pageData.spaces.length} space(s)`,
    },
    {
      id: "amenities",
      label: "Amenities configured",
      required: true,
      passed: pageData.amenities.length > 0,
      message: `Current: ${pageData.amenities.length} amenity(ies)`,
    },
    {
      id: "ai_settings",
      label: "AI chat settings configured",
      required: true,
      passed: !!pageData.aiSettings,
    },
    {
      id: "seo_description",
      label: "SEO description added",
      required: false,
      passed: !!pageData.venue.seo_description,
      message: pageData.venue.seo_description ? "✓ Added" : "⚠️ Will use auto-generated description",
    },
    {
      id: "pricing_packages",
      label: "Pricing packages added",
      required: false,
      passed: pageData.packages.length > 0,
      message: pageData.packages.length > 0
        ? `✓ ${pageData.packages.length} package(s)`
        : "⚠️ Visitors can still inquire via chat",
    },
  ]

  const requiredItems = validationItems.filter((item) => item.required)
  const warningItems = validationItems.filter((item) => !item.required)

  const allRequiredPassed = requiredItems.every((item) => item.passed)
  const hasWarnings = warningItems.some((item) => !item.passed)

  const canPublish = allRequiredPassed && (!hasWarnings || acknowledgeWarnings)

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Checklist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Required Items */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Required</h3>
            <div className="space-y-2">
              {requiredItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={item.passed ? "text-gray-900" : "text-red-900"}>
                      {item.label}
                    </p>
                    {item.message && (
                      <p className="text-sm text-gray-500">{item.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Items */}
          {warningItems.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-700">Recommendations</h3>
              <div className="space-y-2">
                {warningItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{item.label}</p>
                      {item.message && (
                        <p className="text-sm text-gray-500">{item.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Check Failed */}
          {!allRequiredPassed && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Please complete all required items before publishing.
              </AlertDescription>
            </Alert>
          )}

          {/* Warning Acknowledgement */}
          {hasWarnings && allRequiredPassed && (
            <div className="space-y-3">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Some recommendations are incomplete. You can still publish, but we suggest adding these for better results.
                </AlertDescription>
              </Alert>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgeWarnings}
                  onChange={(e) => setAcknowledgeWarnings(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand and want to publish anyway
                </span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            onClick={onPublish}
            disabled={!canPublish || isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
