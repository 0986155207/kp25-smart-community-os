import { NextRequest } from 'next/server'
import { timKiemSemantic } from '@/lib/rag'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 503 })
    }

    const { query } = (await req.json()) as { query?: string }
    if (!query?.trim()) {
      return Response.json({ error: 'Thiếu từ khoá tìm kiếm' }, { status: 400 })
    }

    const ketQua = await timKiemSemantic(query, 5, 0.4)

    return Response.json({
      success: true,
      results: ketQua.map(r => ({
        tieu_de:      r.tieuDe,
        so_hieu:      r.soHieu,
        loai:         r.loai,
        noi_dung:     r.noiDung,
        do_tuong_dong: Math.round(r.doTuongDong * 100),
      })),
    })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Lỗi máy chủ' },
      { status: 500 }
    )
  }
}
