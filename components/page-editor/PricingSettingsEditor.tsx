"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Database } from "@/lib/types/database.types"

type AISettings = Database["public"]["Tables"]["venue_ai_settings"]["Row"] | null

export function PricingSettingsEditor({
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
    greeting_message: "",
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
        <CardTitle>Pricing Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded border p-3">
          <Label>Show pricing in AI chat</Label>
          <Switch checked={Boolean(value.show_pricing_in_chat)} onCheckedChange={(v) => patch({ show_pricing_in_chat: v })} />
        </div>
        <div className="flex items-center justify-between rounded border p-3">
          <Label>Require manager approval for quotes</Label>
          <Switch checked={Boolean(value.require_manager_approval_for_quotes)} onCheckedChange={(v) => patch({ require_manager_approval_for_quotes: v })} />
        </div>
      </CardContent>
    </Card>
  )
}
