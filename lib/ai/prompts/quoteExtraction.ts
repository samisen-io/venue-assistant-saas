/**
 * Prompt template for extracting quote details from vendor emails
 */

import { ExtractedQuoteData, QuoteBreakdownItem } from '@/lib/types/quote.types'

export interface QuoteExtractionInput {
  emailBody: string
  vendorName: string
  vendorServices: string
  eventDetails: {
    eventName: string
    eventDate: string
    guestCount: number
  }
}

export function buildQuoteExtractionPrompt(input: QuoteExtractionInput): string {
  const { emailBody, vendorName, vendorServices, eventDetails } = input

  return `You are an AI assistant specialized in extracting pricing and quote information from vendor emails.

**Context:**
Vendor: ${vendorName} (${vendorServices})
Event: ${eventDetails.eventName}
Date: ${eventDetails.eventDate}
Guests: ${eventDetails.guestCount}

**Vendor's Email:**
"""
${emailBody}
"""

**Task:**
Extract all quote and pricing information from this email. Return ONLY a valid JSON object with these fields:

1. **totalCost**: The total quoted price as a number (required)

2. **breakdown**: Array of line items if detailed pricing is provided. Each item should have:
   - description: What the charge is for
   - quantity: Number of units (if applicable)
   - unitCost: Cost per unit (if applicable)
   - totalCost: Total for this line item
   - category: Service category (if identifiable)

3. **availabilityConfirmed**: true if vendor confirms they are available, false otherwise

4. **availableDate**: The date they're available for (YYYY-MM-DD format)

5. **setupTime**: When they need to arrive/setup (HH:MM format)

6. **depositRequired**: Deposit amount if mentioned

7. **depositPercentage**: Deposit percentage if mentioned (e.g., 50 for 50%)

8. **paymentTerms**: Payment terms/schedule (e.g., "50% deposit, 50% day of event")

9. **cancellationPolicy**: Cancellation policy if mentioned

10. **additionalNotes**: Any other important terms, conditions, or notes

11. **confidence**: Your confidence in the extraction accuracy (0.0 to 1.0)

**Extraction Guidelines:**
- Extract only numeric values for costs (e.g., 2500, not "$2,500")
- If multiple pricing options are given, extract the most appropriate/recommended one
- For breakdown, be as detailed as the email provides
- Set confidence to 1.0 only if pricing is very clear and unambiguous
- If no clear total is given but breakdown is provided, sum the breakdown
- Look for words like "total", "quote", "price", "cost" to identify main pricing
- Note any conditions or assumptions made about the pricing

**Important:**
- Return ONLY the JSON object
- All costs should be numbers without currency symbols or formatting
- If a field is not mentioned in the email, omit it from the JSON
- Be conservative with confidence - use lower values if anything is unclear

Example output:
{
  "totalCost": 2500,
  "breakdown": [
    {
      "description": "Buffet dinner service",
      "quantity": 100,
      "unitCost": 20,
      "totalCost": 2000,
      "category": "catering"
    },
    {
      "description": "Bar service (3 hours)",
      "totalCost": 500,
      "category": "catering"
    }
  ],
  "availabilityConfirmed": true,
  "availableDate": "2024-07-15",
  "setupTime": "16:00",
  "depositRequired": 1250,
  "depositPercentage": 50,
  "paymentTerms": "50% deposit upon booking, 50% due 7 days before event",
  "cancellationPolicy": "Full refund if cancelled 30+ days before event, 50% refund 14-29 days before",
  "additionalNotes": "Price includes setup, service, and cleanup. Does not include gratuity.",
  "confidence": 0.95
}`
}

export function validateQuoteExtraction(data: any): ExtractedQuoteData {
  // Validate required fields
  if (typeof data.totalCost !== 'number' || data.totalCost <= 0) {
    throw new Error('totalCost must be a positive number')
  }

  // Validate breakdown if provided
  if (data.breakdown) {
    if (!Array.isArray(data.breakdown)) {
      throw new Error('breakdown must be an array')
    }

    for (const item of data.breakdown) {
      if (!item.description || typeof item.description !== 'string') {
        throw new Error('Each breakdown item must have a description')
      }
      if (typeof item.totalCost !== 'number' || item.totalCost < 0) {
        throw new Error('Each breakdown item must have a valid totalCost')
      }
    }
  }

  // Validate date format if provided
  if (data.availableDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.availableDate)) {
    throw new Error('availableDate must be in YYYY-MM-DD format')
  }

  // Validate time format if provided
  if (data.setupTime && !/^\d{2}:\d{2}$/.test(data.setupTime)) {
    throw new Error('setupTime must be in HH:MM format')
  }

  // Validate numeric fields
  if (data.depositRequired !== undefined && (typeof data.depositRequired !== 'number' || data.depositRequired < 0)) {
    throw new Error('depositRequired must be a positive number')
  }

  if (data.depositPercentage !== undefined && (typeof data.depositPercentage !== 'number' || data.depositPercentage < 0 || data.depositPercentage > 100)) {
    throw new Error('depositPercentage must be a number between 0 and 100')
  }

  // Validate confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('confidence must be a number between 0 and 1')
  }

  return data as ExtractedQuoteData
}
