// ================================================================
// KP25 Admin — Progressive Web App Service Worker
// Phiên bản: 1.0.0
// Chiến lược cache: Static (Cache-First) | API (Network-First) | Pages (SWR)
// ================================================================

const SW_VERSION  = 'kp25-admin-v1'
const CACHE_STATIC = `${SW_VERSION}-static`
const CACHE_PAGES  = `${SW_VERSION}-pages`
const CACHE_API    = `${SW_VERSION}-api`

// Tài nguyên cache ngay khi install (App Shell)
const APP_SHELL = [
  '/offline.html',
  '/manifest.webmanifest',
]

// Pattern URL cần cache
const STATIC_PATTERNS  = [/\/_next\/static\//, /\/icons\//, /\/fonts\//]
const API_PATTERNS     = [/\/api\//]
const EXCLUDE_PATTERNS = [
  /\/api\/auth\//,    // Auth không cache
  /\/api\/push\//,    // Push không cache
  /_next\/webpack-hmr/, // HMR dev
]

// ─── Install ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing KP25 Admin SW', SW_VERSION)
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())   // Activate ngay lập tức
  )
})

// ─── Activate ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating KP25 Admin SW', SW_VERSION)
  event.waitUntil(
    Promise.all([
      // Xoá cache cũ
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => k.startsWith('kp25-admin-') && k !== CACHE_STATIC && k !== CACHE_PAGES && k !== CACHE_API)
            .map(k => {
              console.log('[SW] Deleting old cache:', k)
              return caches.delete(k)
            })
        )
      ),
      // Kiểm soát tất cả client ngay
      self.clients.claim(),
    ])
  )
})

// ─── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Chỉ xử lý same-origin hoặc trusted external
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('supabase.co') &&
      !url.hostname.includes('googleapis.com') &&
      !url.hostname.includes('gstatic.com')) {
    return
  }

  // Bỏ qua các URL không cache
  if (EXCLUDE_PATTERNS.some(p => p.test(url.pathname))) return

  // ── Static assets: Cache-First ────────────────────────────
  if (STATIC_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }

  // ── API: Network-First (5s timeout → fallback cache) ─────
  if (API_PATTERNS.some(p => p.test(url.pathname)) && request.method === 'GET') {
    event.respondWith(networkFirst(request, CACHE_API, 5000))
    return
  }

  // ── Navigation (HTML pages): Stale-While-Revalidate ──────
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_PAGES, 4000)
        .catch(() => caches.match('/offline.html').then(r => r ?? fetch(request)))
    )
    return
  }

  // ── Mọi thứ còn lại: Network-First ───────────────────────
  event.respondWith(networkFirst(request, CACHE_PAGES, 8000))
})

// ─── Strategies ───────────────────────────────────────────────

/** Cache-First: Trả từ cache; nếu miss → fetch + lưu vào cache */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Không có cache', { status: 503 })
  }
}

/** Network-First: Thử fetch trước; nếu timeout/fail → trả từ cache */
async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName)

  try {
    const networkResponse = await Promise.race([
      fetch(request.clone()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      ),
    ])

    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached

    // Fallback cho navigation
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html')
      if (offline) return offline
    }

    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Không có kết nối mạng' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ─── Background Sync ──────────────────────────────────────────
// Đồng bộ dữ liệu khi có mạng trở lại
self.addEventListener('sync', (event) => {
  if (event.tag === 'kp25-sync') {
    console.log('[SW] Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // TODO: Đọc từ IndexedDB và gửi các request bị pending
  console.log('[SW] Background sync completed')
}

// ─── Message handler ──────────────────────────────────────────
// Nhận lệnh từ main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data ?? {}

  switch (type) {
    case 'SKIP_WAITING':
      // Khi user xác nhận cập nhật phiên bản mới
      self.skipWaiting()
      break

    case 'CLEAR_CACHE':
      // Xoá cache theo tên
      caches.delete(payload?.cacheName ?? CACHE_API)
        .then(() => console.log('[SW] Cache cleared:', payload?.cacheName))
      break

    case 'CACHE_URLS':
      // Cache thủ công một số URL
      if (Array.isArray(payload?.urls)) {
        caches.open(CACHE_PAGES).then(cache => cache.addAll(payload.urls))
      }
      break

    case 'GET_VERSION':
      event.source?.postMessage({ type: 'SW_VERSION', version: SW_VERSION })
      break
  }
})

// ─── Push Notification (fallback nếu firebase-messaging-sw bị skip) ──
self.addEventListener('push', (event) => {
  // Nếu Firebase SW đang xử lý thì không làm gì
  if (self.registration.scope.includes('firebase-messaging-sw')) return

  try {
    const data   = event.data?.json() ?? {}
    const title  = data.notification?.title ?? data.title ?? 'KP25 Smart Community'
    const body   = data.notification?.body  ?? data.body  ?? ''
    const icon   = data.notification?.icon  ?? '/icons/icon-192x192.png'
    const badge  = '/icons/badge-72.png'
    const urlDich = data.data?.url ?? '/dashboard'

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon,
        badge,
        tag:      'kp25-notification',
        renotify: true,
        vibrate:  [200, 100, 200],
        data:     { url: urlDich },
        actions:  [
          { action: 'open',    title: 'Xem ngay' },
          { action: 'dismiss', title: 'Bỏ qua'  },
        ],
      })
    )
  } catch (e) {
    console.error('[SW] Push error:', e)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const urlDich = event.notification.data?.url ?? '/dashboard'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            if ('navigate' in client) client.navigate(urlDich)
            return
          }
        }
        if (clients.openWindow) return clients.openWindow(urlDich)
      })
  )
})

console.log('[SW] KP25 Admin Service Worker loaded —', SW_VERSION)
