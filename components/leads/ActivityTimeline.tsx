"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  StickyNote,
  UserCheck,
} from "lucide-react"
import { useAddActivity } from "@/hooks/useLeads"

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  created: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
  email_sent: <Mail className="h-3.5 w-3.5 text-blue-600" />,
  call_completed: <Phone className="h-3.5 w-3.5 text-purple-600" />,
  call_scheduled: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  note_added: <StickyNote className="h-3.5 w-3.5 text-gray-600" />,
  status_changed: <UserCheck className="h-3.5 w-3.5 text-indigo-600" />,
  proposal_sent: <MessageSquare className="h-3.5 w-3.5 text-teal-600" />,
  assigned: <UserCheck className="h-3.5 w-3.5 text-orange-600" />,
}

interface ActivityTimelineProps {
  activities: any[]
  leadId: string
  onActivityAdded?: () => void
}

export function ActivityTimeline({
  activities,
  leadId,
  onActivityAdded,
}: ActivityTimelineProps) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState("note_added")
  const [description, setDescription] = useState("")
  const { addActivity } = useAddActivity()

  const handleSubmit = async () => {
    if (!description.trim()) return
    await addActivity(leadId, type, description.trim())
    setDescription("")
    setShowForm(false)
    onActivityAdded?.()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>

      {showForm && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note_added">Note</SelectItem>
              <SelectItem value="call_completed">Call Completed</SelectItem>
              <SelectItem value="call_scheduled">Call Scheduled</SelectItem>
              <SelectItem value="email_sent">Email Sent</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the activity..."
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handleSubmit}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="space-y-0">
          {activities.map((a: any, i: number) => (
            <div key={a.id || i} className="flex gap-3 py-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                {ACTIVITY_ICONS[a.activity_type] || (
                  <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs">{a.description}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(a.created_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
