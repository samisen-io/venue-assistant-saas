export interface TestimonialRequestEmailData {
  clientName: string
  venueName: string
  submissionUrl: string
}

export function generateTestimonialRequestSubject(data: TestimonialRequestEmailData): string {
  return `How was your event at ${data.venueName}?`
}

export function generateTestimonialRequestHTML(data: TestimonialRequestEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; color:#111827; line-height:1.6;">
  <h2>Share your experience</h2>
  <p>Hi ${data.clientName},</p>
  <p>Thank you for hosting your event with ${data.venueName}. We would love a quick testimonial.</p>
  <p><a href="${data.submissionUrl}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;">Submit Testimonial</a></p>
  <p>We appreciate your feedback.</p>
</body>
</html>
`.trim()
}
