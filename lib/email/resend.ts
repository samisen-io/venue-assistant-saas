import { Resend } from 'resend'
import { EmailDraft, EmailSendResult } from '../types/communication.types'

// Initialize Resend client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set in environment variables')
  }

  return new Resend(apiKey)
}

// Get email configuration from environment
export const getEmailConfig = () => {
  return {
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@VenueManager.com',
    fromName: process.env.RESEND_FROM_NAME || 'VenueManager',
    webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
  }
}

// Resend Email Client
export class ResendEmailClient {
  private client: Resend
  private config: ReturnType<typeof getEmailConfig>

  constructor() {
    this.client = getResendClient()
    this.config = getEmailConfig()
  }

  /**
   * Send an email
   */
  async sendEmail(draft: EmailDraft): Promise<EmailSendResult> {
    try {
      const response = await this.client.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: draft.to,
        subject: draft.subject,
        html: this.formatEmailBody(draft.body),
        text: this.stripHtml(draft.body),
        headers: draft.threadId
          ? {
              'In-Reply-To': draft.threadId,
              References: draft.threadId,
            }
          : undefined,
        tags: draft.metadata
          ? [
              { name: 'event_id', value: draft.metadata.eventId },
              { name: 'vendor_id', value: draft.metadata.vendorId },
              { name: 'purpose', value: draft.metadata.purpose },
            ]
          : undefined,
      })

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        }
      }

      return {
        success: true,
        messageId: response.data?.id,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Send multiple emails (batch)
   */
  async sendBatchEmails(drafts: EmailDraft[]): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = []

    for (const draft of drafts) {
      const result = await this.sendEmail(draft)
      results.push(result)

      // Add small delay between emails to avoid rate limits
      if (drafts.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * Format email body with proper HTML structure
   */
  private formatEmailBody(body: string): string {
    // If body already contains HTML tags, return as is
    if (body.includes('<html>') || body.includes('<!DOCTYPE')) {
      return body
    }

    // Convert plain text to HTML with line breaks
    const htmlBody = body
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('')

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            p {
              margin: 0 0 16px 0;
            }
            .signature {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          ${htmlBody}
          <div class="signature">
            <p>Best regards,<br>
            ${this.config.fromName}</p>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Handle errors
   */
  private handleError(error: any): EmailSendResult {
    console.error('Resend email error:', error)

    if (error?.message) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to send email. Please try again.',
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('RESEND_WEBHOOK_SECRET not configured')
      return false
    }

    // Resend uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex')

    return signature === expectedSignature
  }

  /**
   * Test the Resend API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test email to the configured from address
      const result = await this.sendEmail({
        to: this.config.fromEmail,
        from: this.config.fromEmail,
        subject: 'VenueManager - Email Service Test',
        body: 'This is a test email to verify Resend integration is working correctly.',
      })

      return result.success
    } catch (error) {
      console.error('Resend API connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
let resendClientInstance: ResendEmailClient | null = null

export const getResendClientInstance = (): ResendEmailClient => {
  if (!resendClientInstance) {
    resendClientInstance = new ResendEmailClient()
  }
  return resendClientInstance
}

// Helper function for sending emails
export async function sendEmail(draft: EmailDraft): Promise<EmailSendResult> {
  const client = getResendClientInstance()
  return client.sendEmail(draft)
}

// Helper function for batch sending
export async function sendBatchEmails(drafts: EmailDraft[]): Promise<EmailSendResult[]> {
  const client = getResendClientInstance()
  return client.sendBatchEmails(drafts)
}
