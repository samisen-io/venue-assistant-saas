import { useState } from 'react'
import { EventExtractionOutput } from '@/lib/ai/prompts/eventExtraction'

interface UseEventExtractionOptions {
  onSuccess?: (data: EventExtractionOutput) => void
  onError?: (error: string) => void
}

interface UseEventExtractionReturn {
  extractedData: EventExtractionOutput | null
  isLoading: boolean
  error: string | null
  extractEvent: (userInput: string) => Promise<void>
  reset: () => void
}

/**
 * Custom hook for extracting event details from natural language input
 */
export function useEventExtraction(
  options?: UseEventExtractionOptions
): UseEventExtractionReturn {
  const [extractedData, setExtractedData] = useState<EventExtractionOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractEvent = async (userInput: string) => {
    if (!userInput.trim()) {
      setError('Please provide event details')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/extract-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract event details')
      }

      if (result.success && result.data) {
        setExtractedData(result.data)
        options?.onSuccess?.(result.data)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to extract event details'
      setError(errorMessage)
      options?.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setExtractedData(null)
    setError(null)
  }

  return {
    extractedData,
    isLoading,
    error,
    extractEvent,
    reset,
  }
}

/**
 * Check if natural language event creation is enabled
 */
export async function checkNLEventCreationStatus(): Promise<{
  enabled: boolean
  configured: boolean
  status: 'ready' | 'disabled'
}> {
  try {
    const response = await fetch('/api/ai/extract-event')
    if (!response.ok) {
      return { enabled: false, configured: false, status: 'disabled' }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error checking NL event creation status:', error)
    return { enabled: false, configured: false, status: 'disabled' }
  }
}
