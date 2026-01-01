import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Event, Vendor } from '@/lib/types'

export interface VendorOutreachTemplateData {
  event: Event
  vendor: Vendor
  venueName: string
  venueContact: {
    name: string
    email: string
    phone?: string
  }
  customMessage?: string
}

/**
 * Generate subject line for vendor outreach email
 */
export function generateOutreachSubject(data: VendorOutreachTemplateData): string {
  const { event, vendor } = data
  return `Quote Request: ${event.event_name} - ${formatDate(event.event_date)}`
}

/**
 * Generate HTML body for vendor outreach email
 */
export function generateOutreachHTML(data: VendorOutreachTemplateData): string {
  const { event, vendor, venueName, venueContact, customMessage } = data

  const eventDate = formatDate(event.event_date)
  const guestCount = event.guest_count || 'TBD'
  const budget = event.budget_total ? formatCurrency(event.budget_total) : 'Please quote'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request - ${event.event_name}</title>
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
      background-color: #2563eb;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .event-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      min-width: 140px;
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
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
    <h1 style="margin: 0; font-size: 24px;">Quote Request</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">from ${venueName}</p>
  </div>

  <div class="content">
    <p>Hello ${vendor.contact_name || vendor.name} Team,</p>

    <p>We're reaching out on behalf of <strong>${venueName}</strong> regarding an upcoming event that matches your expertise in <strong>${vendor.category}</strong> services.</p>

    ${customMessage ? `<p>${customMessage}</p>` : ''}

    <div class="event-details">
      <h2 style="margin-top: 0; color: #2563eb; font-size: 18px;">Event Details</h2>

      <div class="detail-row">
        <div class="detail-label">Event Name:</div>
        <div class="detail-value">${event.event_name}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Event Type:</div>
        <div class="detail-value">${event.event_type}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Date:</div>
        <div class="detail-value">${eventDate}</div>
      </div>

      ${event.event_time ? `
      <div class="detail-row">
        <div class="detail-label">Time:</div>
        <div class="detail-value">${event.event_time}</div>
      </div>
      ` : ''}

      <div class="detail-row">
        <div class="detail-label">Expected Guests:</div>
        <div class="detail-value">${guestCount}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Venue:</div>
        <div class="detail-value">${venueName}</div>
      </div>

      ${event.special_requirements ? `
      <div class="detail-row">
        <div class="detail-label">Special Requirements:</div>
        <div class="detail-value">${event.special_requirements}</div>
      </div>
      ` : ''}

      <div class="detail-row">
        <div class="detail-label">Budget Range:</div>
        <div class="detail-value">${budget}</div>
      </div>
    </div>

    <p><strong>We would appreciate a quote that includes:</strong></p>
    <ul>
      <li>Detailed pricing breakdown for your ${vendor.category} services</li>
      <li>Package options (if available)</li>
      <li>Availability confirmation for ${eventDate}</li>
      <li>Terms and conditions</li>
      <li>Timeline and payment schedule</li>
    </ul>

    <p>Please reply to this email with your quote and any questions you may have. We're looking forward to potentially working with you on this event!</p>

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
    <p style="margin: 0;">This is an automated message from VenueAssistant on behalf of ${venueName}.</p>
    <p style="margin: 10px 0 0 0;">Please reply directly to this email to provide your quote.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for vendor outreach email
 */
export function generateOutreachPlainText(data: VendorOutreachTemplateData): string {
  const { event, vendor, venueName, venueContact, customMessage } = data

  const eventDate = formatDate(event.event_date)
  const guestCount = event.guest_count || 'TBD'
  const budget = event.budget_total ? formatCurrency(event.budget_total) : 'Please quote'

  return `
QUOTE REQUEST from ${venueName}

Hello ${vendor.contact_name || vendor.name} Team,

We're reaching out on behalf of ${venueName} regarding an upcoming event that matches your expertise in ${vendor.category} services.

${customMessage ? customMessage + '\n' : ''}
EVENT DETAILS:
--------------
Event Name: ${event.event_name}
Event Type: ${event.event_type}
Date: ${eventDate}
${event.event_time ? `Time: ${event.event_time}\n` : ''}Expected Guests: ${guestCount}
Venue: ${venueName}
${event.special_requirements ? `Special Requirements: ${event.special_requirements}\n` : ''}Budget Range: ${budget}

WE WOULD APPRECIATE A QUOTE THAT INCLUDES:
- Detailed pricing breakdown for your ${vendor.category} services
- Package options (if available)
- Availability confirmation for ${eventDate}
- Terms and conditions
- Timeline and payment schedule

Please reply to this email with your quote and any questions you may have. We're looking forward to potentially working with you on this event!

Best regards,

${venueContact.name}
${venueName}
Email: ${venueContact.email}
${venueContact.phone ? `Phone: ${venueContact.phone}` : ''}

---
This is an automated message from VenueAssistant on behalf of ${venueName}.
Please reply directly to this email to provide your quote.
  `.trim()
}
