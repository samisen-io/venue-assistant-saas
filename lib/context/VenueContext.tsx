"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/types";

const STORAGE_KEY = "activeVenueId";

interface VenueContextValue {
  venues: Venue[];
  activeVenue: Venue | null;
  isLoading: boolean;
  setActiveVenue: (venue: Venue) => void;
  refreshVenues: () => Promise<void>;
}

const VenueContext = createContext<VenueContextValue | null>(null);

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [activeVenue, setActiveVenueState] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  const fetchAndSet = useCallback(async () => {
    try {
      const res = await fetch("/api/venues");
      if (!res.ok) return;
      const data: Venue[] = await res.json();
      setVenues(data);

      if (data.length === 0) {
        setActiveVenueState(null);
        return;
      }

      // Resolve active venue: localStorage → is_default → first
      const storedId = typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;

      const stored = storedId ? data.find((v) => v.id === storedId) : null;
      const defaultVenue = data.find((v) => (v as any).is_default) ?? data[0];
      const resolved = stored ?? defaultVenue;

      setActiveVenueState(resolved);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, resolved.id);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchAndSet();
  }, [fetchAndSet]);

  const setActiveVenue = useCallback((venue: Venue) => {
    setActiveVenueState(venue);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, venue.id);
    }
  }, []);

  const refreshVenues = useCallback(async () => {
    setIsLoading(true);
    await fetchAndSet();
  }, [fetchAndSet]);

  return (
    <VenueContext.Provider value={{ venues, activeVenue, isLoading, setActiveVenue, refreshVenues }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenueContext(): VenueContextValue {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error("useVenueContext must be used inside VenueProvider");
  return ctx;
}
