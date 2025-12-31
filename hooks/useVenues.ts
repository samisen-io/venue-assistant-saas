'use client';

import { useState, useEffect } from 'react';
import { Venue } from '@/lib/types';

interface UseVenuesResult {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVenues(): UseVenuesResult {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/venues');

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const data = await response.json();
      setVenues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return {
    venues,
    loading,
    error,
    refetch: fetchVenues,
  };
}
