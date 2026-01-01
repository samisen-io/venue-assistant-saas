import { NextRequest, NextResponse } from 'next/server'
import { askClaudeForJSON } from '@/lib/ai/claude'
import {
  buildEventExtractionPrompt,
  validateEventExtraction,
  EventExtractionOutput,
} from '@/lib/ai/prompts/eventExtraction'

/**
 * POST /api/ai/extract-event
 * Extract event details from natural language input
 */
export async function POST(request: NextRequest) {
  try {
    // Check if NL event creation is enabled
    if (process.env.ENABLE_NL_EVENT_CREATION !== 'true') {
      return NextResponse.json(
        { error: 'Natural language event creation is not enabled' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { userInput } = body

    // Validate input
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid userInput field' },
        { status: 400 }
      )
    }

    if (userInput.trim().length < 10) {
      return NextResponse.json(
        { error: 'Input is too short. Please provide more details about your event.' },
        { status: 400 }
      )
    }

    if (userInput.length > 2000) {
      return NextResponse.json(
        { error: 'Input is too long. Please keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // Build extraction prompt
    const prompt = buildEventExtractionPrompt({ userInput })

    // Call Claude to extract event details
    const extractedData = await askClaudeForJSON<EventExtractionOutput>(prompt, {
      systemPrompt: 'You are an AI assistant specialized in extracting structured event information from natural language descriptions.',
      maxTokens: 1500,
    })

    // Validate extracted data
    const validatedData = validateEventExtraction(extractedData)

    // Return extracted event data
    return NextResponse.json({
      success: true,
      data: validatedData,
    })
  } catch (error: any) {
    console.error('Error extracting event details:', error)

    // Handle validation errors
    if (error.message?.includes('Invalid') || error.message?.includes('Missing')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to extract valid event details. Please provide more information.',
          details: error.message,
        },
        { status: 422 }
      )
    }

    // Handle Claude API errors
    if (error.message?.includes('Claude') || error.message?.includes('API')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is temporarily unavailable. Please try again or use manual entry.',
        },
        { status: 503 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract event details. Please try again.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/extract-event
 * Get API status
 */
export async function GET() {
  const isEnabled = process.env.ENABLE_NL_EVENT_CREATION === 'true'
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY

  return NextResponse.json({
    enabled: isEnabled,
    configured: hasApiKey,
    status: isEnabled && hasApiKey ? 'ready' : 'disabled',
  })
}
