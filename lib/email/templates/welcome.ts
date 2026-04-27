/**
 * Welcome email sent on first signup/trial creation.
 * Spec: subject "Your venue page is 3 steps from live."
 * Send from founder's name. Include a P.S. with personal reply offer.
 */

export interface WelcomeEmailData {
  fullName: string
  pageEditorUrl: string
  founderName: string
}

export function generateWelcomeSubject(): string {
  return "Your venue page is 3 steps from live."
}

export function generateWelcomeHTML(data: WelcomeEmailData): string {
  const name = data.fullName || "there"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VenueManager</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; max-width: 580px; margin: 0 auto; padding: 20px; }
    p { margin: 0 0 16px 0; }
    .cta-btn { display: inline-block; padding: 13px 28px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
    .steps { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .step:last-child { margin-bottom: 0; }
    .step-num { background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-right: 12px; margin-top: 2px; }
    .ps { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #555; }
  </style>
</head>
<body>
  <p>Hi ${name},</p>

  <p>Welcome to VenueManager — your venue page is almost ready for the world to see.</p>

  <p>Here are the three steps to go live:</p>

  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div><strong>Add your venue details</strong> — name, location, and a short description that tells your story.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div><strong>Upload photos</strong> — your space sells itself visually. Even 3–5 photos make a huge difference.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div><strong>Publish your page</strong> — share the link anywhere prospects might find you.</div>
    </div>
  </div>

  <p style="text-align: center; margin: 28px 0;">
    <a href="${data.pageEditorUrl}" class="cta-btn">Go to Page Editor →</a>
  </p>

  <p>Your 14-day trial is active. No credit card needed until you decide to continue.</p>

  <p>— ${data.founderName}</p>

  <div class="ps">
    <p><strong>P.S.</strong> If you get stuck, reply to this email and I'll help personally. — ${data.founderName}</p>
  </div>
</body>
</html>`.trim()
}
