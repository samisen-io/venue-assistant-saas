import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Event, Vendor } from '@/lib/types'

export interface FollowUpTemplateData {
  event: Event
  vendor: Vendor
  venueName: string
  venueContact: {
    name: string
    email: string
    phone?: string
  }
  daysSinceInitial: number
  originalSubject: string
  customMessage?: string
  urgency?: 'low' | 'medium' | 'high'
}

/**
 * Generate subject line for follow-up email
 */
export function generateFollowUpSubject(data: FollowUpTemplateData): string {
  const { originalSubject, urgency } = data

  if (urgency === 'high') {
    return `URGENT: ${originalSubject}`
  }

  return `Re: ${originalSubject}`
}

/**
 * Generate HTML body for follow-up email
 */
export function generateFollowUpHTML(data: FollowUpTemplateData): string {
  const { event, vendor, venueName, venueContact, daysSinceInitial, customMessage, urgency } = data
  const vendorServices = ((vendor as any).vendor_services || [])
    .map((service: any) => service.event_services?.name)
    .filter(Boolean)
    .join(', ') || 'their services'

  const eventDate = formatDate(event.event_date)
  const daysUntilEvent = Math.ceil(
    (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const urgencyColor = urgency === 'high' ? '#dc2626' : urgency === 'medium' ? '#ea580c' : '#2563eb'
  const urgencyText = urgency === 'high' ? 'Time-Sensitive' : urgency === 'medium' ? 'Follow-Up' : 'Friendly Reminder'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-Up: ${event.event_name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: ${urgencyColor};
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .urgency-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.3);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .highlight-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .event-summary {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e5e7eb;
    }
    .detail-row {
      display: flex;
      padding: 6px 0;
    }
    .detail-label {
      font-weight: 600;
      min-width: 100px;
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value {
      color: #111827;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background-color: ${urgencyColor};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      font-size: 14px;
      color: #6b7280;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="urgency-badge">${urgencyText.toUpperCase()}</div>
    <h1 style="margin: 0; font-size: 24px;">Quote Request Follow-Up</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${event.event_name}</p>
  </div>

  <div class="content">
    <p>Hello ${vendor.contact_name || vendor.name} Team,</p>

    <p>We reached out ${daysSinceInitial} ${daysSinceInitial === 1 ? 'day' : 'days'} ago regarding a quote for <strong>${event.event_name}</strong> and wanted to follow up to see if you had a chance to review our request.</p>

    ${customMessage ? `<p>${customMessage}</p>` : ''}

    ${daysUntilEvent <= 14 ? `
    <div class="highlight-box">
      <strong>⏰ Time-Sensitive:</strong> This event is <strong>${daysUntilEvent} ${daysUntilEvent === 1 ? 'day' : 'days'}</strong> away. We're finalizing our vendor selections and would love to include you if you're available.
    </div>
    ` : ''}

    <div class="event-summary">
      <h3 style="margin-top: 0; font-size: 16px; color: #111827;">Quick Recap</h3>

      <div class="detail-row">
        <div class="detail-label">Event:</div>
        <div class="detail-value">${event.event_name}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Date:</div>
        <div class="detail-value">${eventDate} (${daysUntilEvent} days away)</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Service Needed:</div>
        <div class="detail-value">${vendorServices}</div>
      </div>

      ${event.guest_count ? `
      <div class="detail-row">
        <div class="detail-label">Guest Count:</div>
        <div class="detail-value">${event.guest_count}</div>
      </div>
      ` : ''}
    </div>

    <p><strong>We understand you may be busy</strong>, but we'd really appreciate hearing from you at your earliest convenience. Even if you're unavailable or unable to provide a quote at this time, please let us know so we can plan accordingly.</p>

    <p><strong>What we need from you:</strong></p>
    <ul>
      <li>Confirmation of your availability for ${eventDate}</li>
      <li>Quote for ${vendorServices} services</li>
      <li>Any questions you may have about the event</li>
    </ul>

    <p>Please reply to this email or contact us directly. We're hoping to finalize our vendor lineup soon and would love to work with you!</p>

    <div class="signature">
      <p style="margin: 0;"><strong>${venueContact.name}</strong></p>
      <p style="margin: 5px 0;">${venueName}</p>
      <p style="margin: 5px 0; color: #6b7280;">
        Email: <a href="mailto:${venueContact.email}">${venueContact.email}</a>
        ${venueContact.phone ? `<br>Phone: ${venueContact.phone}` : ''}
      </p>
    </div>
  </div>

  <div class="footer">
    <p style="margin: 0;">This is an automated follow-up from VenueAssistant on behalf of ${venueName}.</p>
    <p style="margin: 10px 0 0 0;">Reply directly to this email to connect with ${venueContact.name}.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for follow-up email
 */
export function generateFollowUpPlainText(data: FollowUpTemplateData): string {
  const { event, vendor, venueName, venueContact, daysSinceInitial, customMessage } = data
  const vendorServices = ((vendor as any).vendor_services || [])
    .map((service: any) => service.event_services?.name)
    .filter(Boolean)
    .join(', ') || 'their services'

  const eventDate = formatDate(event.event_date)
  const daysUntilEvent = Math.ceil(
    (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return `
FOLLOW-UP: Quote Request for ${event.event_name}

Hello ${vendor.contact_name || vendor.name} Team,

We reached out ${daysSinceInitial} ${daysSinceInitial === 1 ? 'day' : 'days'} ago regarding a quote for ${event.event_name} and wanted to follow up to see if you had a chance to review our request.

${customMessage ? customMessage + '\n' : ''}
${daysUntilEvent <= 14 ? `
⏰ TIME-SENSITIVE: This event is ${daysUntilEvent} ${daysUntilEvent === 1 ? 'day' : 'days'} away. We're finalizing our vendor selections and would love to include you if you're available.
` : ''}
QUICK RECAP:
-----------
Event: ${event.event_name}
Date: ${eventDate} (${daysUntilEvent} days away)
Service Needed: ${vendorServices}
${event.guest_count ? `Guest Count: ${event.guest_count}\n` : ''}
We understand you may be busy, but we'd really appreciate hearing from you at your earliest convenience. Even if you're unavailable or unable to provide a quote at this time, please let us know so we can plan accordingly.

WHAT WE NEED FROM YOU:
- Confirmation of your availability for ${eventDate}
- Quote for ${vendorServices} services
- Any questions you may have about the event

Please reply to this email or contact us directly. We're hoping to finalize our vendor lineup soon and would love to work with you!

Best regards,

${venueContact.name}
${venueName}
Email: ${venueContact.email}
${venueContact.phone ? `Phone: ${venueContact.phone}` : ''}

---
This is an automated follow-up from VenueAssistant on behalf of ${venueName}.
Reply directly to this email to connect with ${venueContact.name}.
  `.trim()
}
