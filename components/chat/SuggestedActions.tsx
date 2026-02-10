"use client"

import { Button } from "@/components/ui/button"
import type { SuggestedAction } from "@/lib/types/conversation.types"

interface SuggestedActionsProps {
  actions: SuggestedAction[]
  onAction: (action: SuggestedAction) => void
  disabled?: boolean
}

export function SuggestedActions({ actions, onAction, disabled }: SuggestedActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {actions.map((action) => (
        <Button
          key={action.action}
          variant="outline"
          size="sm"
          className="h-auto whitespace-normal rounded-full px-3.5 py-1.5 text-xs"
          disabled={disabled}
          onClick={() => onAction(action)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}
