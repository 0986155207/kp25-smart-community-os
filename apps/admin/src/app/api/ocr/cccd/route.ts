import { NextRequest } from 'next/server'
import { coGeminiKey, taoModel } from '@/lib/gemini'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ─── Prompt trích xuất CCCD ──────────────────────────────────
const OCR_PROMPT = `Bạn là hệ thống OCR chuyên đọc Căn cước công dân (CCCD) Việt Nam.
Hãy đọc kỹ ảnh và trích xuất các thông tin sau, trả về DUY NHẤT một object JSON hợp lệ (không kèm giải thích, không markdown):

{
  "ho_ten": "Họ và tên đầy đủ (viết hoa đúng chuẩn)",
  "cccd": "Số CCCD (chỉ chữ số, 12 số)",
  "ngay_sinh": "Ngày sinh định dạng YYYY-MM-DD",
  "gioi_tinh": "NAM hoặc NU",
  "quoc_tich": "Quốc tịch",
  "dan_toc": "Dân tộc (nếu có)",
  "que_quan": "Quê quán / Nguyên quán đầy đủ",
  "noi_thuong_tru": "Nơi thường trú đầy đủ",
  "cccd_ngay_cap": "Ngày cấp định dạng YYYY-MM-DD (nếu thấy ở mặt sau)",
  "cccd_noi_cap": "Nơi cấp (nếu thấy)"
}

QUY TẮC:
- Nếu trường nào không đọc được hoặc không có trong ảnh, để giá trị là null.
- Ngày tháng phải đúng định dạng YYYY-MM-DD.
- Số CCCD chỉ gồm chữ số, bỏ mọi khoảng trắng.
- gioi_tinh chỉ được là "NAM" hoặc "NU".
- KHÔNG bịa thông tin. Chỉ trích xuất những gì đọc được từ ảnh.`

export async function POST(req: NextRequest) {
  if (!coGeminiKey()) {
    return Response.json({ success: false, error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 503 })
  }

  try {
    const { image, mimeType } = (await req.json()) as { image?: string; mimeType?: string }

    if (!image) {
      return Response.json({ success: false, error: 'Thiếu ảnh CCCD' }, { status: 400 })
    }

    // Loại bỏ prefix data:image/...;base64, nếu có
    const base64 = image.includes(',') ? image.split(',')[1]! : image
    const mime = mimeType || (image.startsWith('data:') ? image.slice(5, image.indexOf(';')) : 'image/jpeg')

    const model = taoModel('Bạn là hệ thống OCR đọc giấy tờ tùy thân chính xác.')

    const result = await model.generateContent([
      OCR_PROMPT,
      { inlineData: { data: base64, mimeType: mime } },
    ])

    const text = result.response.text()

    // Trích JSON từ phản hồi
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ success: false, error: 'Không đọc được thông tin từ ảnh. Vui lòng chụp rõ nét hơn.' }, { status: 422 })
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return Response.json({ success: false, error: 'Lỗi phân tích dữ liệu. Vui lòng thử lại.' }, { status: 422 })
    }

    // Chuẩn hóa output
    const clean = (v: unknown): string | null => {
      if (v === null || v === undefined) return null
      const s = String(v).trim()
      return s === '' || s.toLowerCase() === 'null' ? null : s
    }

    const data = {
      ho_ten:        clean(parsed['ho_ten']),
      cccd:          clean(parsed['cccd'])?.replace(/\D/g, '') ?? null,
      ngay_sinh:     clean(parsed['ngay_sinh']),
      gioi_tinh:     clean(parsed['gioi_tinh'])?.toUpperCase() === 'NU' ? 'NU' : clean(parsed['gioi_tinh']) ? 'NAM' : null,
      quoc_tich:     clean(parsed['quoc_tich']) ?? 'Việt Nam',
      dan_toc:       clean(parsed['dan_toc']),
      nguyen_quan:   clean(parsed['que_quan']),
      noi_sinh:      clean(parsed['que_quan']),  // CCCD thường ghi quê quán
      dia_chi_thuong_tru: clean(parsed['noi_thuong_tru']),
      cccd_ngay_cap: clean(parsed['cccd_ngay_cap']),
      cccd_noi_cap:  clean(parsed['cccd_noi_cap']),
    }

    return Response.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[OCR CCCD]', msg)
    if (msg.includes('API_KEY') || msg.includes('403')) {
      return Response.json({ success: false, error: 'GEMINI_API_KEY không hợp lệ' }, { status: 503 })
    }
    return Response.json({ success: false, error: `Lỗi xử lý ảnh: ${msg}` }, { status: 500 })
  }
}
