'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';

interface UseEventsOptions {
  venueId?: string;
  status?: string;
  search?: string;
}

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const { venueId, status, search } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const url = `/api/events${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [venueId, status, search]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

// Hook to fetch a single event
interface UseEventResult {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvent(eventId: string | null): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}
