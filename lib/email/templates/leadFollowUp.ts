/**
 * Email template for lead follow-up messages.
 */

export interface LeadFollowUpEmailData {
  contactName: string | null
  venueName: string
  eventType: string | null
  eventDate: string | null
  managerName: string | null
  venuePhone: string | null
  venueEmail: string | null
  baseUrl: string
  leadId: string
}

export function generateLeadFollowUpSubject(
  data: LeadFollowUpEmailData
): string {
  return `Following up on your ${data.eventType || "event"} inquiry at ${data.venueName}`
}

export function generateLeadFollowUpHTML(data: LeadFollowUpEmailData): string {
  const name = data.contactName || "there"
  const managerSignoff = data.managerName || "The Team"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow Up - ${data.venueName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
    .cta-btn { display: inline-block; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 8px 4px; }
    .cta-btn-outline { display: inline-block; padding: 12px 28px; background: white; color: #2563eb; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 8px 4px; border: 2px solid #2563eb; }
    .footer { background: #f3f4f6; padding: 16px 24px; border-radius: 0 0 8px 8px; font-size: 13px; color: #6b7280; }
    .contact-info { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px; }
    .contact-info p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 20px;">Just checking in!</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.venueName}</p>
  </div>
  <div class="content">
    <p>Hi ${name},</p>

    <p>I wanted to follow up on your recent inquiry about hosting ${data.eventType ? `a <strong>${data.eventType}</strong>` : "an event"} at ${data.venueName}${data.eventDate ? ` on <strong>${data.eventDate}</strong>` : ""}.</p>

    <p>We&rsquo;d love to help you finalize your plans! Whether you have questions about our spaces, pricing, or availability, I&rsquo;m here to help.</p>

    <p>Here are a few things we can help with:</p>
    <ul>
      <li>Personalized venue tour (virtual or in-person)</li>
      <li>Custom pricing based on your specific needs</li>
      <li>Detailed proposal with floor plans and packages</li>
    </ul>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${data.baseUrl}/leads/${data.leadId}" class="cta-btn">View Your Inquiry</a>
    </div>

    ${
      data.venuePhone || data.venueEmail
        ? `
    <div class="contact-info">
      <p style="font-weight: 600; margin-bottom: 8px;">Get in touch directly:</p>
      ${data.venuePhone ? `<p>Phone: <a href="tel:${data.venuePhone}" style="color: #2563eb;">${data.venuePhone}</a></p>` : ""}
      ${data.venueEmail ? `<p>Email: <a href="mailto:${data.venueEmail}" style="color: #2563eb;">${data.venueEmail}</a></p>` : ""}
    </div>
    `
        : ""
    }

    <p style="margin-top: 20px;">Looking forward to hearing from you!</p>

    <p>Best regards,<br><strong>${managerSignoff}</strong><br>${data.venueName}</p>
  </div>
  <div class="footer">
    <p style="margin: 0;">This email was sent by VenueManager on behalf of ${data.venueName}.</p>
    <p style="margin: 4px 0 0 0;">If you&rsquo;re no longer interested, simply ignore this message.</p>
  </div>
</body>
</html>`.trim()
}
