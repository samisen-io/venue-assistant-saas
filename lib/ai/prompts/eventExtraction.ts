/**
 * Prompt template for extracting event details from natural language input
 */

export interface EventExtractionInput {
  userInput: string
}

export interface EventExtractionOutput {
  event_name: string
  event_type: string
  event_date?: string
  event_time?: string
  guest_count?: number
  budget_total?: number
  description?: string
  special_requirements?: string
  needed_categories?: string[]
  confidence: number
}

export function buildEventExtractionPrompt(input: EventExtractionInput): string {
  return `You are an AI assistant helping to extract event details from natural language descriptions.

The user has provided the following description of an event they want to plan:

"""
${input.userInput}
"""

Please extract the following information from this description:

1. **event_name**: A descriptive name for the event
2. **event_type**: The type of event (wedding, corporate, conference, birthday, gala, meeting, other)
3. **event_date**: The date of the event in YYYY-MM-DD format (if mentioned)
4. **event_time**: The time of the event in HH:MM format (if mentioned)
5. **guest_count**: The expected number of guests (if mentioned)
6. **budget_total**: The total budget in dollars (if mentioned, extract just the number)
7. **description**: A brief description of the event
8. **special_requirements**: Any special requirements mentioned
9. **needed_categories**: Array of vendor services needed (catering, av, florals, photography, parking, security, entertainment, other)
10. **confidence**: Your confidence in the extraction (0.0 to 1.0)

IMPORTANT RULES:
- Only include fields where you have high confidence in the extracted value
- For dates, use YYYY-MM-DD format. If only a month and day are given, assume the current or next year
- For times, use 24-hour HH:MM format
- For budget, extract only the numerical value (e.g., 5000, not "$5,000")
- For event_type, use one of: wedding, corporate, conference, birthday, gala, meeting, other
- For needed_categories, only include categories explicitly mentioned or strongly implied
- Set confidence to 1.0 if all major details are clear, lower if ambiguous

Return ONLY a valid JSON object with the extracted fields. Do not include any other text.

Example output:
{
  "event_name": "Summer Corporate Retreat",
  "event_type": "corporate",
  "event_date": "2024-07-15",
  "guest_count": 50,
  "budget_total": 10000,
  "description": "Annual summer retreat for company employees",
  "needed_categories": ["catering", "av"],
  "confidence": 0.95
}`
}

export function validateEventExtraction(data: any): EventExtractionOutput {
  // Validate required fields
  if (!data.event_name || typeof data.event_name !== 'string') {
    throw new Error('Missing or invalid event_name')
  }

  if (!data.event_type || typeof data.event_type !== 'string') {
    throw new Error('Missing or invalid event_type')
  }

  // Validate event_type is one of the allowed values
  const validTypes = ['wedding', 'corporate', 'conference', 'birthday', 'gala', 'meeting', 'other']
  if (!validTypes.includes(data.event_type)) {
    throw new Error(`Invalid event_type. Must be one of: ${validTypes.join(', ')}`)
  }

  // Validate date format if provided
  if (data.event_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.event_date)) {
    throw new Error('Invalid event_date format. Must be YYYY-MM-DD')
  }

  // Validate time format if provided
  if (data.event_time && !/^\d{2}:\d{2}$/.test(data.event_time)) {
    throw new Error('Invalid event_time format. Must be HH:MM')
  }

  // Validate numeric fields
  if (data.guest_count !== undefined && (typeof data.guest_count !== 'number' || data.guest_count < 0)) {
    throw new Error('Invalid guest_count. Must be a positive number')
  }

  if (data.budget_total !== undefined && (typeof data.budget_total !== 'number' || data.budget_total < 0)) {
    throw new Error('Invalid budget_total. Must be a positive number')
  }

  // Validate confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('Invalid confidence. Must be a number between 0 and 1')
  }

  return data as EventExtractionOutput
}
