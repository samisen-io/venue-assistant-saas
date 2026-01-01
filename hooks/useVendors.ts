'use client';

import { useState, useEffect } from 'react';
import { Vendor } from '@/lib/types';

interface UseVendorsOptions {
  venueId?: string;
  category?: string;
  search?: string;
}

interface UseVendorsResult {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVendors(options: UseVendorsOptions = {}): UseVendorsResult {
  const { venueId, category, search } = options;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (venueId) params.append('venueId', venueId);
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const url = `/api/vendors${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [venueId, category, search]);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors,
  };
}
