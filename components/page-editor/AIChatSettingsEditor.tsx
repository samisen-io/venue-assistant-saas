"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Database } from "@/lib/types/database.types"

type AISettings = Database["public"]["Tables"]["venue_ai_settings"]["Row"] | null

export function AIChatSettingsEditor({
  settings,
  onChange,
}: {
  settings: AISettings
  onChange: (next: AISettings) => void
}) {
  const value = settings || {
    id: "temp",
    venue_id: "",
    tone: "friendly",
    custom_tone_description: null,
    response_length: "balanced",
    greeting_message: "Hi! I'm here to help you plan your event.",
    after_hours_message: null,
    business_hours_start: null,
    business_hours_end: null,
    business_days: [1, 2, 3, 4, 5],
    suggest_alternative_dates: true,
    upsell_addons: false,
    mention_promotions: false,
    request_contact_after_messages: 3,
    auto_send_proposal: false,
    escalate_capacity_threshold: 20,
    escalate_min_days_away: 14,
    escalate_on_budget_concerns: true,
    escalate_on_complex_questions: true,
    escalate_on_negative_sentiment: true,
    escalate_after_messages: 10,
    show_pricing_in_chat: true,
    require_manager_approval_for_quotes: false,
    manager_name: null,
    manager_email: null,
    ai_pricing_rules: null,
    created_at: null,
    updated_at: null,
  }

  const patch = (updates: Partial<typeof value>) => onChange({ ...value, ...updates })

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Chat Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={value.tone || "friendly"} onValueChange={(v) => patch({ tone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Response length</Label>
            <Select value={value.response_length || "balanced"} onValueChange={(v) => patch({ response_length: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea value={value.greeting_message || ""} onChange={(e) => patch({ greeting_message: e.target.value.slice(0, 200) })} />
        <Textarea value={value.after_hours_message || ""} onChange={(e) => patch({ after_hours_message: e.target.value })} placeholder="After-hours message" />

        <div className="grid gap-3 md:grid-cols-2">
          <Input type="time" value={value.business_hours_start || ""} onChange={(e) => patch({ business_hours_start: e.target.value || null })} />
          <Input type="time" value={value.business_hours_end || ""} onChange={(e) => patch({ business_hours_end: e.target.value || null })} />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <label className="flex items-center justify-between rounded border p-3">
            <span className="text-sm">Suggest alternative dates</span>
            <Switch checked={Boolean(value.suggest_alternative_dates)} onCheckedChange={(v) => patch({ suggest_alternative_dates: v })} />
          </label>
          <label className="flex items-center justify-between rounded border p-3">
            <span className="text-sm">Upsell add-ons</span>
            <Switch checked={Boolean(value.upsell_addons)} onCheckedChange={(v) => patch({ upsell_addons: v })} />
          </label>
          <label className="flex items-center justify-between rounded border p-3">
            <span className="text-sm">Auto send proposal</span>
            <Switch checked={Boolean(value.auto_send_proposal)} onCheckedChange={(v) => patch({ auto_send_proposal: v })} />
          </label>
          <label className="flex items-center justify-between rounded border p-3">
            <span className="text-sm">Escalate on budget concerns</span>
            <Switch checked={Boolean(value.escalate_on_budget_concerns)} onCheckedChange={(v) => patch({ escalate_on_budget_concerns: v })} />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input type="number" value={value.request_contact_after_messages ?? 3} onChange={(e) => patch({ request_contact_after_messages: Number(e.target.value) })} placeholder="Contact after X msgs" />
          <Input type="number" value={value.escalate_after_messages ?? 10} onChange={(e) => patch({ escalate_after_messages: Number(e.target.value) })} placeholder="Escalate after X msgs" />
          <Input value={value.manager_name || ""} onChange={(e) => patch({ manager_name: e.target.value })} placeholder="Manager name" />
          <Input value={value.manager_email || ""} onChange={(e) => patch({ manager_email: e.target.value })} placeholder="Manager email" />
        </div>
      </CardContent>
    </Card>
  )
}
