import { createClient } from '@/lib/supabase/server'
import { askClaudeForJSON } from '@/lib/ai/claude'
import {
  buildEmailAnalysisPrompt,
  validateEmailAnalysis,
  EmailAnalysisOutput,
} from '@/lib/ai/prompts/emailAnalysis'
import {
  buildQuoteExtractionPrompt,
  validateQuoteExtraction,
} from '@/lib/ai/prompts/quoteExtraction'
import { ExtractedQuoteData } from '@/lib/types/quote.types'
import { VendorQuoteInsert } from '@/lib/types'

/**
 * Quote Extractor
 * Analyzes vendor replies and extracts quote information
 */

export interface AnalyzeVendorReplyInput {
  emailBody: string
  vendorName: string
  eventName: string
  originalRequest?: string
}

export interface ExtractQuoteInput {
  emailBody: string
  vendorName: string
  vendorServices: string
  eventDetails: {
    eventName: string
    eventDate: string
    guestCount: number
  }
  communicationId?: string
  eventId: string
  vendorId: string
}

export interface ExtractQuoteResult {
  success: boolean
  quoteId?: string
  totalCost?: number
  error?: string
}

/**
 * Analyze a vendor's reply to determine its content and required actions
 */
export async function analyzeVendorReply(
  input: AnalyzeVendorReplyInput
): Promise<EmailAnalysisOutput> {
  try {
    const prompt = buildEmailAnalysisPrompt(input)

    const analysis = await askClaudeForJSON<EmailAnalysisOutput>(prompt, {
      systemPrompt: 'You are an AI assistant specialized in analyzing vendor email responses.',
      maxTokens: 1024,
    })

    // Validate the analysis
    return validateEmailAnalysis(analysis)
  } catch (error: any) {
    console.error('Error analyzing vendor reply:', error)

    // Return default analysis on error
    return {
      sentiment: 'neutral',
      hasQuote: false,
      isAvailable: false,
      needsFollowUp: true,
      responseType: 'other',
      keyPoints: ['Error analyzing email - manual review required'],
      suggestedAction: 'Manual review needed due to analysis error',
      confidence: 0.0,
    }
  }
}

/**
 * Extract quote details from a vendor's email
 */
export async function extractQuoteDetails(input: ExtractQuoteInput): Promise<ExtractedQuoteData> {
  try {
    const prompt = buildQuoteExtractionPrompt(input)

    const extractedData = await askClaudeForJSON<ExtractedQuoteData>(prompt, {
      systemPrompt: 'You are an AI assistant specialized in extracting pricing information from vendor emails.',
      maxTokens: 2048,
    })

    // Validate the extracted data
    return validateQuoteExtraction(extractedData)
  } catch (error: any) {
    console.error('Error extracting quote details:', error)
    throw new Error(`Failed to extract quote: ${error.message}`)
  }
}

/**
 * Extract quote from vendor reply and save to database
 */
export async function extractQuoteFromReply(
  input: ExtractQuoteInput
): Promise<ExtractQuoteResult> {
  const supabase = await createClient()

  try {
    // Extract quote details using Claude
    const quoteData = await extractQuoteDetails(input)

    // Prepare quote insert data
    const quoteInsert: VendorQuoteInsert = {
      event_id: input.eventId,
      vendor_id: input.vendorId,
      communication_id: input.communicationId || null,
      total_cost: quoteData.totalCost,
      breakdown: quoteData.breakdown as any || null,
      availability_confirmed: quoteData.availabilityConfirmed || false,
      available_date: quoteData.availableDate || null,
      setup_time: quoteData.setupTime || null,
      deposit_required: quoteData.depositRequired || null,
      deposit_percentage: quoteData.depositPercentage || null,
      payment_terms: quoteData.paymentTerms || null,
      cancellation_policy: quoteData.cancellationPolicy || null,
      additional_notes: quoteData.additionalNotes || null,
      status: 'pending',
      raw_email_text: input.emailBody,
      extracted_at: new Date().toISOString(),
    }

    // Insert quote into database
    const { data: quote, error: insertError } = await (supabase as any)
      .from('vendor_quotes')
      .insert(quoteInsert)
      .select()
      .single()

    if (insertError || !quote) {
      console.error('Error inserting quote:', insertError)
      return {
        success: false,
        error: 'Failed to save quote to database',
      }
    }

    // Update the communication record to mark it has a quote
    if (input.communicationId) {
      await (supabase as any)
        .from('vendor_communications')
        .update({ status: 'replied' })
        .eq('id', input.communicationId)
    }

    return {
      success: true,
      quoteId: quote.id,
      totalCost: quoteData.totalCost,
    }
  } catch (error: any) {
    console.error('Error extracting quote from reply:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract quote',
    }
  }
}

