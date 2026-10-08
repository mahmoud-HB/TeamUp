/**
 * Push notification service for web notifications.
 * Integrates with Service Worker and FCM or similar.
 * Demo mode: shows browser notifications in dev.
 */

export const pushNotificationService = {
  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (isDemoMode()) {
      console.log('[DEMO] Requesting notification permission')
      return true
    }

    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  },

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (isDemoMode()) {
      console.log('[DEMO] Registering service worker')
      return null
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/sw.js',
          { scope: '/' }
        )
        console.log('Service Worker registered:', registration)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
      }
    }

    return null
  },

  /**
   * Show local notification
   */
  async showNotification(
    notification: PushNotification
  ): Promise<Notification | null> {
    if (isDemoMode()) {
      console.log('[DEMO] Showing notification:', notification)
      return null
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null
    }

    try {
      const swReg = await navigator.serviceWorker.ready
      swReg.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        tag: notification.tag || 'default',
        data: notification.data || {}
      })
      return null
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  },

  /**
   * Subscribe to push notifications (FCM)
   */
  async subscribeToPush(vapidPublicKey: string): Promise<string | null> {
    if (isDemoMode()) {
      console.log('[DEMO] Subscribing to push notifications')
      return `demo-subscription-${Date.now()}`
    }

    try {
      const swReg = await navigator.serviceWorker.ready
      const key = urlBase64ToUint8Array(vapidPublicKey)
      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key as BufferSource
      })
      return JSON.stringify(subscription)
    } catch (error) {
      console.error('Failed to subscribe to push:', error)
      return null
    }
  }
}

export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
}

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
