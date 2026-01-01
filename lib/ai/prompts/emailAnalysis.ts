/**
 * Prompt template for analyzing vendor email responses
 */

export interface EmailAnalysisInput {
  emailBody: string
  vendorName: string
  eventName: string
  originalRequest?: string
}

export interface EmailAnalysisOutput {
  sentiment: 'positive' | 'neutral' | 'negative'
  hasQuote: boolean
  isAvailable: boolean
  needsFollowUp: boolean
  responseType: 'quote' | 'decline' | 'question' | 'confirmation' | 'other'
  keyPoints: string[]
  suggestedAction: string
  confidence: number
}

export function buildEmailAnalysisPrompt(input: EmailAnalysisInput): string {
  const { emailBody, vendorName, eventName, originalRequest } = input

  return `You are an AI assistant analyzing a vendor's email response to determine next steps.

**Context:**
We reached out to ${vendorName} about providing services for "${eventName}".

${originalRequest ? `**Our Original Request:**\n${originalRequest}\n` : ''}

**Vendor's Response:**
"""
${emailBody}
"""

**Task:**
Analyze this email and provide a structured assessment. Return ONLY a valid JSON object with these fields:

1. **sentiment**: Overall tone of the response
   - "positive": Enthusiastic, willing to help, provided quote
   - "neutral": Professional but non-committal, asking for more info
   - "negative": Declining, not available, or expressing concerns

2. **hasQuote**: true if the email contains pricing information or a quote, false otherwise

3. **isAvailable**: true if vendor confirms availability for the date, false if they decline or are unavailable

4. **needsFollowUp**: true if we need to respond to their questions or provide more information

5. **responseType**: Categorize the response
   - "quote": Vendor provided a price quote
   - "decline": Vendor declined or is unavailable
   - "question": Vendor is asking for more information
   - "confirmation": Vendor confirmed availability and next steps
   - "other": Doesn't fit other categories

6. **keyPoints**: Array of 2-4 key points from the email (e.g., pricing, availability, questions asked, concerns)

7. **suggestedAction**: Brief suggestion for next step (e.g., "Extract quote and present to user", "Answer vendor's questions about XYZ", "Mark as declined and find alternative")

8. **confidence**: Your confidence in this analysis (0.0 to 1.0)

**Analysis Guidelines:**
- Focus on actionable information
- Be objective in sentiment assessment
- Identify specific questions that need answers
- Note any red flags or concerns
- Consider the vendor's responsiveness as a positive signal

Return ONLY the JSON object, no other text.

Example output:
{
  "sentiment": "positive",
  "hasQuote": true,
  "isAvailable": true,
  "needsFollowUp": false,
  "responseType": "quote",
  "keyPoints": [
    "Available for the date",
    "Quote: $2,500 for full service catering",
    "Requires 50% deposit within 7 days",
    "Can accommodate dietary restrictions"
  ],
  "suggestedAction": "Extract quote details and present to user for approval",
  "confidence": 0.95
}`
}

export function validateEmailAnalysis(data: any): EmailAnalysisOutput {
  const validSentiments = ['positive', 'neutral', 'negative']
  const validResponseTypes = ['quote', 'decline', 'question', 'confirmation', 'other']

  if (!validSentiments.includes(data.sentiment)) {
    throw new Error(`Invalid sentiment. Must be one of: ${validSentiments.join(', ')}`)
  }

  if (typeof data.hasQuote !== 'boolean') {
    throw new Error('hasQuote must be a boolean')
  }

  if (typeof data.isAvailable !== 'boolean') {
    throw new Error('isAvailable must be a boolean')
  }

  if (typeof data.needsFollowUp !== 'boolean') {
    throw new Error('needsFollowUp must be a boolean')
  }

  if (!validResponseTypes.includes(data.responseType)) {
    throw new Error(`Invalid responseType. Must be one of: ${validResponseTypes.join(', ')}`)
  }

  if (!Array.isArray(data.keyPoints) || data.keyPoints.length === 0) {
    throw new Error('keyPoints must be a non-empty array')
  }

  if (typeof data.suggestedAction !== 'string') {
    throw new Error('suggestedAction must be a string')
  }

  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('confidence must be a number between 0 and 1')
  }

  return data as EmailAnalysisOutput
}
