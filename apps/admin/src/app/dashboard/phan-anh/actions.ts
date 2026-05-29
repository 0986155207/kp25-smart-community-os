'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { coGeminiKey, taoModel } from '@/lib/gemini'
import { aiPhanTichVaTaoWorkflow } from '../workflow/actions'
import { thongBaoKetQuaXuLy } from '@/lib/notifications/phan-anh'
import { ghiAuditLog } from '@/lib/audit'

// ─── Tạo phản ánh mới ────────────────────────────────────────
export async function taoMoiPhanAnh(
  formData: FormData
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const supabase = await createClient()

    const tieuDe = (formData.get('tieuDe') as string)?.trim()
    if (!tieuDe) return { success: false, message: 'Vui lòng nhập tiêu đề phản ánh' }

    const moTa = (formData.get('moTa') as string)?.trim()
    if (!moTa) return { success: false, message: 'Vui lòng nhập mô tả chi tiết' }

    const latStr = (formData.get('toaDoLat') as string)?.trim()
    const lngStr = (formData.get('toaDoLng') as string)?.trim()
    const toaDoLat = latStr ? parseFloat(latStr) : null
    const toaDoLng = lngStr ? parseFloat(lngStr) : null

    // Media URLs đã upload từ client
    const anhUrls   = formData.getAll('anhUrls')  .map(u => String(u)).filter(Boolean)
    const videoUrls = formData.getAll('videoUrls').map(u => String(u)).filter(Boolean)

    const { data, error } = await supabase
      .from('phan_anh')
      .insert({
        tieu_de: tieuDe,
        mo_ta: moTa,
        loai: (formData.get('loai') as string) || 'KHAC',
        muc_do: (formData.get('mucDo') as string) || 'TRUNG_BINH',
        trang_thai: 'MOI',
        dia_chi_phan_anh: (formData.get('diaChiPhanAnh') as string)?.trim() || null,
        nguoi_gui_ten: (formData.get('nguoiGuiTen') as string)?.trim() || null,
        nguoi_gui_sdt: (formData.get('nguoiGuiSdt') as string)?.trim() || null,
        tom_tat_ai: (formData.get('tomTatAI') as string)?.trim() || null,
        toa_do_lat: toaDoLat,
        toa_do_lng: toaDoLng,
        anh_urls:   anhUrls.length   > 0 ? anhUrls   : [],
        video_urls: videoUrls.length > 0 ? videoUrls : [],
      })
      .select('id')
      .single()

    if (error) {
      console.error('[taoMoiPhanAnh]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    revalidatePath('/dashboard/phan-anh')
    revalidatePath('/dashboard/workflow')

    // ─ Tự động kích hoạt AI phân tích & tạo workflow (fire-and-forget)
    aiPhanTichVaTaoWorkflow(data.id).catch(e => console.warn('[autoWorkflow]', e))

    return { success: true, message: 'Đã tạo phản ánh thành công', id: data.id }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── AI phân loại phản ánh ────────────────────────────────────
export async function aiPhanLoai(
  tieuDe: string,
  moTa: string
): Promise<{ success: boolean; loai: string; mucDo: string; tomTat: string; message?: string }> {
  if (!coGeminiKey()) {
    return { success: false, loai: 'KHAC', mucDo: 'TRUNG_BINH', tomTat: '', message: 'Chưa cấu hình AI' }
  }
  try {
    const model = taoModel(
      'Bạn là hệ thống phân loại phản ánh của Khu phố 25. Chỉ trả về JSON, không thêm văn bản nào khác.'
    )
    const prompt = `Phân loại phản ánh sau:
Tiêu đề: ${tieuDe}
Mô tả: ${moTa}

Trả về JSON với:
- loai: một trong [AN_NINH, MOI_TRUONG, CO_SO_HA_TANG, AN_SINH, GIAO_THONG, KHAC]
- mucDo: một trong [KHAN_CAP, CAO, TRUNG_BINH, THAP]
- tomTat: tóm tắt ngắn 1 câu bằng tiếng Việt (không dùng Markdown)

Ví dụ: {"loai":"MOI_TRUONG","mucDo":"TRUNG_BINH","tomTat":"Rác thải bị vứt trái phép gây mất vệ sinh khu vực."}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text) as { loai: string; mucDo: string; tomTat: string }
    return { success: true, ...parsed }
  } catch (err) {
    return { success: false, loai: 'KHAC', mucDo: 'TRUNG_BINH', tomTat: '', message: 'AI không phân loại được' }
  }
}

// ─── AI tư vấn cách xử lý phản ánh ──────────────────────────
export async function aiTuVanXuLy(
  tieuDe: string,
  moTa: string,
  loai: string,
  mucDo: string,
  diaChiPhanAnh: string
): Promise<{ success: boolean; tuVan: string; message?: string }> {
  if (!coGeminiKey()) {
    return { success: false, tuVan: '', message: 'Chưa cấu hình AI' }
  }
  try {
    const model = taoModel()
    const LOAI_MAP: Record<string, string> = {
      AN_NINH: 'An ninh trật tự', MOI_TRUONG: 'Môi trường',
      CO_SO_HA_TANG: 'Cơ sở hạ tầng', AN_SINH: 'An sinh xã hội',
      GIAO_THONG: 'Giao thông', KHAC: 'Khác',
    }
    const MUC_DO_MAP: Record<string, string> = {
      KHAN_CAP: 'Khẩn cấp', CAO: 'Cao', TRUNG_BINH: 'Trung bình', THAP: 'Thấp',
    }
    const prompt = `Phân tích và tư vấn xử lý phản ánh sau tại Khu phố 25, Phường Long Trường, TP.HCM:

Tiêu đề: ${tieuDe}
Mô tả: ${moTa}
Loại: ${LOAI_MAP[loai] ?? loai}
Mức độ ưu tiên: ${MUC_DO_MAP[mucDo] ?? mucDo}
Địa điểm: ${diaChiPhanAnh || 'Không rõ'}

Hãy tư vấn cụ thể bao gồm:
1. ĐÁNH GIÁ: Nhận định ngắn gọn về mức độ nghiêm trọng
2. ĐƠN VỊ PHỤ TRÁCH ĐỀ XUẤT: Bộ phận hoặc cơ quan nên xử lý
3. CÁC BƯỚC XỬ LÝ: 3-4 bước cụ thể
4. THỜI HẠN ĐỀ XUẤT: Thời gian hoàn thành phù hợp
5. LƯU Ý: Điểm cần chú ý đặc biệt (nếu có)

KHÔNG dùng Markdown. Viết văn bản thuần, IN HOA cho tiêu đề phần, xuống dòng phân cách.`

    const result = await model.generateContent(prompt)
    return { success: true, tuVan: result.response.text() }
  } catch (err) {
    return { success: false, tuVan: '', message: err instanceof Error ? err.message : 'Lỗi AI' }
  }
}

// ─── AI soạn kết quả xử lý ───────────────────────────────────
export async function aiSoanKetQua(
  tieuDe: string,
  moTa: string,
  loai: string
): Promise<{ success: boolean; ketQua: string; message?: string }> {
  if (!coGeminiKey()) {
    return { success: false, ketQua: '', message: 'Chưa cấu hình AI' }
  }
  try {
    const model = taoModel()
    const prompt = `Soạn thảo văn bản KẾT QUẢ XỬ LÝ phản ánh sau đây theo phong cách hành chính Việt Nam:

Phản ánh: ${tieuDe}
Mô tả: ${moTa}
Loại: ${loai}

Yêu cầu:
- Xác nhận đã tiếp nhận và xử lý
- Mô tả biện pháp đã thực hiện (hợp lý với loại phản ánh)
- Kết luận và cam kết theo dõi
- Ngắn gọn, chuyên nghiệp, khoảng 3-4 câu
- KHÔNG dùng Markdown`

    const result = await model.generateContent(prompt)
    return { success: true, ketQua: result.response.text() }
  } catch (err) {
    return { success: false, ketQua: '', message: err instanceof Error ? err.message : 'Lỗi AI' }
  }
}

export async function capNhatTrangThai(
  id: string,
  trangThai: string,
  ketQuaXuLy: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      trang_thai: trangThai,
      ket_qua_xu_ly: ketQuaXuLy.trim() || null,
    }

    // Ghi lại thời điểm hoàn thành xử lý
    if (trangThai === 'DA_XU_LY' || trangThai === 'DONG') {
      updateData['thoi_gian_xu_ly'] = new Date().toISOString()
    } else {
      updateData['thoi_gian_xu_ly'] = null
    }

    const { error } = await supabase
      .from('phan_anh')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/phan-anh')
    revalidatePath(`/dashboard/phan-anh/${id}`)

    // Gửi thông báo kết quả đến người dân & admin (fire-and-forget)
    if (trangThai === 'DA_XU_LY' || trangThai === 'DONG') {
      thongBaoKetQuaXuLy(id, trangThai, ketQuaXuLy).catch(err =>
        console.error('[capNhatTrangThai] Lỗi gửi thông báo:', err)
      )
    }

    // Ghi nhật ký audit
    const TRANG_THAI_LABEL: Record<string, string> = {
      MOI: 'Mới', DANG_XU_LY: 'Đang xử lý', DA_XU_LY: 'Đã xử lý', DONG: 'Đã đóng', CHO_PHAN_HOI: 'Chờ phản hồi',
    }
    ghiAuditLog({
      hanh_dong:   'CAP_NHAT',
      bang:        'phan_anh',
      ban_ghi_id:  id,
      mo_ta:       `Cập nhật trạng thái phản ánh → ${TRANG_THAI_LABEL[trangThai] ?? trangThai}${ketQuaXuLy ? `: ${ketQuaXuLy.slice(0, 60)}` : ''}`,
      gia_tri_moi: { trang_thai: trangThai, ket_qua_xu_ly: ketQuaXuLy || null },
    }).catch(() => {})

    return { success: true, message: 'Cập nhật trạng thái thành công' }
  } catch (error) {
    console.error('capNhatTrangThai error:', error)
    return { success: false, message: 'Không thể cập nhật. Vui lòng thử lại.' }
  }
}

// ─── Xoá mềm 1 phản ánh ──────────────────────────────────────
export async function xoaPhanAnh(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    // Dùng SECURITY DEFINER function để bypass RLS conflict
    // (UPDATE set deleted_at vi phạm SELECT policy USING deleted_at IS NULL)
    const { data, error } = await supabase
      .rpc('xoa_mem_phan_anh', { p_id: id })

    if (error) {
      console.error('[xoaPhanAnh] RPC error:', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message} (${error.code})` }
    }

    if (!data) {
      return { success: false, message: 'Không thể xoá — phản ánh chưa được xử lý xong hoặc đã bị xoá trước đó.' }
    }

    revalidatePath('/dashboard/phan-anh')
    ghiAuditLog({ hanh_dong: 'XOA', bang: 'phan_anh', ban_ghi_id: id, mo_ta: `Xóa phản ánh #${id.slice(0, 8)}` }).catch(() => {})
    return { success: true, message: 'Đã xoá phản ánh thành công' }
  } catch (err) {
    console.error('[xoaPhanAnh] Unexpected error:', err)
    return { success: false, message: 'Không thể xoá. Vui lòng thử lại.' }
  }
}

// ─── Xoá + redirect (dùng trong detail page) ─────────────────
export async function xoaPhanAnhVaRedirect(id: string) {
  const result = await xoaPhanAnh(id)
  if (result.success) redirect('/dashboard/phan-anh')
  return result
}

// ─── Xoá hàng loạt DA_XU_LY + DONG ──────────────────────────
export async function xoaHetDaXuLy(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const supabase = await createClient()

    // Dùng SECURITY DEFINER function để bypass RLS conflict
    const { data, error } = await supabase
      .rpc('xoa_mem_phan_anh_hang_loat')

    if (error) {
      console.error('[xoaHetDaXuLy] RPC error:', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}`, count: 0 }
    }

    const count = (data as number) ?? 0
    if (count === 0) {
      return { success: true, message: 'Không có phản ánh nào cần dọn dẹp', count: 0 }
    }

    revalidatePath('/dashboard/phan-anh')
    return { success: true, message: `Đã dọn dẹp ${count} phản ánh`, count }
  } catch (err) {
    console.error('[xoaHetDaXuLy] Unexpected error:', err)
    return { success: false, message: 'Không thể dọn dẹp. Vui lòng thử lại.', count: 0 }
  }
}
