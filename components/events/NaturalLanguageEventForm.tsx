'use client'

import { useState } from 'react'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface NaturalLanguageEventFormProps {
  onExtract: (data: any) => void
  onError?: (error: string) => void
}

export default function NaturalLanguageEventForm({
  onExtract,
  onError,
}: NaturalLanguageEventFormProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async () => {
    if (!input.trim()) {
      setError('Please describe your event')
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
        body: JSON.stringify({ userInput: input }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract event details')
      }

      if (result.success && result.data) {
        onExtract(result.data)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to extract event details'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleExtract()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="nl-input" className="block text-sm font-medium mb-2">
          Describe your event in natural language
        </label>
        <Textarea
          id="nl-input"
          placeholder="Example: I'm planning a wedding for 150 guests on July 15th, 2024. Budget is around $15,000. Need catering, DJ, and flowers. Venue is Grand Plaza Hotel."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          className="resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Include details like date, time, guest count, budget, venue, and what vendors you need.
          Press Ctrl+Enter to extract.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleExtract}
          disabled={isLoading || !input.trim()}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Extract Event Details
            </>
          )}
        </Button>

        {input && (
          <Button
            variant="outline"
            onClick={() => {
              setInput('')
              setError(null)
            }}
            disabled={isLoading}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Example descriptions:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            "Corporate holiday party on December 20th for 75 people. Budget $8,000. Need catering
            and AV setup."
          </li>
          <li>
            "Birthday celebration next Saturday at 6pm. Expecting 30 guests. Looking for a DJ and
            dessert catering."
          </li>
          <li>
            "Planning a conference on March 15-16, 2024 with 200 attendees. $25,000 budget. Need
            full AV, catering, and parking coordination."
          </li>
        </ul>
      </div>
    </div>
  )
}
