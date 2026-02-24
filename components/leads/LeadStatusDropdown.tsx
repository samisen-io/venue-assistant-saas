"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

interface LeadStatusDropdownProps {
  currentStatus: string
  onStatusChange: (status: string, lostReason?: string) => void
  disabled?: boolean
}

export function LeadStatusDropdown({
  currentStatus,
  onStatusChange,
  disabled,
}: LeadStatusDropdownProps) {
  const [showLostReason, setShowLostReason] = useState(false)
  const [lostReason, setLostReason] = useState("")

  const handleChange = (value: string) => {
    if (value === "lost") {
      setShowLostReason(true)
      return
    }
    setShowLostReason(false)
    onStatusChange(value)
  }

  const handleLostConfirm = () => {
    onStatusChange("lost", lostReason)
    setShowLostReason(false)
    setLostReason("")
  }

  return (
    <div className="space-y-2">
      <Select value={currentStatus} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger data-testid="lead-status-dropdown" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showLostReason && (
        <div className="space-y-2 rounded-lg border bg-red-50 p-3">
          <Label htmlFor="lost-reason" className="text-sm">
            Reason for losing this lead
          </Label>
          <Input
            id="lost-reason"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="e.g. Chose another venue, budget too high"
          />
          <div className="flex gap-2">
            <button
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              onClick={handleLostConfirm}
            >
              Mark as Lost
            </button>
            <button
              className="rounded px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              onClick={() => setShowLostReason(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
