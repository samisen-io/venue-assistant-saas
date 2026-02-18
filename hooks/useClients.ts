'use client'

import { useEffect, useState } from 'react'
import { Client, ClientCommunication, ClientWithEvents } from '@/lib/types'

interface UseClientsOptions {
  venueId?: string
  search?: string
}

interface UseClientsResult {
  clients: Array<Client & { event_count?: number }>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseClientResult {
  client: ClientWithEvents | null
  communications: ClientCommunication[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useClients(options: UseClientsOptions = {}): UseClientsResult {
  const { venueId, search } = options
  const [clients, setClients] = useState<Array<Client & { event_count?: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const headers: HeadersInit = {}
      if (venueId) headers['X-Venue-Id'] = venueId

      const url = `/api/clients${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [venueId, search])

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
  }
}

export function useClient(clientId?: string): UseClientResult {
  const [client, setClient] = useState<ClientWithEvents | null>(null)
  const [communications, setCommunications] = useState<ClientCommunication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClient = async () => {
    if (!clientId) return
    try {
      setLoading(true)
      setError(null)

      const [clientRes, commsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/communications`),
      ])

      if (!clientRes.ok) throw new Error('Failed to fetch client')

      const clientData = await clientRes.json()
      setClient(clientData)

      if (commsRes.ok) {
        const commsData = await commsRes.json()
        setCommunications(commsData)
      } else {
        setCommunications([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching client:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClient()
  }, [clientId])

  return {
    client,
    communications,
    loading,
    error,
    refetch: fetchClient,
  }
}
