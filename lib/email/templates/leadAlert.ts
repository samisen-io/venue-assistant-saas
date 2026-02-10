/**
 * Email template for notifying venue manager about a new lead.
 */

export interface LeadAlertData {
  contactName: string | null
  contactEmail: string | null
  eventType: string | null
  eventDate: string | null
  guestCount: number | null
  estimatedBudget: number | null
  priorityScore: number
  source: string
  leadId: string
  venueName: string
  baseUrl: string
}

export function generateLeadAlertSubject(data: LeadAlertData): string {
  const name = data.contactName || "A prospect"
  return `New Lead: ${name} — ${data.eventType || "Event Inquiry"} at ${data.venueName}`
}

export function generateLeadAlertHTML(data: LeadAlertData): string {
  const priorityLabel =
    data.priorityScore >= 70
      ? "High Priority"
      : data.priorityScore >= 40
        ? "Medium Priority"
        : "Low Priority"
  const priorityColor =
    data.priorityScore >= 70
      ? "#dc2626"
      : data.priorityScore >= 40
        ? "#f59e0b"
        : "#22c55e"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead - ${data.venueName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; min-width: 130px; color: #6b7280; }
    .detail-value { color: #111827; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; color: white; background: ${priorityColor}; }
    .cta-btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 4px; }
    .footer { background: #f3f4f6; padding: 16px 24px; border-radius: 0 0 8px 8px; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 22px;">New Lead Received</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.venueName}</p>
  </div>
  <div class="content">
    <div style="margin-bottom: 16px;">
      <span class="priority-badge">${priorityLabel} (${data.priorityScore}/100)</span>
      <span style="margin-left: 8px; font-size: 13px; color: #6b7280;">via ${data.source === "ai_chat" ? "AI Chat" : data.source}</span>
    </div>

    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
      ${data.contactName ? `<div class="detail-row"><div class="detail-label">Name</div><div class="detail-value">${data.contactName}</div></div>` : ""}
      ${data.contactEmail ? `<div class="detail-row"><div class="detail-label">Email</div><div class="detail-value"><a href="mailto:${data.contactEmail}">${data.contactEmail}</a></div></div>` : ""}
      ${data.eventType ? `<div class="detail-row"><div class="detail-label">Event Type</div><div class="detail-value">${data.eventType}</div></div>` : ""}
      ${data.eventDate ? `<div class="detail-row"><div class="detail-label">Event Date</div><div class="detail-value">${data.eventDate}</div></div>` : ""}
      ${data.guestCount ? `<div class="detail-row"><div class="detail-label">Guest Count</div><div class="detail-value">${data.guestCount}</div></div>` : ""}
      ${data.estimatedBudget ? `<div class="detail-row"><div class="detail-label">Budget</div><div class="detail-value">$${data.estimatedBudget.toLocaleString()}</div></div>` : ""}
    </div>

    <div style="text-align: center;">
      <a href="${data.baseUrl}/leads/${data.leadId}" class="cta-btn">View Lead</a>
    </div>
  </div>
  <div class="footer">
    <p style="margin: 0;">Sent by VenueManager on behalf of ${data.venueName}.</p>
  </div>
</body>
</html>`.trim()
}
