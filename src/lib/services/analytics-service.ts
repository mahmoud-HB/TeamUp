import { isDemoMode } from '@/lib/config'

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

/**
 * Analytics service for tracking user behavior and events.
 * Integrates with Sentry, Vercel Analytics, or custom backend.
 * Demo mode: logs to console.
 */

export const analyticsService = {
  /**
   * Track page view
   */
  trackPageView(path: string, metadata?: Record<string, any>) {
    if (isDemoMode()) {
      console.log('[ANALYTICS] Page view:', path, metadata)
      return
    }

    // Send to Vercel Analytics
    if (typeof window !== 'undefined') {
      fetch('/_vercel/insights/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'pageview',
          path,
          ...metadata
        })
      }).catch(() => {})
    }
  },

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (isDemoMode()) {
      console.log('[ANALYTICS] Event:', eventName, properties)
      return
    }

    if (typeof window !== 'undefined') {
      fetch('/_vercel/insights/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          ...properties
        })
      }).catch(() => {})
    }
  },

  /**
   * Track user action (follow, apply, message, etc.)
   */
  trackUserAction(
    action: 'follow' | 'unfollow' | 'apply' | 'message' | 'like' | 'share',
    targetId: string,
    metadata?: Record<string, any>
  ) {
    if (isDemoMode()) {
      console.log('[ANALYTICS] User action:', action, targetId, metadata)
      return
    }

    this.trackEvent(`user_${action}`, {
      target_id: targetId,
      ...metadata
    })
  },

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    if (isDemoMode()) {
      console.log('[ANALYTICS] Performance:', metric, `${value}${unit}`)
      return
    }

    if (typeof window !== 'undefined') {
      fetch('/_vercel/insights/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `perf_${metric}`,
          value,
          unit
        })
      }).catch(() => {})
    }
  },

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const message = error instanceof Error ? error.message : String(error)

    if (isDemoMode()) {
      console.error('[ANALYTICS] Error:', message, context)
      return
    }

    // Send to Sentry or error tracking service
    if (typeof window !== 'undefined') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {})
    }
  }
}
