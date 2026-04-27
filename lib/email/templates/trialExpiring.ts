/**
 * Trial expiry warning emails.
 * Sent 3 days out and 1 day out from trial end.
 */

export interface TrialExpiringData {
  fullName: string
  daysRemaining: number
  upgradeUrl: string
}

export function generateTrialExpiringSubject(data: TrialExpiringData): string {
  if (data.daysRemaining === 1) {
    return "Last day of your trial"
  }
  return `Your trial ends in ${data.daysRemaining} days`
}

export function generateTrialExpiringHTML(data: TrialExpiringData): string {
  const name = data.fullName || "there"
  const isLastDay = data.daysRemaining === 1
  const urgencyColor = isLastDay ? "#dc2626" : "#f59e0b"
  const urgencyText = isLastDay
    ? "Today is the last day of your free trial."
    : `Your free trial ends in ${data.daysRemaining} days.`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${generateTrialExpiringSubject(data)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; max-width: 580px; margin: 0 auto; padding: 20px; }
    p { margin: 0 0 16px 0; }
    .banner { background: ${urgencyColor}; color: white; padding: 14px 20px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-bottom: 24px; }
    .cta-btn { display: inline-block; padding: 13px 28px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
    .plans { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
    .plan-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .plan-row:last-child { border-bottom: none; }
    .plan-name { font-weight: 600; }
    .plan-price { color: #6b7280; }
  </style>
</head>
<body>
  <div class="banner">${urgencyText}</div>

  <p>Hi ${name},</p>

  <p>${isLastDay ? "This is your last chance to keep your venue page live and continue receiving leads." : "After your trial ends, your venue page will go offline and new lead creation will be paused — no data is deleted."}</p>

  <p>Upgrade now to keep everything running:</p>

  <div class="plans">
    <div class="plan-row">
      <span class="plan-name">Starter</span>
      <span class="plan-price">$99/mo · 1 space, up to 25 events/mo</span>
    </div>
    <div class="plan-row">
      <span class="plan-name">Growth</span>
      <span class="plan-price">$199/mo · Up to 3 spaces, unlimited events</span>
    </div>
    <div class="plan-row">
      <span class="plan-name">Professional</span>
      <span class="plan-price">$299/mo · Unlimited spaces + staff access</span>
    </div>
  </div>

  <p style="text-align: center; margin: 28px 0;">
    <a href="${data.upgradeUrl}" class="cta-btn">Upgrade Now →</a>
  </p>

  <p>Questions? Reply to this email — happy to help.</p>
</body>
</html>`.trim()
}
