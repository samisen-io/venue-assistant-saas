import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import type { Database } from "@/lib/types/database.types"
import { createAdminClient } from "@/lib/supabase/admin"

type Proposal = Database["public"]["Tables"]["proposals"]["Row"]
type Venue = Database["public"]["Tables"]["venues"]["Row"]
type Space = Database["public"]["Tables"]["spaces"]["Row"]

function textLines(
  page: import("pdf-lib").PDFPage,
  lines: string[],
  startY: number,
  size = 11
) {
  let y = startY
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size })
    y -= size + 6
  }
}

export async function generateProposalPDF(
  proposal: Proposal,
  venue: Venue,
  spaces: Space[] = []
): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const page1 = pdf.addPage([612, 792])
  page1.setFont(font)
  page1.drawText(venue.name || "Venue Proposal", {
    x: 50,
    y: 740,
    size: 26,
    font: bold,
    color: rgb(0.1, 0.2, 0.45),
  })
  page1.drawText(`Proposal #${proposal.reference_number}`, { x: 50, y: 710, size: 12 })
  page1.drawText(`Valid until: ${proposal.valid_until ?? "N/A"}`, { x: 50, y: 692, size: 12 })
  page1.drawText(`Created: ${(proposal.created_at ?? "").slice(0, 10)}`, {
    x: 50,
    y: 674,
    size: 12,
  })

  const summary = (proposal.event_summary as Record<string, unknown> | null) ?? {}
  textLines(
    page1,
    [
      "Event Summary",
      `Contact: ${String(summary.contact_name ?? "N/A")}`,
      `Email: ${String(summary.contact_email ?? "N/A")}`,
      `Event type: ${String(summary.event_type ?? "N/A")}`,
      `Event date: ${String(summary.event_date ?? "TBD")}`,
      `Guests: ${String(summary.guest_count ?? "TBD")}`,
    ],
    620,
    12
  )

  const pricing = (proposal.pricing_breakdown as Record<string, unknown> | null) ?? {}
  const lineItems = Array.isArray(pricing.lineItems)
    ? (pricing.lineItems as Array<Record<string, unknown>>)
    : []
  page1.drawText("Pricing Breakdown", { x: 50, y: 500, size: 14, font: bold })
  let y = 475
  for (const lineItem of lineItems.slice(0, 12)) {
    const label = String(lineItem.label ?? "Item")
    const amount = Number(lineItem.amount ?? 0).toFixed(2)
    page1.drawText(`${label}`, { x: 50, y, size: 11 })
    page1.drawText(`$${amount}`, { x: 500, y, size: 11 })
    y -= 16
  }
  page1.drawText(`Subtotal: $${Number(pricing.subtotal ?? 0).toFixed(2)}`, { x: 50, y: 250, size: 12 })
  page1.drawText(`Tax: $${Number(pricing.taxes ?? 0).toFixed(2)}`, { x: 50, y: 232, size: 12 })
  page1.drawText(`Total: $${Number(proposal.total_estimated ?? 0).toFixed(2)}`, {
    x: 50,
    y: 214,
    size: 13,
    font: bold,
  })
  page1.drawText(`Deposit due: $${Number(proposal.deposit_amount ?? 0).toFixed(2)}`, {
    x: 50,
    y: 196,
    size: 12,
  })

  const page2 = pdf.addPage([612, 792])
  page2.setFont(font)
  page2.drawText("Venue Details & Spaces", { x: 50, y: 740, size: 18, font: bold })
  if (!spaces.length) {
    page2.drawText("No space details available.", { x: 50, y: 710, size: 12 })
  } else {
    let sy = 710
    for (const space of spaces.slice(0, 10)) {
      page2.drawText(`- ${space.name} (Capacity: ${space.capacity ?? "N/A"})`, {
        x: 50,
        y: sy,
        size: 12,
      })
      sy -= 18
      if (sy < 90) break
    }
  }
  page2.drawText("Terms & Next Steps", { x: 50, y: 300, size: 16, font: bold })
  textLines(
    page2,
    [
      String(proposal.terms_and_policies ?? "Standard terms apply."),
      "",
      "Next steps:",
      "1. Review the proposal",
      "2. Confirm desired package/add-ons",
      "3. Submit deposit to reserve your date",
    ],
    270,
    11
  )

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

export async function uploadProposalPdf(
  proposalId: string,
  venueId: string,
  buffer: Buffer
): Promise<string> {
  const admin = createAdminClient()
  const path = `${venueId}/${proposalId}-${Date.now()}.pdf`

  const { error: uploadError } = await admin.storage
    .from("proposals")
    .upload(path, buffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload proposal PDF")
  }

  const { data } = admin.storage.from("proposals").getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error("Failed to generate proposal PDF public URL")
  }
  return data.publicUrl
}

