export interface ProposalAcceptedEmailData {
  clientName: string
  venueName: string
  eventDate: string
  proposalReference: string
  leadId: string
}

export function generateProposalAcceptedEmailHTML(data: ProposalAcceptedEmailData): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.venuemanager.com"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal Accepted — ${data.venueName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f5f7fb; color:#111827; margin:0; padding:24px;">
  <div style="max-width:600px; margin:0 auto; background:white; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb;">
    <div style="padding:24px; background:#0f766e; color:white;">
      <h1 style="margin:0; font-size:22px;">🎉 Proposal Accepted!</h1>
      <p style="margin:8px 0 0 0; opacity:0.95;">${data.venueName}</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:18px; font-weight:600; color:#111827;">
        ${data.clientName} accepted your proposal
      </p>
      <p>Great news — your proposal <strong>${data.proposalReference}</strong> for <strong>${data.eventDate}</strong> has been accepted and digitally signed.</p>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:16px 0;">
        <p style="margin:0 0 6px 0;"><strong>Client:</strong> ${data.clientName}</p>
        <p style="margin:0 0 6px 0;"><strong>Reference:</strong> ${data.proposalReference}</p>
        <p style="margin:0;"><strong>Event Date:</strong> ${data.eventDate}</p>
      </div>
      <p>The lead has been automatically marked as <strong>Won</strong> in your dashboard.</p>
      <p style="margin-top:20px;">
        <a href="${appUrl}/leads/${data.leadId}" style="display:inline-block; background:#0f766e; color:white; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:500;">
          View Lead in Dashboard
        </a>
      </p>
      <p style="margin-top:24px; color:#6b7280; font-size:14px;">
        Next steps: reach out to ${data.clientName} to collect the deposit and confirm event details.
      </p>
    </div>
  </div>
</body>
</html>
`.trim()
}
