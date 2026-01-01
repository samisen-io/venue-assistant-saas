import { ParsedEmail } from '../types/communication.types'

/**
 * Parse a vendor email reply
 */
export function parseVendorEmail(rawEmail: string | any): ParsedEmail {
  // Handle different email formats
  let email: any

  if (typeof rawEmail === 'string') {
    // Try to parse as JSON first (from webhook)
    try {
      email = JSON.parse(rawEmail)
    } catch {
      // If not JSON, treat as plain text
      return parseTextEmail(rawEmail)
    }
  } else {
    email = rawEmail
  }

  // Extract email fields from common webhook formats
  return {
    from: email.from || email.sender || '',
    to: email.to || email.recipient || '',
    subject: email.subject || '',
    body: extractEmailBody(email),
    threadId: extractThreadId(email),
    inReplyTo: email.in_reply_to || email.inReplyTo,
    references: email.references || [],
    receivedAt: email.received_at || email.receivedAt || new Date().toISOString(),
    attachments: extractAttachments(email),
  }
}

/**
 * Extract email body from various formats
 */
function extractEmailBody(email: any): string {
  // Try to get HTML body first, then plain text
  const body = email.html_body || email.htmlBody || email.text_body || email.textBody || email.body || ''

  // If HTML, strip tags for plain text
  if (email.html_body || email.htmlBody) {
    return stripHtml(body)
  }

  return body
}

/**
 * Parse plain text email
 */
function parseTextEmail(text: string): ParsedEmail {
  // Simple text parser - extract basic info
  const lines = text.split('\n')

  let from = ''
  let to = ''
  let subject = ''
  let body = ''
  let inBodySection = false

  for (const line of lines) {
    if (line.toLowerCase().startsWith('from:')) {
      from = line.substring(5).trim()
    } else if (line.toLowerCase().startsWith('to:')) {
      to = line.substring(3).trim()
    } else if (line.toLowerCase().startsWith('subject:')) {
      subject = line.substring(8).trim()
    } else if (line.trim() === '') {
      inBodySection = true
    } else if (inBodySection) {
      body += line + '\n'
    }
  }

  return {
    from,
    to,
    subject,
    body: body.trim(),
    receivedAt: new Date().toISOString(),
  }
}

/**
 * Extract thread ID from email headers
 */
export function extractThreadId(email: any): string | undefined {
  // Check various fields that might contain thread ID
  if (email.thread_id) return email.thread_id
  if (email.threadId) return email.threadId
  if (email.message_id) return email.message_id
  if (email.messageId) return email.messageId
  if (email.in_reply_to) return email.in_reply_to
  if (email.inReplyTo) return email.inReplyTo

  // Check headers object
  if (email.headers) {
    if (email.headers['message-id']) return email.headers['message-id']
    if (email.headers['in-reply-to']) return email.headers['in-reply-to']
    if (email.headers['thread-id']) return email.headers['thread-id']
  }

  return undefined
}

/**
 * Extract attachments from email
 */
function extractAttachments(email: any): any[] {
  if (!email.attachments || !Array.isArray(email.attachments)) {
    return []
  }

  return email.attachments.map((att: any) => ({
    filename: att.filename || att.name || 'unknown',
    contentType: att.content_type || att.contentType || 'application/octet-stream',
    size: att.size || att.length || 0,
    url: att.url || att.download_url,
  }))
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract quote numbers from email body
 */
export function extractQuoteNumbers(body: string): {
  totalCost?: number
  depositAmount?: number
  otherNumbers: number[]
} {
  const result: {
    totalCost?: number
    depositAmount?: number
    otherNumbers: number[]
  } = {
    otherNumbers: [],
  }

  // Regular expressions for currency amounts
  const currencyPatterns = [
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // $1,234.56
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars|USD)/gi, // 1,234.56 dollars
  ]

  const numbers: number[] = []

  // Extract all currency amounts
  for (const pattern of currencyPatterns) {
    let match
    while ((match = pattern.exec(body)) !== null) {
      const numStr = match[1].replace(/,/g, '')
      const num = parseFloat(numStr)
      if (!isNaN(num) && num > 0) {
        numbers.push(num)
      }
    }
  }

  // Sort numbers descending
  numbers.sort((a, b) => b - a)

  // Try to identify total cost and deposit
  const totalKeywords = ['total', 'quote', 'price', 'cost', 'amount']
  const depositKeywords = ['deposit', 'down payment', 'retainer', 'advance']

  const bodyLower = body.toLowerCase()

  // Look for total cost
  for (const num of numbers) {
    const numStr = num.toString()
    const index = body.indexOf(numStr)

    if (index !== -1) {
      const context = bodyLower.substring(Math.max(0, index - 50), index + 50)

      if (totalKeywords.some(keyword => context.includes(keyword))) {
        result.totalCost = num
        break
      }
    }
  }

  // Look for deposit
  for (const num of numbers) {
    if (num === result.totalCost) continue

    const numStr = num.toString()
    const index = body.indexOf(numStr)

    if (index !== -1) {
      const context = bodyLower.substring(Math.max(0, index - 50), index + 50)

      if (depositKeywords.some(keyword => context.includes(keyword))) {
        result.depositAmount = num
        break
      }
    }
  }

  // Add remaining numbers to otherNumbers
  result.otherNumbers = numbers.filter(
    num => num !== result.totalCost && num !== result.depositAmount
  )

  return result
}

/**
 * Extract dates from email body
 */
export function extractDates(body: string): Date[] {
  const dates: Date[] = []

  // Common date patterns
  const datePatterns = [
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, // MM/DD/YYYY
    /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g, // YYYY-MM-DD
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/gi, // Month DD, YYYY
  ]

  for (const pattern of datePatterns) {
    let match
    while ((match = pattern.exec(body)) !== null) {
      try {
        const dateStr = match[0]
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          dates.push(date)
        }
      } catch {
        // Ignore invalid dates
      }
    }
  }

  return dates
}

/**
 * Check if email contains a positive response
 */
export function isPositiveResponse(body: string): boolean {
  const bodyLower = body.toLowerCase()

  const positiveIndicators = [
    'yes',
    'available',
    'we can',
    "we'd be happy",
    "we'd love to",
    'looking forward',
    'pleased to',
    'delighted to',
    'quote',
    'proposal',
    'estimate',
  ]

  const negativeIndicators = [
    'unfortunately',
    'not available',
    "can't",
    'cannot',
    'unable to',
    'booked',
    'fully booked',
    'decline',
  ]

  const positiveCount = positiveIndicators.filter(indicator => bodyLower.includes(indicator)).length
  const negativeCount = negativeIndicators.filter(indicator => bodyLower.includes(indicator)).length

  return positiveCount > negativeCount
}

/**
 * Extract vendor's name from email signature
 */
export function extractVendorName(body: string): string | null {
  const lines = body.split('\n').reverse() // Start from end

  // Look for common signature patterns
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim()

    // Skip empty lines and common signature elements
    if (!line || line.length < 3) continue
    if (line.includes('@') || line.includes('http')) continue
    if (/^\d+$/.test(line)) continue // Skip phone numbers

    // First non-empty, non-email, non-url line is likely the name
    if (line.length < 50 && /^[A-Z]/.test(line)) {
      return line
    }
  }

  return null
}
