// ─── API: Broadcast tin nhắn đến toàn bộ OA Followers ────────
// POST /api/zalo/broadcast
// Body: { broadcastId } — lấy nội dung từ zalo_broadcasts table
// Chỉ Admin kích hoạt, không expose public

import { type NextRequest, NextResponse } from 'next/server'
import { createClient }                    from '@/lib/supabase/server'
import { broadcastToFollowers, isZaloOAActive } from '@/lib/zalo/client'

export const runtime = 'nodejs'

interface BroadcastBody {
  broadcastId: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  let body: BroadcastBody
  try {
    body = (await req.json()) as BroadcastBody
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 })
  }

  if (!body.broadcastId) {
    return NextResponse.json({ error: 'Thiếu broadcastId' }, { status: 400 })
  }

  // Lấy bản ghi broadcast
  const { data: bc, error: fetchErr } = await supabase
    .from('zalo_broadcasts')
    .select('*')
    .eq('id', body.broadcastId)
    .single()

  if (fetchErr || !bc) {
    return NextResponse.json({ error: 'Không tìm thấy broadcast' }, { status: 404 })
  }

  if (bc.trang_thai === 'SENT') {
    return NextResponse.json({ error: 'Broadcast đã được gửi rồi' }, { status: 409 })
  }

  // Nếu OA chưa active, chỉ cho phép gửi Group (kenh=['GROUP'])
  const kenh: string[] = bc.kenh ?? []
  const guiOA    = kenh.includes('OA') && isZaloOAActive()
  const guiGroup = kenh.includes('GROUP')

  if (!guiOA && !guiGroup) {
    return NextResponse.json({ error: 'Không có kênh nào khả dụng để gửi' }, { status: 422 })
  }

  // Đánh dấu đang gửi
  await supabase
    .from('zalo_broadcasts')
    .update({ trang_thai: 'SENDING' })
    .eq('id', body.broadcastId)

  let broadcastZaloId: string | null = null
  let errMsg: string | null = null

  // ── Gửi qua OA ──────────────────────────────────────────────
  if (guiOA) {
    const oaResult = await broadcastToFollowers({
      title: bc.tieu_de,
      text:  bc.noi_dung,
    })

    if (!oaResult.ok) {
      errMsg = `OA: ${oaResult.error}`
    } else {
      broadcastZaloId = oaResult.data?.broadcast_id ?? null
    }
  }

  // ── Cập nhật trạng thái ──────────────────────────────────────
  const nowIso = new Date().toISOString()

  if (guiOA && errMsg) {
    await supabase
      .from('zalo_broadcasts')
      .update({
        trang_thai:    'FAILED',
        error_message: errMsg,
      })
      .eq('id', body.broadcastId)

    return NextResponse.json({ ok: false, error: errMsg }, { status: 502 })
  }

  // Thành công (OA hoặc Group)
  await supabase
    .from('zalo_broadcasts')
    .update({
      trang_thai: guiGroup && !guiOA ? 'COPIED' : 'SENT',
      sent_at:    guiOA ? nowIso : null,
      copied_at:  guiGroup ? nowIso : null,
    })
    .eq('id', body.broadcastId)

  return NextResponse.json({
    ok:            true,
    broadcastZaloId,
    kenhDaGui:     { oa: guiOA, group: guiGroup },
  })
}
