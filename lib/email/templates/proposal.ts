export interface ProposalEmailTemplateData {
  prospectName: string | null
  venueName: string
  referenceNumber: string
  totalEstimated: number | null
  validUntil: string | null
  pdfUrl: string
  acceptUrl?: string
  scheduleTourUrl?: string
}

export function generateProposalEmailSubject(data: ProposalEmailTemplateData): string {
  return `Your event proposal from ${data.venueName} (${data.referenceNumber})`
}

export function generateProposalEmailHTML(data: ProposalEmailTemplateData): string {
  const name = data.prospectName || "there"
  const total = typeof data.totalEstimated === "number" ? `$${data.totalEstimated.toLocaleString()}` : "Custom pricing"
  const acceptUrl = data.acceptUrl || data.pdfUrl
  const scheduleTourUrl = data.scheduleTourUrl || "#"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Proposal - ${data.venueName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f5f7fb; color:#111827; margin:0; padding:24px;">
  <div style="max-width:640px; margin:0 auto; background:white; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb;">
    <div style="padding:24px; background:#0f766e; color:white;">
      <h1 style="margin:0; font-size:22px;">Your Proposal is Ready</h1>
      <p style="margin:8px 0 0 0; opacity:0.95;">${data.venueName}</p>
    </div>
    <div style="padding:24px;">
      <p>Hi ${name},</p>
      <p>Thank you for considering ${data.venueName}. We've prepared your custom proposal.</p>
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin:16px 0;">
        <p style="margin:0 0 6px 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
        <p style="margin:0 0 6px 0;"><strong>Total Estimate:</strong> ${total}</p>
        <p style="margin:0;"><strong>Valid Until:</strong> ${data.validUntil || "N/A"}</p>
      </div>
      <p style="margin-bottom:20px;">View and download your full proposal using the link below:</p>
      <p><a href="${data.pdfUrl}" style="display:inline-block; background:#0f766e; color:white; text-decoration:none; padding:10px 16px; border-radius:8px;">Download Proposal PDF</a></p>
      <div style="margin-top:18px;">
        <a href="${acceptUrl}" style="display:inline-block; margin-right:8px; background:#111827; color:white; text-decoration:none; padding:9px 14px; border-radius:8px;">Accept Proposal</a>
        <a href="${scheduleTourUrl}" style="display:inline-block; background:white; border:1px solid #d1d5db; color:#111827; text-decoration:none; padding:9px 14px; border-radius:8px;">Schedule Tour</a>
      </div>
      <p style="margin-top:24px;">Reply to this email if you want us to adjust package details, add-ons, or timing.</p>
      <p>Best regards,<br><strong>${data.venueName}</strong></p>
    </div>
  </div>
</body>
</html>
`.trim()
}

