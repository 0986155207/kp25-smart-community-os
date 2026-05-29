import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nhungTaiLieu } from '@/lib/rag'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Tăng timeout cho quá trình nhúng nhiều chunks
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    // ── Xác thực ────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    // ── Lấy payload ─────────────────────────────────────────
    const { tai_lieu_id, noi_dung, tieu_de } = (await req.json()) as {
      tai_lieu_id: string
      noi_dung:    string
      tieu_de:     string
    }

    if (!tai_lieu_id || !tieu_de) {
      return Response.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 503 })
    }

    // ── Nhúng văn bản ────────────────────────────────────────
    const ketQua = await nhungTaiLieu(tai_lieu_id, noi_dung ?? '', tieu_de)

    if (!ketQua.success) {
      return Response.json({ error: ketQua.message }, { status: 500 })
    }

    return Response.json({
      success:   true,
      so_chunk:  ketQua.soChunk,
      message:   `Đã nhúng thành công ${ketQua.soChunk} đoạn văn bản`,
    })
  } catch (err) {
    console.error('[RAG Embed]', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
