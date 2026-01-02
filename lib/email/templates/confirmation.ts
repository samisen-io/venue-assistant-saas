import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Event, Vendor } from '@/lib/types'

export interface ConfirmationTemplateData {
  event: Event
  vendor: Vendor
  venueName: string
  venueContact: {
    name: string
    email: string
    phone?: string
  }
  quotedCost?: number
  quoteDetails?: {
    breakdown?: string
    terms?: string
    paymentSchedule?: string
  }
  nextSteps?: string[]
  customMessage?: string
}

/**
 * Generate subject line for confirmation email
 */
export function generateConfirmationSubject(data: ConfirmationTemplateData): string {
  const { event, vendor } = data
  const vendorServices = ((vendor as any).vendor_services || [])
    .map((service: any) => service.event_services?.name)
    .filter(Boolean)
    .join(', ') || 'Services'
  return `Confirmed: ${vendorServices} for ${event.event_name}`
}

/**
 * Generate HTML body for confirmation email
 */
export function generateConfirmationHTML(data: ConfirmationTemplateData): string {
  const { event, vendor, venueName, venueContact, quotedCost, quoteDetails, nextSteps, customMessage } = data
  const vendorServices = ((vendor as any).vendor_services || [])
    .map((service: any) => service.event_services?.name)
    .filter(Boolean)
    .join(', ') || 'their services'

  const eventDate = formatDate(event.event_date)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Confirmed - ${event.event_name}</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .checkmark {
      width: 60px;
      height: 60px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      font-size: 36px;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .event-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e5e7eb;
    }
    .detail-row {
      display: flex;
      padding: 10px 0;
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
    .quote-section {
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .next-steps {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #e5e7eb;
    }
    .next-steps ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 10px 0;
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
    .important-notice {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="checkmark">✓</div>
    <h1 style="margin: 0; font-size: 28px;">Service Confirmed!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${event.event_name}</p>
  </div>

  <div class="content">
    <p>Hello ${vendor.contact_name || vendor.name} Team,</p>

    <div class="success-box">
      <strong>🎉 Great news!</strong> We're excited to confirm that we've selected your ${vendorServices} services for our upcoming event.
    </div>

    <p>Thank you for your quote and availability. We're looking forward to working with you to make this event a success!</p>

    ${customMessage ? `<p>${customMessage}</p>` : ''}

    <div class="event-details">
      <h2 style="margin-top: 0; color: #10b981; font-size: 18px;">Confirmed Event Details</h2>

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

      ${event.guest_count ? `
      <div class="detail-row">
        <div class="detail-label">Expected Guests:</div>
        <div class="detail-value">${event.guest_count}</div>
      </div>
      ` : ''}

      <div class="detail-row">
        <div class="detail-label">Venue:</div>
        <div class="detail-value">${venueName}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Service Category:</div>
        <div class="detail-value">${vendorServices}</div>
      </div>

      ${quotedCost ? `
      <div class="detail-row">
        <div class="detail-label">Quoted Cost:</div>
        <div class="detail-value"><strong>${formatCurrency(quotedCost)}</strong></div>
      </div>
      ` : ''}
    </div>

    ${quotedCost && quoteDetails ? `
    <div class="quote-section">
      <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">Quote Summary</h3>

      ${quoteDetails.breakdown ? `
      <div style="margin: 15px 0;">
        <strong>Pricing Breakdown:</strong>
        <div style="margin-top: 8px; white-space: pre-line; color: #78350f;">${quoteDetails.breakdown}</div>
      </div>
      ` : ''}

      ${quoteDetails.terms ? `
      <div style="margin: 15px 0;">
        <strong>Terms:</strong>
        <div style="margin-top: 8px; color: #78350f;">${quoteDetails.terms}</div>
      </div>
      ` : ''}

      ${quoteDetails.paymentSchedule ? `
      <div style="margin: 15px 0;">
        <strong>Payment Schedule:</strong>
        <div style="margin-top: 8px; color: #78350f;">${quoteDetails.paymentSchedule}</div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${nextSteps && nextSteps.length > 0 ? `
    <div class="next-steps">
      <h3 style="margin-top: 0; color: #2563eb; font-size: 16px;">Next Steps</h3>
      <ol>
        ${nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ol>
    </div>
    ` : `
    <div class="next-steps">
      <h3 style="margin-top: 0; color: #2563eb; font-size: 16px;">Next Steps</h3>
      <ol>
        <li>We'll reach out shortly to finalize contract details</li>
        <li>Please confirm receipt of this confirmation email</li>
        <li>Let us know if you have any questions or need additional information</li>
        <li>We'll coordinate logistics closer to the event date</li>
      </ol>
    </div>
    `}

    <div class="important-notice">
      <strong>📋 Please Note:</strong> This email serves as confirmation of our intent to work together. We'll follow up with formal contract paperwork and deposit information separately.
    </div>

    <p>If you have any questions or need to discuss any details, please don't hesitate to reach out. We're excited to partner with you!</p>

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
    <p style="margin: 0;">This confirmation was sent via VenueAssistant on behalf of ${venueName}.</p>
    <p style="margin: 10px 0 0 0;">We look forward to working with you!</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for confirmation email
 */
export function generateConfirmationPlainText(data: ConfirmationTemplateData): string {
  const { event, vendor, venueName, venueContact, quotedCost, quoteDetails, nextSteps, customMessage } = data
  const vendorServices = ((vendor as any).vendor_services || [])
    .map((service: any) => service.event_services?.name)
    .filter(Boolean)
    .join(', ') || 'their services'

  const eventDate = formatDate(event.event_date)

  return `
✓ SERVICE CONFIRMED for ${event.event_name}

Hello ${vendor.contact_name || vendor.name} Team,

🎉 Great news! We're excited to confirm that we've selected your ${vendorServices} services for our upcoming event.

Thank you for your quote and availability. We're looking forward to working with you to make this event a success!

${customMessage ? customMessage + '\n' : ''}
CONFIRMED EVENT DETAILS:
-----------------------
Event Name: ${event.event_name}
Event Type: ${event.event_type}
Date: ${eventDate}
${event.event_time ? `Time: ${event.event_time}\n` : ''}${event.guest_count ? `Expected Guests: ${event.guest_count}\n` : ''}Venue: ${venueName}
Service Category: ${vendorServices}
${quotedCost ? `Quoted Cost: ${formatCurrency(quotedCost)}\n` : ''}
${quotedCost && quoteDetails ? `
QUOTE SUMMARY:
-------------
${quoteDetails.breakdown ? `Pricing Breakdown:\n${quoteDetails.breakdown}\n\n` : ''}${quoteDetails.terms ? `Terms: ${quoteDetails.terms}\n\n` : ''}${quoteDetails.paymentSchedule ? `Payment Schedule: ${quoteDetails.paymentSchedule}\n\n` : ''}` : ''}
NEXT STEPS:
----------
${nextSteps && nextSteps.length > 0 ? nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n') : `1. We'll reach out shortly to finalize contract details
2. Please confirm receipt of this confirmation email
3. Let us know if you have any questions or need additional information
4. We'll coordinate logistics closer to the event date`}

📋 PLEASE NOTE: This email serves as confirmation of our intent to work together. We'll follow up with formal contract paperwork and deposit information separately.

If you have any questions or need to discuss any details, please don't hesitate to reach out. We're excited to partner with you!

Best regards,

${venueContact.name}
${venueName}
Email: ${venueContact.email}
${venueContact.phone ? `Phone: ${venueContact.phone}` : ''}

---
This confirmation was sent via VenueAssistant on behalf of ${venueName}.
We look forward to working with you!
  `.trim()
}
