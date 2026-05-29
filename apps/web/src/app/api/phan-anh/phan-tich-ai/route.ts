/**
 * POST /api/phan-anh/phan-tich-ai
 * Phân tích ảnh phản ánh hiện trường bằng Gemini 2.5 Flash Vision
 * Input : { imageUrls: string[], moTa?: string }
 * Output: AIPhanTichResult (JSON)
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime     = 'nodejs'
export const maxDuration = 30

// ─── Kết quả phân tích AI ────────────────────────────────────
export interface AIPhanTichResult {
  loai:       'MOI_TRUONG' | 'HA_TANG' | 'AN_NINH' | 'GIAO_THONG' | 'CHIEU_SANG' | 'AN_SINH' | 'KHAC'
  mucDo:      'KHAN_CAP' | 'CAO' | 'TRUNG_BINH' | 'THAP'
  tieuDe:     string
  moTa:       string
  tomTat:     string
  tinhNang:   string[]
  deXuat:     string
  doTinCay:   number  // 0–100
}

// ─── Prompt phân tích ───────────────────────────────────────
const PHAN_TICH_PROMPT = `Bạn là AI hỗ trợ Ban quản lý Khu phố 25, Phường Long Trường, TP.HCM.

Nhiệm vụ: Phân tích hình ảnh hiện trường (và/hoặc mô tả kèm theo) để tự động phân loại và đánh giá vấn đề.

Các loại vấn đề có thể phân loại:
- MOI_TRUONG: Rác thải, ô nhiễm, vệ sinh môi trường, cống rãnh tắc nghẽn, mùi hôi
- HA_TANG: Đường xá hư hỏng, vỉa hè xuống cấp, cơ sở hạ tầng, thoát nước, xây dựng trái phép
- AN_NINH: An ninh trật tự, tụ tập gây mất trật tự, tệ nạn xã hội, nghi ngờ trộm cắp, đánh nhau
- GIAO_THONG: Ùn tắc, biển báo hỏng, lấn chiếm lòng lề đường, tai nạn, xe bỏ hoang
- CHIEU_SANG: Đèn đường hỏng, thiếu ánh sáng, đèn chập chờn, đường tối nguy hiểm
- AN_SINH: Người vô gia cư, người cần trợ giúp, trẻ em bị bỏ rơi, người già neo đơn
- KHAC: Các vấn đề khác không thuộc các loại trên

Mức độ ưu tiên:
- KHAN_CAP: Nguy hiểm tính mạng, ảnh hưởng nghiêm trọng, cần xử lý trong vòng 2 giờ
- CAO: Ảnh hưởng nhiều người, cần xử lý trong ngày
- TRUNG_BINH: Cần xử lý trong 3-7 ngày
- THAP: Có thể xử lý trong 30 ngày

Trả về JSON THUẦN TÚY (không có markdown, không có dấu \`\`\`), định dạng chính xác:
{
  "loai": "MOI_TRUONG",
  "mucDo": "TRUNG_BINH",
  "tieuDe": "Rác thải ứ đọng tại đầu đường số 5, khu vực chợ",
  "moTa": "Khu vực đầu đường số 5 tập kết rác thải sinh hoạt lộn xộn, không có thùng rác quy định. Rác tràn ra lòng đường gây cản trở giao thông và ô nhiễm mùi. Tình trạng này đã kéo dài nhiều ngày.",
  "tomTat": "Rác thải tràn ra lòng đường tại đầu đường số 5",
  "tinhNang": ["Rác thải sinh hoạt chưa được thu gom", "Tắc nghẽn lối đi", "Nguy cơ dịch bệnh"],
  "deXuat": "Liên hệ đội vệ sinh môi trường thu gom rác khẩn cấp và lắp đặt biển cấm đổ rác",
  "doTinCay": 88
}`

// ─── Fetch ảnh → base64 ──────────────────────────────────────
async function fetchImageBase64(
  url: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return null

    const buffer   = await res.arrayBuffer()
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg'
    const data     = Buffer.from(buffer).toString('base64')
    return { data, mimeType: mimeType.split(';')[0]! }
  } catch {
    return null
  }
}

// ─── Parse AI JSON với fallback ──────────────────────────────
function parseAIResult(raw: string): AIPhanTichResult | null {
  try {
    // Loại bỏ markdown code block nếu có
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    const parsed = JSON.parse(cleaned) as AIPhanTichResult
    // Validate fields
    if (!parsed.loai || !parsed.mucDo || !parsed.tieuDe) return null
    return {
      loai:      parsed.loai,
      mucDo:     parsed.mucDo,
      tieuDe:    parsed.tieuDe?.slice(0, 200)  ?? '',
      moTa:      parsed.moTa?.slice(0, 2000)   ?? '',
      tomTat:    parsed.tomTat?.slice(0, 300)  ?? '',
      tinhNang:  Array.isArray(parsed.tinhNang) ? parsed.tinhNang.slice(0, 5) : [],
      deXuat:    parsed.deXuat?.slice(0, 500)  ?? '',
      doTinCay:  Math.min(100, Math.max(0, Number(parsed.doTinCay) || 70)),
    }
  } catch {
    return null
  }
}

// ─── POST handler ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { imageUrls?: string[]; moTa?: string }
    const { imageUrls = [], moTa = '' } = body

    if (!imageUrls.length && !moTa) {
      return NextResponse.json(
        { success: false, message: 'Cần có ảnh hoặc mô tả để phân tích' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature:      0.2,
        topP:             0.8,
        maxOutputTokens:  1024,
        responseMimeType: 'application/json',
      },
    })

    // Chuẩn bị parts (tối đa 3 ảnh để tránh timeout)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = []

    const imagesToProcess = imageUrls.slice(0, 3)
    for (const url of imagesToProcess) {
      const img = await fetchImageBase64(url)
      if (img) {
        parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
      }
    }

    // Thêm mô tả của người dùng nếu có
    let promptText = PHAN_TICH_PROMPT
    if (moTa) {
      promptText += `\n\nMô tả của người phản ánh: "${moTa}"`
    }
    if (parts.length === 0) {
      promptText += '\n\nLưu ý: Không có ảnh, chỉ phân tích dựa trên mô tả văn bản.'
    }
    parts.push({ text: promptText })

    const result   = await model.generateContent(parts)
    const rawText  = result.response.text()
    const aiResult = parseAIResult(rawText)

    if (!aiResult) {
      return NextResponse.json(
        { success: false, message: 'AI không thể phân tích được ảnh này' },
        { status: 422 }
      )
    }

    return NextResponse.json({ success: true, data: aiResult })
  } catch (err) {
    console.error('[phan-tich-ai] Lỗi:', err)
    return NextResponse.json(
      { success: false, message: 'Lỗi phân tích AI. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
