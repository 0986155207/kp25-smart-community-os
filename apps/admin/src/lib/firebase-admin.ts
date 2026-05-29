// ─── Firebase Admin SDK ────────────────────────────────────────
// Chỉ dùng ở server (API routes, server actions)
// Runtime: nodejs (không dùng được ở edge)

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getMessaging, type MulticastMessage } from 'firebase-admin/messaging'

// ── Kiểm tra đã cấu hình ─────────────────────────────────────
export function daCoFirebaseAdmin(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}

// ── Singleton Admin App ────────────────────────────────────────
let adminApp: App | null = null

function getAdminApp(): App {
  if (!adminApp) {
    const existing = getApps()
    if (existing.length > 0) {
      adminApp = existing[0]!
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          // Env vars escape \n thành \\n, cần convert lại
          privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      })
    }
  }
  return adminApp
}

// ── Gửi push đến nhiều thiết bị ───────────────────────────────
export interface GuiPushPayload {
  tokens:   string[]        // Danh sách FCM tokens
  title:    string
  body:     string
  url?:     string          // Deep link khi click
  imageUrl?: string
}

export interface KetQuaGuiPush {
  thanhCong: number
  loi:       number
  tokenLoi:  string[]       // Tokens gửi thất bại (để xoá khỏi DB)
}

export async function guiPushDaNhiet(
  payload: GuiPushPayload
): Promise<KetQuaGuiPush> {
  if (!daCoFirebaseAdmin()) {
    throw new Error('Chưa cấu hình Firebase Admin (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)')
  }

  if (payload.tokens.length === 0) {
    return { thanhCong: 0, loi: 0, tokenLoi: [] }
  }

  const messaging = getMessaging(getAdminApp())

  // FCM multicast giới hạn 500 tokens/lần
  const BATCH = 500
  let tongThanhCong = 0
  let tongLoi = 0
  const tokenLoi: string[] = []

  for (let i = 0; i < payload.tokens.length; i += BATCH) {
    const batch = payload.tokens.slice(i, i + BATCH)

    const message: MulticastMessage = {
      tokens: batch,
      notification: {
        title:    payload.title,
        body:     payload.body,
        imageUrl: payload.imageUrl,
      },
      webpush: {
        notification: {
          title:   payload.title,
          body:    payload.body,
          icon:    '/icon-192.png',
          badge:   '/badge-72.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
          actions: [{ action: 'open', title: 'Xem ngay' }],
        },
        fcmOptions: {
          link: payload.url ?? '/dashboard',
        },
      },
      data: {
        url: payload.url ?? '/dashboard',
      },
    }

    try {
      const response = await messaging.sendEachForMulticast(message)

      tongThanhCong += response.successCount
      tongLoi       += response.failureCount

      // Collect failed tokens để deactivate
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = batch[idx]
          if (failedToken) tokenLoi.push(failedToken)
          console.warn('[FCM] Token lỗi:', resp.error?.code, batch[idx]?.slice(-10))
        }
      })
    } catch (err) {
      console.error('[FCM] Batch send error:', err)
      tongLoi += batch.length
    }
  }

  return { thanhCong: tongThanhCong, loi: tongLoi, tokenLoi }
}
