import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { guiPushDaNhiet, daCoFirebaseAdmin } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // ── Xác thực ────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    if (!daCoFirebaseAdmin()) {
      return Response.json(
        { error: 'Chưa cấu hình Firebase Admin. Kiểm tra FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY trong .env.local' },
        { status: 503 }
      )
    }

    const { title, body, url, target_emails } = (await req.json()) as {
      title:          string
      body:           string
      url?:           string
      target_emails?: string[]   // undefined = gửi tất cả
    }

    if (!title?.trim() || !body?.trim()) {
      return Response.json({ error: 'Thiếu tiêu đề hoặc nội dung' }, { status: 400 })
    }

    // ── Lấy danh sách FCM tokens ─────────────────────────────
    const svc = createServiceClient()
    let query = svc
      .from('push_subscriptions')
      .select('fcm_token, email')
      .eq('active', true)

    if (target_emails && target_emails.length > 0) {
      query = query.in('email', target_emails)
    }

    const { data: subs, error: subErr } = await query
    if (subErr) return Response.json({ error: subErr.message }, { status: 500 })

    const tokens = (subs ?? []).map((s: { fcm_token: string }) => s.fcm_token)

    if (tokens.length === 0) {
      return Response.json({
        success:    true,
        thanh_cong: 0,
        loi:        0,
        message:    'Không có thiết bị nào đã đăng ký nhận thông báo',
      })
    }

    // ── Gửi push ────────────────────────────────────────────
    const ketQua = await guiPushDaNhiet({ tokens, title, body, url })

    // ── Deactivate token lỗi (không hợp lệ) ─────────────────
    if (ketQua.tokenLoi.length > 0) {
      await svc
        .from('push_subscriptions')
        .update({ active: false })
        .in('fcm_token', ketQua.tokenLoi)
    }

    // ── Ghi lịch sử ─────────────────────────────────────────
    await svc.from('push_lich_su').insert({
      tieu_de:      title,
      noi_dung:     body,
      url_dich:     url ?? '/dashboard',
      so_thiet_bi:  tokens.length,
      so_thanh_cong: ketQua.thanhCong,
      so_loi:       ketQua.loi,
      nguoi_gui:    user.email,
    })

    return Response.json({
      success:    true,
      thanh_cong: ketQua.thanhCong,
      loi:        ketQua.loi,
      tong:       tokens.length,
      message:    `Đã gửi ${ketQua.thanhCong}/${tokens.length} thiết bị thành công`,
    })
  } catch (err) {
    console.error('[Push Send]', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
