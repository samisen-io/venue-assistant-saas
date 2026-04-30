"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2 } from "lucide-react"

interface InquiryFormProps {
  slug: string
  showTitle?: boolean
  className?: string
}

export function InquiryForm({ slug, showTitle = true, className }: InquiryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      event_type: formData.get("event_type") || undefined,
      event_date: formData.get("event_date") || undefined,
      guest_count: formData.get("guest_count")
        ? Number(formData.get("guest_count"))
        : undefined,
      message: formData.get("message") || undefined,
      _hp: formData.get("_hp") || undefined,
    }

    try {
      const res = await fetch(`/api/venues/public/${slug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Submission failed")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
        <h3 className="text-lg font-semibold">Inquiry Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Thank you! We&apos;ll get back to you shortly.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className ?? "space-y-4 rounded-xl border p-6"}
    >
      {showTitle && <h3 className="text-lg font-semibold">Send an Inquiry</h3>}

      <div className="space-y-1.5">
        <Label htmlFor="inq-name">Name *</Label>
        <Input id="inq-name" name="name" required placeholder="Your name" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-email">Email *</Label>
        <Input id="inq-email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-phone">Phone</Label>
        <Input id="inq-phone" name="phone" type="tel" placeholder="(555) 123-4567" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inq-type">Event Type</Label>
          <Input id="inq-type" name="event_type" placeholder="e.g. Wedding" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inq-guests">Guests</Label>
          <Input id="inq-guests" name="guest_count" type="number" min="1" placeholder="100" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-date">Preferred Date</Label>
        <Input id="inq-date" name="event_date" type="date" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Message</Label>
        <textarea
          id="inq-message"
          name="message"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tell us about your event..."
        />
      </div>

      {/* Honeypot — hidden from humans, bots fill it in */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="inq-hp">Leave this empty</label>
        <input id="inq-hp" name="_hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Inquiry
      </Button>
    </form>
  )
}
