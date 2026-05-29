import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { fcm_token, device_name } = (await req.json()) as {
      fcm_token:   string
      device_name?: string
    }

    if (!fcm_token) {
      return Response.json({ error: 'Thiếu FCM token' }, { status: 400 })
    }

    const svc = createServiceClient()

    // Upsert token (insert hoặc cập nhật nếu đã tồn tại)
    const { error } = await svc
      .from('push_subscriptions')
      .upsert(
        {
          email:       user.email,
          fcm_token,
          device_name: device_name ?? 'Web Browser',
          platform:    'web',
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

export async function DELETE(req: NextRequest) {
  try {
    const { fcm_token } = (await req.json()) as { fcm_token: string }
    if (!fcm_token) return Response.json({ error: 'Thiếu token' }, { status: 400 })

    const svc = createServiceClient()
    await svc.from('push_subscriptions').update({ active: false }).eq('fcm_token', fcm_token)

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