/**
 * Validate a quote for completeness and accuracy
 */
export function validateQuote(quote: ExtractedQuoteData): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!quote.totalCost || quote.totalCost <= 0) {
    errors.push('Total cost is missing or invalid')
  }

  // Check confidence level
  if (quote.confidence < 0.5) {
    warnings.push('Low confidence in extracted data - manual review recommended')
  }

  // Check for very high costs (potential extraction error)
  if (quote.totalCost > 1000000) {
    warnings.push('Unusually high cost detected - please verify')
  }

  // Check deposit percentage
  if (quote.depositPercentage && (quote.depositPercentage < 0 || quote.depositPercentage > 100)) {
    errors.push('Deposit percentage must be between 0 and 100')
  }

  // Check deposit consistency
  if (quote.depositRequired && quote.depositPercentage) {
    const calculatedDeposit = (quote.totalCost * quote.depositPercentage) / 100
    const difference = Math.abs(calculatedDeposit - quote.depositRequired)

    if (difference > quote.totalCost * 0.05) {
      // More than 5% difference
      warnings.push('Deposit amount and percentage do not match - please verify')
    }
  }

  // Check breakdown consistency
  if (quote.breakdown && quote.breakdown.length > 0) {
    const breakdownTotal = quote.breakdown.reduce((sum, item) => sum + item.totalCost, 0)
    const difference = Math.abs(breakdownTotal - quote.totalCost)

    if (difference > 1) {
      // Allow $1 rounding difference
      warnings.push(`Breakdown total ($${breakdownTotal}) does not match total cost ($${quote.totalCost})`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Compare multiple quotes for the same service
 */
export function compareQuotes(quotes: Array<{ vendorName: string; quote: ExtractedQuoteData }>) {
  if (quotes.length === 0) {
    return {
      lowestCost: 0,
      highestCost: 0,
      averageCost: 0,
      recommendedVendor: null,
    }
  }

  const costs = quotes.map(q => q.quote.totalCost)
  const lowestCost = Math.min(...costs)
  const highestCost = Math.max(...costs)
  const averageCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length

  // Recommend based on combination of price and confidence
  const scoredQuotes = quotes.map(q => ({
    ...q,
    score: calculateQuoteScore(q.quote, lowestCost, highestCost),
  }))

  scoredQuotes.sort((a, b) => b.score - a.score)

  return {
    lowestCost,
    highestCost,
    averageCost,
    recommendedVendor: scoredQuotes[0]?.vendorName || null,
    quotes: scoredQuotes,
  }
}

/**
 * Calculate a score for a quote based on price and confidence
 */
function calculateQuoteScore(
  quote: ExtractedQuoteData,
  lowestCost: number,
  highestCost: number
): number {
  // Normalize cost (lower is better, scale 0-1)
  const costRange = highestCost - lowestCost
  const costScore = costRange > 0 ? 1 - (quote.totalCost - lowestCost) / costRange : 0.5

  // Combine with confidence (higher is better)
  // Weight: 60% price, 40% confidence
  return costScore * 0.6 + quote.confidence * 0.4
}
