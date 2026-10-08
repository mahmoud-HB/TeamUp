/**
 * Service Worker for push notifications and offline support
 * Handles background sync, push events, and app shell caching
 */

const CACHE_NAME = 'gamelink-v1'
const URLS_TO_CACHE = ['/', '/offline']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Network-first for API calls, cache-first for assets
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request))
  } else {
    event.respondWith(cacheFirst(event.request))
  }
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

async function networkFirst(request) {
  try {
    return await fetch(request)
  } catch (error) {
    return caches.match(request)
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  return fetch(request)
}
