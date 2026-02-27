/**
 * Payment failed notification email.
 * Sent when Stripe fires invoice.payment_failed.
 */

export interface PaymentFailedData {
  fullName: string
  billingUrl: string
}

export function generatePaymentFailedSubject(): string {
  return "Action required — payment failed"
}

export function generatePaymentFailedHTML(data: PaymentFailedData): string {
  const name = data.fullName || "there"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action required — payment failed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; max-width: 580px; margin: 0 auto; padding: 20px; }
    p { margin: 0 0 16px 0; }
    .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; color: #dc2626; font-weight: 600; }
    .cta-btn { display: inline-block; padding: 13px 28px; background: #dc2626; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
  </style>
</head>
<body>
  <div class="alert">⚠ Your last payment could not be processed.</div>

  <p>Hi ${name},</p>

  <p>We were unable to charge the card on file for your VenueManager subscription. This is usually caused by an expired card or insufficient funds.</p>

  <p>Please update your payment method to avoid any interruption to your venue page and lead notifications:</p>

  <p style="text-align: center; margin: 28px 0;">
    <a href="${data.billingUrl}" class="cta-btn">Update Payment Method →</a>
  </p>

  <p>We'll retry the charge automatically. If payment is not updated within a few days, your subscription will be paused — no data will be lost.</p>

  <p>If you have any questions, reply to this email and we'll sort it out right away.</p>
</body>
</html>`.trim()
}
