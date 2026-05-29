import { NextRequest } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Service client (bypass RLS — server side only)
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Đăng ký FCM token (dân cư không cần tài khoản) ───────────
export async function POST(req: NextRequest) {
  try {
    const { fcm_token, device_name } = (await req.json()) as {
      fcm_token:    string
      device_name?: string
    }

    if (!fcm_token) {
      return Response.json({ error: 'Thiếu FCM token' }, { status: 400 })
    }

    const svc = getServiceClient()

    // Dùng email chung cho portal dân cư (không cần đăng nhập)
    const { error } = await svc
      .from('push_subscriptions')
      .upsert(
        {
          email:       'portal@kp25.local',
          fcm_token,
          device_name: device_name ?? 'Web Browser (Portal)',
          platform:    'web-portal',
          active:      true,
          last_seen:   new Date().toISOString(),
        },
        { onConflict: 'fcm_token' }
      )

    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true, message: 'Đã đăng ký nhận thông báo' })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}

// ── Huỷ đăng ký ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { fcm_token } = (await req.json()) as { fcm_token: string }
    if (!fcm_token) return Response.json({ error: 'Thiếu token' }, { status: 400 })

    const svc = getServiceClient()
    await svc
      .from('push_subscriptions')
      .update({ active: false })
      .eq('fcm_token', fcm_token)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
