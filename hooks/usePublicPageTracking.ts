'use client'

import { useEffect, useRef } from 'react'

interface TrackingOptions {
  venueSlug: string
  sessionId?: string
}

export function usePublicPageTracking({ venueSlug, sessionId }: TrackingOptions) {
  const sessionIdRef = useRef(sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const trackingRef = useRef(new Set<string>())

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view')
  }, [venueSlug])

  const trackEvent = (eventType: string, metadata?: Record<string, any>) => {
    // Prevent duplicate events
    const key = `${eventType}_${JSON.stringify(metadata || {})}`
    if (trackingRef.current.has(key) && eventType !== 'scroll_depth') {
      return
    }
    trackingRef.current.add(key)

    fetch(`/api/venues/public/${venueSlug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        metadata,
        sessionId: sessionIdRef.current,
      }),
    }).catch((err) => console.error('Track error:', err))
  }

  const trackCTA = (buttonName: string) => {
    trackEvent('cta_click', { button_name: buttonName })
  }

  const trackGalleryView = (sectionName: string = 'Main Gallery') => {
    trackEvent('gallery_view', { section: sectionName })
  }

  const trackCalendarClick = (date: string) => {
    trackEvent('calendar_click', { date })
  }

  const trackChatOpen = () => {
    trackEvent('chat_opened')
  }

  const trackPhoneClick = () => {
    trackEvent('phone_click')
  }

  const trackEmailClick = () => {
    trackEvent('email_click')
  }

  const trackSocialClick = (platform: string) => {
    trackEvent('social_click', { platform })
  }

  // Setup scroll depth tracking
  useEffect(() => {
    const sections = ['Hero', 'Gallery', 'Details', 'Calendar', 'Contact', 'Testimonials', 'Footer']
    const scrollDepth: Record<string, number> = {}
    let lastReportedDepth = 0

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute('data-analytics-section')
          if (section) {
            scrollDepth[section] = entry.isIntersecting ? 100 : 0
          }
        })

        // Calculate and report scroll depth
        const visibleSections = Object.values(scrollDepth).filter((v) => v > 0).length
        const currentDepth = Math.round((visibleSections / sections.length) * 100)

        if (currentDepth > lastReportedDepth && currentDepth % 25 === 0) {
          trackEvent('scroll_depth', { 
            depth_percentage: currentDepth,
            visible_sections: Object.keys(scrollDepth).filter((k) => scrollDepth[k] > 0),
          })
          lastReportedDepth = currentDepth
        }
      },
      { threshold: 0.1 }
    )

    // Observe all sections
    const sectionElements = document.querySelectorAll('[data-analytics-section]')
    sectionElements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [])

  // Setup element click tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const trackingId = target.getAttribute('data-track-click')
      if (trackingId) {
        trackEvent('element_click', { element_id: trackingId })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return {
    trackEvent,
    trackCTA,
    trackGalleryView,
    trackCalendarClick,
    trackChatOpen,
    trackPhoneClick,
    trackEmailClick,
    trackSocialClick,
    sessionId: sessionIdRef.current,
  }
}
