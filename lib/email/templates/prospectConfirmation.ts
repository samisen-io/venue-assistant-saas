/**
 * Email template sent to the prospect after their inquiry is captured.
 */

export interface ProspectConfirmationData {
  prospectName: string | null
  venueName: string
  eventType: string | null
  eventDate: string | null
  referenceId: string
}

export function generateProspectConfirmationSubject(
  data: ProspectConfirmationData
): string {
  return `Thank you for your inquiry — ${data.venueName}`
}

export function generateProspectConfirmationHTML(
  data: ProspectConfirmationData
): string {
  const name = data.prospectName || "there"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - ${data.venueName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
    .ref-box { background: white; padding: 12px 16px; border-radius: 6px; border: 1px solid #e5e7eb; text-align: center; margin: 16px 0; }
    .footer { background: #f3f4f6; padding: 16px 24px; border-radius: 0 0 8px 8px; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 22px;">We received your inquiry!</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.venueName}</p>
  </div>
  <div class="content">
    <p>Hi ${name},</p>
    <p>Thank you for your interest in hosting ${data.eventType ? `your ${data.eventType}` : "your event"} at ${data.venueName}${data.eventDate ? ` on ${data.eventDate}` : ""}. We're excited to help make your event unforgettable!</p>

    <div class="ref-box">
      <p style="margin: 0; font-size: 13px; color: #6b7280;">Your Reference Number</p>
      <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #111827;">${data.referenceId}</p>
    </div>

    <h3 style="font-size: 16px; color: #111827;">What happens next?</h3>
    <ol style="padding-left: 20px;">
      <li>Our team will review your inquiry within 24 hours</li>
      <li>We'll reach out to discuss your event details</li>
      <li>We'll prepare a custom proposal tailored to your needs</li>
    </ol>

    <p>If you have any questions in the meantime, feel free to reply to this email.</p>

    <p>We look forward to working with you!</p>
    <p style="margin-top: 24px;">Best regards,<br><strong>The ${data.venueName} Team</strong></p>
  </div>
  <div class="footer">
    <p style="margin: 0;">This email was sent by VenueManager on behalf of ${data.venueName}.</p>
  </div>
</body>
</html>`.trim()
}
