// ─── API: Gửi tin nhắn CS đến 1 người dùng Zalo ──────────────
// POST /api/zalo/send
// Body: { userId, text, imageUrl? }
// Chỉ dùng cho Admin (server-side) → không expose ra public

import { type NextRequest, NextResponse } from 'next/server'
import { createClient }         from '@/lib/supabase/server'
import { sendCSMessage }        from '@/lib/zalo/client'

export const runtime = 'nodejs'

interface SendBody {
  userId:     string
  text:       string
  imageUrl?:  string
  messageId?: string  // ID record trong zalo_messages để cập nhật trang_thai
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth: chỉ cán bộ
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  let body: SendBody
  try {
    body = (await req.json()) as SendBody
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 })
  }

  if (!body.userId || !body.text) {
    return NextResponse.json({ error: 'Thiếu userId hoặc text' }, { status: 400 })
  }

  // Gửi tin qua Zalo OA
  const result = await sendCSMessage({
    userId:   body.userId,
    text:     body.text,
    imageUrl: body.imageUrl,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error, code: result.code }, { status: 502 })
  }

  // Lưu tin nhắn outbound vào DB
  const { error: dbErr } = await supabase
    .from('zalo_messages')
    .insert({
      direction:      'OUTBOUND',
      zalo_user_id:   body.userId,
      noi_dung:       body.text,
      media_url:      body.imageUrl ?? null,
      msg_id:         result.data?.message_id ?? null,
      trang_thai:     'SENT',
      can_bo_rep_id:  user.id,
    })

  if (dbErr) {
    console.warn('[zalo/send] Lưu DB thất bại:', dbErr.message)
  }

  // Nếu đây là reply cho 1 message inbound, cập nhật trang_thai
  if (body.messageId) {
    await supabase
      .from('zalo_messages')
      .update({
        trang_thai:   'REPLIED',
        can_bo_rep_id: user.id,
        rep_noi_dung: body.text,
        rep_at:       new Date().toISOString(),
      })
      .eq('id', body.messageId)
  }

  return NextResponse.json({ ok: true, messageId: result.data?.message_id })
}
