// ─── Zalo OA API v3 Client ────────────────────────────────────
// Tài liệu: https://developers.zalo.me/docs/official-account/tin-nhan
// Khi OA chưa được duyệt, mọi lệnh gọi API đều trả về lỗi ZALO_PENDING

const ZALO_API_BASE = 'https://openapi.zalo.me/v3.0'

// ─── Kiểm tra OA đã kích hoạt chưa ───────────────────────────
export function isZaloOAActive(): boolean {
  return (
    Boolean(process.env.ZALO_OA_ACCESS_TOKEN) &&
    process.env.ZALO_OA_STATUS !== 'PENDING'
  )
}

// ─── Headers chuẩn Zalo OA v3 ─────────────────────────────────
function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    access_token: process.env.ZALO_OA_ACCESS_TOKEN ?? '',
  }
}

// ─── Loại lỗi nội bộ ─────────────────────────────────────────
export type ZaloResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: number }

// ─── Gọi API Zalo (raw fetch) ─────────────────────────────────
async function callZalo<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<ZaloResult<T>> {
  if (!isZaloOAActive()) {
    return { ok: false, error: 'ZALO_PENDING: OA chưa được kích hoạt', code: -1 }
  }
  try {
    const res = await fetch(`${ZALO_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    })
    const json = (await res.json()) as { error?: number; message?: string; data?: T }
    if (json.error && json.error !== 0) {
      return {
        ok: false,
        error: json.message ?? `Zalo API error ${json.error}`,
        code: json.error,
      }
    }
    return { ok: true, data: (json.data ?? json) as T }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Fetch error: ${msg}` }
  }
}

// ─── 1. Gửi tin nhắn CS (Customer Support) đến 1 user ─────────
export interface ZaloCSMessage {
  /** Zalo user_id của người nhận */
  userId: string
  /** Nội dung text */
  text: string
  /** Ảnh đính kèm (URL public) */
  imageUrl?: string
}

export async function sendCSMessage(msg: ZaloCSMessage): Promise<ZaloResult<{ message_id: string }>> {
  const attachment = msg.imageUrl
    ? {
        type: 'template',
        payload: {
          template_type: 'media',
          elements: [{ media_type: 'image', url: msg.imageUrl }],
        },
      }
    : undefined

  return callZalo<{ message_id: string }>('/oa/message/cs', {
    recipient: { user_id: msg.userId },
    message: {
      text: msg.text,
      ...(attachment ? { attachment } : {}),
    },
  })
}

// ─── 2. Broadcast tin nhắn đến toàn bộ follower ───────────────
export interface ZaloBroadcastPayload {
  /** Tiêu đề (chỉ dùng để log) */
  title: string
  /** Nội dung text */
  text: string
  /** Template ID hoặc undefined khi gửi TEXT thuần */
  templateId?: string
}

export async function broadcastToFollowers(
  payload: ZaloBroadcastPayload,
): Promise<ZaloResult<{ broadcast_id: string }>> {
  return callZalo<{ broadcast_id: string }>('/oa/broadcast/followers', {
    recipient: { user_id_by_app: 'all' },
    message: {
      text: payload.text,
    },
  })
}

// ─── 3. Lấy thông tin follower từ Zalo user_id ───────────────
export interface ZaloUserInfo {
  user_id: string
  display_name: string
  avatar: string
  is_following: boolean
}

export async function getFollowerInfo(
  userId: string,
): Promise<ZaloResult<ZaloUserInfo>> {
  if (!isZaloOAActive()) {
    return { ok: false, error: 'ZALO_PENDING', code: -1 }
  }
  try {
    const res = await fetch(
      `${ZALO_API_BASE}/oa/getprofile?data=${encodeURIComponent(JSON.stringify({ user_id: userId }))}`,
      { headers: getHeaders(), signal: AbortSignal.timeout(10_000) },
    )
    const json = (await res.json()) as {
      error?: number
      message?: string
      data?: ZaloUserInfo
    }
    if (json.error && json.error !== 0) {
      return { ok: false, error: json.message ?? 'Lỗi lấy thông tin follower', code: json.error }
    }
    return { ok: true, data: json.data! }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── 4. Làm mới access_token (khi hết hạn) ───────────────────
export interface ZaloRefreshResult {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function refreshAccessToken(): Promise<ZaloResult<ZaloRefreshResult>> {
  const refreshToken = process.env.ZALO_OA_REFRESH_TOKEN
  const appId        = process.env.ZALO_APP_ID
  const appSecret    = process.env.ZALO_APP_SECRET

  if (!refreshToken || !appId || !appSecret) {
    return { ok: false, error: 'Thiếu ZALO_OA_REFRESH_TOKEN / ZALO_APP_ID / ZALO_APP_SECRET' }
  }

  try {
    const res = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: appSecret,
      },
      body: new URLSearchParams({
        app_id:        appId,
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const json = (await res.json()) as ZaloRefreshResult & { error?: number; message?: string }
    if (json.error) {
      return { ok: false, error: json.message ?? 'Lỗi làm mới token', code: json.error }
    }
    return { ok: true, data: json }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
