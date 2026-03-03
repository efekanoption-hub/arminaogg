const CACHE_NAME = 'armina-v1'
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
]

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    )
    self.clients.claim()
})

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone()
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
                return response
            })
            .catch(() => caches.match(event.request))
    )
})

// Push Notifications (Firebase FCM)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {}
    event.waitUntil(
        self.registration.showNotification(data.title || 'ARMİNA', {
            body: data.body || 'Yeni bildirim',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: data.url || '/' },
            requireInteraction: true,
            vibrate: [200, 100, 200],
        })
    )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    )
})
