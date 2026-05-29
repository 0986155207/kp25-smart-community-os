'use client'

// ─── Firebase Client SDK ────────────────────────────────────────
// Chỉ dùng ở client components ('use client')

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

// ── Config từ env (NEXT_PUBLIC_* = safe to expose) ────────────
export const FIREBASE_CONFIG = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              ?? '',
}

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

// ── Kiểm tra đã cấu hình chưa ─────────────────────────────────
export function daCoFirebaseConfig(): boolean {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.messagingSenderId &&
    VAPID_KEY
  )
}

// ── Singleton Firebase App ────────────────────────────────────
let app:       FirebaseApp | null = null
let messaging: Messaging   | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0
      ? initializeApp(FIREBASE_CONFIG)
      : getApps()[0]!
  }
  return app
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null
  try {
    if (!messaging) messaging = getMessaging(getFirebaseApp())
    return messaging
  } catch { return null }
}

// ── Đăng ký Service Worker + inject Firebase config ───────────
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    })

    // Đợi SW active
    await navigator.serviceWorker.ready

    // Inject Firebase config vào SW
    const sw = reg.active ?? reg.installing ?? reg.waiting
    sw?.postMessage({ type: 'FIREBASE_CONFIG', config: FIREBASE_CONFIG })

    return reg
  } catch (err) {
    console.error('[FCM] Đăng ký SW thất bại:', err)
    return null
  }
}

// ── Xin quyền và lấy FCM token ────────────────────────────────
export async function layFCMToken(): Promise<{
  token:   string | null
  error?:  string
  denied?: boolean
}> {
  if (!daCoFirebaseConfig()) {
    return { token: null, error: 'Chưa cấu hình Firebase. Kiểm tra .env.local' }
  }

  if (!('Notification' in window)) {
    return { token: null, error: 'Trình duyệt không hỗ trợ thông báo' }
  }

  // Xin quyền
  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') {
    return { token: null, denied: true, error: 'Người dùng từ chối quyền thông báo' }
  }

  try {
    await registerServiceWorker()

    const msg = getFirebaseMessaging()
    if (!msg) return { token: null, error: 'Không khởi tạo được Firebase Messaging' }

    const token = await getToken(msg, { vapidKey: VAPID_KEY })
    if (!token) return { token: null, error: 'Không lấy được FCM token' }

    return { token }
  } catch (err) {
    console.error('[FCM] Lỗi lấy token:', err)
    return { token: null, error: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Lắng nghe thông báo khi app đang mở (foreground) ─────────
export function langNghePushForeground(
  callback: (payload: { title: string; body: string; url?: string }) => void
): () => void {
  const msg = getFirebaseMessaging()
  if (!msg) return () => {}

  const unsubscribe = onMessage(msg, (payload) => {
    const n = payload.notification ?? {}
    callback({
      title: n.title ?? 'KP25',
      body:  n.body  ?? '',
      url:   (payload.data?.['url'] as string | undefined) ?? '/dashboard',
    })
  })

  return unsubscribe
}
