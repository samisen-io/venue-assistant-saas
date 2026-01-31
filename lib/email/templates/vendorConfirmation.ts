import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Event, Vendor } from '@/lib/types'

export interface VendorConfirmationTemplateData {
  event: Event
  vendor: Vendor
  venueName: string
  venueContact: {
    name: string
    email: string
    phone?: string
  }
  quotedCost?: number
  serviceName?: string
  customMessage?: string
}

/**
 * Generate subject line for vendor confirmation email
 */
export function generateConfirmationSubject(data: VendorConfirmationTemplateData): string {
  const { event } = data
  return `Booking Confirmed: ${event.event_name} - ${formatDate(event.event_date)}`
}

/**
 * Generate HTML body for vendor confirmation email
 */
export function generateConfirmationHTML(data: VendorConfirmationTemplateData): string {
  const { event, vendor, venueName, venueContact, quotedCost, serviceName, customMessage } = data

  const eventDate = formatDate(event.event_date)
  const guestCount = event.guest_count || 'TBD'
  const formattedCost = quotedCost ? formatCurrency(quotedCost) : 'As quoted'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${event.event_name}</title>
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
      background-color: #16a34a;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .checkmark {
      font-size: 48px;
      margin-bottom: 10px;
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
      border-left: 4px solid #16a34a;
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
    .confirmation-box {
      background-color: #dcfce7;
      border: 1px solid #16a34a;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .next-steps {
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
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
    <div class="checkmark">&#10003;</div>
    <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${venueName}</p>
  </div>

  <div class="content">
    <p>Hello ${vendor.contact_name || vendor.name} Team,</p>

    <p>Great news! We're pleased to confirm your services for the following event:</p>

    <div class="confirmation-box">
      <h2 style="margin: 0 0 10px 0; color: #16a34a;">You're Booked!</h2>
      <p style="margin: 0; font-size: 18px;"><strong>${event.event_name}</strong></p>
      <p style="margin: 5px 0 0 0; color: #6b7280;">${eventDate}</p>
    </div>

    ${customMessage ? `<p>${customMessage}</p>` : ''}

    <div class="event-details">
      <h2 style="margin-top: 0; color: #16a34a; font-size: 18px;">Event Details</h2>

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

      ${serviceName ? `
      <div class="detail-row">
        <div class="detail-label">Your Service:</div>
        <div class="detail-value">${serviceName}</div>
      </div>
      ` : ''}

      <div class="detail-row">
        <div class="detail-label">Confirmed Rate:</div>
        <div class="detail-value"><strong>${formattedCost}</strong></div>
      </div>
    </div>

    <div class="next-steps">
      <h3 style="margin-top: 0; color: #b45309;">Next Steps</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Please acknowledge receipt of this confirmation</li>
        <li>Send any contracts or agreements that require signature</li>
        <li>Coordinate any site visits or setup requirements</li>
        <li>Keep us updated on your preparation timeline</li>
      </ul>
    </div>

    <p>We're excited to work with you on this event! Please don't hesitate to reach out if you have any questions or need additional information.</p>

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
    <p style="margin: 0;">This is an automated confirmation from VenueManager on behalf of ${venueName}.</p>
    <p style="margin: 10px 0 0 0;">Please reply directly to this email for any questions or concerns.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for vendor confirmation email
 */
export function generateConfirmationPlainText(data: VendorConfirmationTemplateData): string {
  const { event, vendor, venueName, venueContact, quotedCost, serviceName, customMessage } = data

  const eventDate = formatDate(event.event_date)
  const guestCount = event.guest_count || 'TBD'
  const formattedCost = quotedCost ? formatCurrency(quotedCost) : 'As quoted'

  return `
BOOKING CONFIRMED - ${venueName}

Hello ${vendor.contact_name || vendor.name} Team,

Great news! We're pleased to confirm your services for the following event:

*** YOU'RE BOOKED! ***
${event.event_name}
${eventDate}

${customMessage ? customMessage + '\n' : ''}
EVENT DETAILS:
--------------
Event Name: ${event.event_name}
Event Type: ${event.event_type}
Date: ${eventDate}
${event.event_time ? `Time: ${event.event_time}\n` : ''}Expected Guests: ${guestCount}
Venue: ${venueName}
${serviceName ? `Your Service: ${serviceName}\n` : ''}Confirmed Rate: ${formattedCost}

NEXT STEPS:
-----------
- Please acknowledge receipt of this confirmation
- Send any contracts or agreements that require signature
- Coordinate any site visits or setup requirements
- Keep us updated on your preparation timeline

We're excited to work with you on this event! Please don't hesitate to reach out if you have any questions or need additional information.

Best regards,

${venueContact.name}
${venueName}
Email: ${venueContact.email}
${venueContact.phone ? `Phone: ${venueContact.phone}` : ''}

---
This is an automated confirmation from VenueManager on behalf of ${venueName}.
Please reply directly to this email for any questions or concerns.
  `.trim()
}
