'use server'

import { KHU_PHO } from '@/lib/khu-pho'
import { createClient } from '@/lib/supabase/server'
import { coGeminiKey, SYSTEM_PROMPT, taoModel } from '@/lib/gemini'

// ─── Lấy ngữ cảnh cộng đồng để inject vào AI ────────────────
export async function layNguCanhAI(): Promise<string> {
  try {
    const supabase = await createClient()
    const now = new Date()
    const cutoffStr = new Date(now.getFullYear() - 60, now.getMonth(), now.getDate())
      .toISOString()
      .split('T')[0]!

    const [allHo, phanAnhMoi, phanAnhDangXuLy, phanAnhDaXuLy, caoTuoi] = await Promise.all([
      supabase.from('ho_dan').select('id, so_nhan_khau').is('deleted_at', null),
      supabase
        .from('phan_anh')
        .select('id', { count: 'exact', head: true })
        .eq('trang_thai', 'MOI')
        .is('deleted_at', null),
      supabase
        .from('phan_anh')
        .select('id', { count: 'exact', head: true })
        .eq('trang_thai', 'DANG_XU_LY')
        .is('deleted_at', null),
      supabase
        .from('phan_anh')
        .select('id', { count: 'exact', head: true })
        .eq('trang_thai', 'DA_XU_LY')
        .is('deleted_at', null),
      supabase
        .from('nhan_khau')
        .select('id', { count: 'exact', head: true })
        .not('ngay_sinh', 'is', null)
        .lte('ngay_sinh', cutoffStr)
        .is('deleted_at', null),
    ])

    const tongHo = allHo.data?.length ?? 0
    const tongNk = allHo.data?.reduce((s, h) => s + (h.so_nhan_khau ?? 0), 0) ?? 0

    const ngay = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    })

    return `Ngày hiện tại: ${ngay}
Đơn vị: ${KHU_PHO.ten}, Phường Long Trường, TP. Hồ Chí Minh
Tổng hộ dân: ${tongHo} hộ
Tổng nhân khẩu: ${tongNk} người
Người cao tuổi (từ 60 tuổi trở lên): ${caoTuoi.count ?? 0} người
Phản ánh mới chưa xử lý: ${phanAnhMoi.count ?? 0} vụ
Phản ánh đang xử lý: ${phanAnhDangXuLy.count ?? 0} vụ
Phản ánh đã xử lý: ${phanAnhDaXuLy.count ?? 0} vụ`
  } catch {
    return `Ngày: ${new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\nKhu phố: ${KHU_PHO.ten}, Phường Long Trường, TP.HCM`
  }
}

