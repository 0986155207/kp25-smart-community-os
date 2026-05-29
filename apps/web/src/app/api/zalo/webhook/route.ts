// ─── Zalo OA Webhook Handler ──────────────────────────────────
// Nhận event từ Zalo OA (follow, unfollow, message, ...) và lưu vào DB
// URL cần đăng ký trong Zalo Developer Dashboard:
//   {NEXT_PUBLIC_URL}/api/zalo/webhook

import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Xác thực webhook từ Zalo ─────────────────────────────────
// Zalo gửi GET request với query ?hub.challenge để verify
export function GET(req: NextRequest): NextResponse {
  const url       = req.nextUrl
  const challenge = url.searchParams.get('hub.challenge')
  const mode      = url.searchParams.get('hub.mode')
  const token     = url.searchParams.get('hub.verify_token')

  const verifyToken = process.env.ZALO_WEBHOOK_VERIFY_TOKEN ?? 'kp25_zalo_webhook'

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    console.log('[zalo-webhook] Xác thực thành công')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Xác thực thất bại' }, { status: 403 })
}

// ─── Loại event Zalo OA ───────────────────────────────────────
interface ZaloWebhookEvent {
  app_id:     string
  timestamp:  string
  event_name: string
  sender?:    { id: string; display_name?: string; avatar?: string }
  recipient?: { id: string }
  message?:   { msg_id: string; text?: string; attachments?: unknown[] }
  [key: string]: unknown
}

// ─── Xử lý event ─────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: ZaloWebhookEvent

  try {
    payload = (await req.json()) as ZaloWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Payload không hợp lệ' }, { status: 400 })
  }

  const svc = createServiceClient()

  // 1. Lưu raw event
  const { error: insertErr } = await svc
    .from('zalo_webhook_events')
    .insert({
      event_name: payload.event_name ?? 'UNKNOWN',
      payload,
      processed:  false,
    })

  if (insertErr) {
    console.error('[zalo-webhook] Lỗi lưu event:', insertErr.message)
    // Vẫn return 200 để Zalo không retry liên tục
  }

  // 2. Xử lý từng loại event
  try {
    const eventName = (payload.event_name ?? '').toLowerCase()

    // ── Follow OA ─────────────────────────────────────────────
    if (eventName === 'follow') {
      const userId      = payload.sender?.id
      const displayName = payload.sender?.display_name ?? null
      const avatar      = payload.sender?.avatar       ?? null

      if (userId) {
        await svc
          .from('zalo_subscribers')
          .upsert(
            {
              zalo_user_id:      userId,
              display_name:      displayName,
              avatar_url:        avatar,
              following:         true,
              last_interaction:  new Date().toISOString(),
            },
            { onConflict: 'zalo_user_id', ignoreDuplicates: false },
          )
      }
    }

    // ── Unfollow OA ───────────────────────────────────────────
    else if (eventName === 'unfollow') {
      const userId = payload.sender?.id
      if (userId) {
        await svc
          .from('zalo_subscribers')
          .update({ following: false, last_interaction: new Date().toISOString() })
          .eq('zalo_user_id', userId)
      }
    }

    // ── Nhận tin nhắn từ người dùng (inbound) ─────────────────
    else if (eventName === 'user_send_text' || eventName === 'user_send_image') {
      const userId  = payload.sender?.id
      const msgId   = payload.message?.msg_id ?? null
      const text    = payload.message?.text ?? ''
      const isImage = eventName === 'user_send_image'

      if (userId) {
        // Upsert subscriber (cập nhật last_interaction)
        await svc
          .from('zalo_subscribers')
          .upsert(
            {
              zalo_user_id:      userId,
              display_name:      payload.sender?.display_name ?? null,
              following:         true,
              last_interaction:  new Date().toISOString(),
            },
            { onConflict: 'zalo_user_id', ignoreDuplicates: false },
          )

        // Thêm vào hộp thư
        if (msgId) {
          await svc
            .from('zalo_messages')
            .upsert(
              {
                direction:    'INBOUND',
                zalo_user_id: userId,
                display_name: payload.sender?.display_name ?? null,
                noi_dung:     text || (isImage ? '[Hình ảnh]' : '[Tệp đính kèm]'),
                msg_id:       msgId,
                trang_thai:   'RECEIVED',
              },
              { onConflict: 'msg_id', ignoreDuplicates: true },
            )
        }
      }
    }

    // Đánh dấu event đã xử lý
    await svc
      .from('zalo_webhook_events')
      .update({ processed: true })
      .eq('payload->>event_name', payload.event_name)
      .order('created_at', { ascending: false })
      .limit(1)

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[zalo-webhook] Lỗi xử lý event:', msg)
  }

  // Zalo yêu cầu HTTP 200 trong vòng 5s
  return NextResponse.json({ ok: true })
}
