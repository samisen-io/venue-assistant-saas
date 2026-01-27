import { useState, useEffect } from 'react'
import { Space } from '@/lib/types'

/**
 * Hook to fetch all spaces for the current user's venue
 */
export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/spaces')

      if (!response.ok) {
        throw new Error('Failed to fetch spaces')
      }

      const data = await response.json()
      setSpaces(data)
    } catch (err) {
      console.error('Error fetching spaces:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  return {
    spaces,
    loading,
    error,
    refetch: fetchSpaces,
  }
}

/**
 * Hook to fetch a single space by ID
 */
export function useSpace(spaceId: string | null) {
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpace = async () => {
    if (!spaceId) {
      setSpace(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/spaces/${spaceId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch space')
      }

      const data = await response.json()
      setSpace(data)
    } catch (err) {
      console.error('Error fetching space:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch space')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpace()
  }, [spaceId])

  return {
    space,
    loading,
    error,
    refetch: fetchSpace,
  }
}