// ─── Tạo phân tích cộng đồng (non-streaming) ─────────────────
export async function taoPhantichCongDong(): Promise<{
  success: boolean
  baoCao: string
  message?: string
}> {
  if (!coGeminiKey()) {
    return { success: false, baoCao: '', message: 'Chưa cấu hình GEMINI_API_KEY' }
  }

  try {
    const supabase = await createClient()
    const now = new Date()
    const cutoffStr = new Date(now.getFullYear() - 60, now.getMonth(), now.getDate())
      .toISOString().split('T')[0]!

    // Thu thập dữ liệu đầy đủ
    const [
      allHo, soNam, soNu, caoTuoi,
      thuongTru, tamTru, tamVang,
      phanAnhMoi, phanAnhDang, phanAnhDa,
      phanAnhGanDay,
    ] = await Promise.all([
      supabase.from('ho_dan').select('id, so_nhan_khau').is('deleted_at', null),
      supabase.from('nhan_khau').select('id', { count: 'exact', head: true }).eq('gioi_tinh', 'NAM').is('deleted_at', null),
      supabase.from('nhan_khau').select('id', { count: 'exact', head: true }).eq('gioi_tinh', 'NU').is('deleted_at', null),
      supabase.from('nhan_khau').select('id', { count: 'exact', head: true }).not('ngay_sinh', 'is', null).lte('ngay_sinh', cutoffStr).is('deleted_at', null),
      supabase.from('ho_dan').select('id', { count: 'exact', head: true }).eq('trang_thai', 'THUONG_TRU').is('deleted_at', null),
      supabase.from('ho_dan').select('id', { count: 'exact', head: true }).eq('trang_thai', 'TAM_TRU').is('deleted_at', null),
      supabase.from('ho_dan').select('id', { count: 'exact', head: true }).eq('trang_thai', 'TAM_VANG').is('deleted_at', null),
      supabase.from('phan_anh').select('id', { count: 'exact', head: true }).eq('trang_thai', 'MOI').is('deleted_at', null),
      supabase.from('phan_anh').select('id', { count: 'exact', head: true }).eq('trang_thai', 'DANG_XU_LY').is('deleted_at', null),
      supabase.from('phan_anh').select('id', { count: 'exact', head: true }).eq('trang_thai', 'DA_XU_LY').is('deleted_at', null),
      supabase.from('phan_anh').select('tieu_de, loai, muc_do, trang_thai, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
    ])

    const tongHo = allHo.data?.length ?? 0
    const tongNk = allHo.data?.reduce((s, h) => s + (h.so_nhan_khau ?? 0), 0) ?? 0
    const tongPhanAnh = (phanAnhMoi.count ?? 0) + (phanAnhDang.count ?? 0) + (phanAnhDa.count ?? 0)
    const tyLeXuLy = tongPhanAnh > 0 ? Math.round(((phanAnhDa.count ?? 0) / tongPhanAnh) * 100) : 0

    const danhSachPhanAnh = (phanAnhGanDay.data ?? [])
      .map((p: Record<string, unknown>) => `- ${p.tieu_de} [${p.loai ?? 'chưa phân loại'}/${p.muc_do ?? 'thường'}/${p.trang_thai}]`)
      .join('\n')

    const duLieu = `
DU_LIEU_THONG_KE KHU_PHO_25 (${now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}):

DAN_CU:
- Tổng số hộ: ${tongHo} hộ
- Tổng nhân khẩu: ${tongNk} người
- Nam: ${soNam.count ?? 0} | Nữ: ${soNu.count ?? 0}
- Người cao tuổi (≥60 tuổi): ${caoTuoi.count ?? 0} người (${tongNk > 0 ? Math.round(((caoTuoi.count ?? 0) / tongNk) * 100) : 0}%)
- Thường trú: ${thuongTru.count ?? 0} hộ | Tạm trú: ${tamTru.count ?? 0} hộ | Tạm vắng: ${tamVang.count ?? 0} hộ

PHAN_ANH:
- Tổng phản ánh: ${tongPhanAnh} vụ
- Mới: ${phanAnhMoi.count ?? 0} | Đang xử lý: ${phanAnhDang.count ?? 0} | Đã xử lý: ${phanAnhDa.count ?? 0}
- Tỷ lệ xử lý: ${tyLeXuLy}%
- Phản ánh gần đây:
${danhSachPhanAnh || '(chưa có phản ánh)'}
`

    // systemInstruction đặt trong taoModel, prompt chỉ chứa dữ liệu + yêu cầu
    const model = taoModel()
    const prompt = `${duLieu}

Dựa trên dữ liệu trên, hãy tạo BÁO CÁO TỔNG HỢP TÌNH HÌNH KHU PHỐ bao gồm:

1. TỔNG QUAN TÌNH HÌNH
   (Nhận xét chung về quy mô dân cư, cơ cấu, tình trạng cư trú)

2. CƠ CẤU DÂN CƯ
   (Phân tích phân bố giới tính, người cao tuổi, tình trạng cư trú)

3. TÌNH HÌNH PHẢN ÁNH
   (Đánh giá số lượng, loại hình, mức độ xử lý phản ánh)

4. CẢNH BÁO VÀ LƯU Ý
   (Nêu các điểm cần chú ý, rủi ro tiềm ẩn)

5. KHUYẾN NGHỊ
   (Đề xuất 3-5 biện pháp cụ thể để cải thiện)

QUAN TRỌNG: Không dùng Markdown. Viết văn bản thuần, dùng số thứ tự, viết IN HOA cho tiêu đề phần.`

    const result = await model.generateContent(prompt)
    const baoCao = result.response.text()

    return { success: true, baoCao }
  } catch (err) {
    console.error('[taoPhantichCongDong]', err)
    return {
      success: false,
      baoCao: '',
      message: err instanceof Error ? err.message : 'Lỗi không xác định',
    }
  }
}

// ─── Phân loại phản ánh bằng AI ──────────────────────────────
export async function phanLoaiPhanAnh(
  tieuDe: string,
  moTa: string
): Promise<{
  loai: string
  mucDo: string
  tomTat: string
}> {
  if (!coGeminiKey()) return { loai: 'KHAC', mucDo: 'TRUNG_BINH', tomTat: '' }

  try {
    const model = taoModel()
    const prompt = `Phân loại phản ánh sau đây và trả về JSON:

Tiêu đề: ${tieuDe}
Mô tả: ${moTa}

Phân loại theo:
- loai: một trong [AN_NINH, MOI_TRUONG, CO_SO_HA_TANG, AN_SINH, HANH_CHINH, KHAC]
- mucDo: một trong [KHAN_CAP, CAO, TRUNG_BINH, THAP]
- tomTat: tóm tắt 1 câu ngắn gọn bằng tiếng Việt

Chỉ trả về JSON, không thêm gì khác. Ví dụ: {"loai":"AN_NINH","mucDo":"CAO","tomTat":"Vấn đề an ninh cần xử lý khẩn"}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as { loai: string; mucDo: string; tomTat: string }
  } catch {
    return { loai: 'KHAC', mucDo: 'TRUNG_BINH', tomTat: '' }
  }
}
