'use server'

import { KHU_PHO } from '@/lib/khu-pho'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { coGeminiKey, taoModel } from '@/lib/gemini'

// ─── Types ────────────────────────────────────────────────────
export type TrangThaiWorkflow =
  | 'CHO_PHAN_CONG'
  | 'DA_PHAN_CONG'
  | 'DANG_XU_LY'
  | 'HOAN_THANH'
  | 'QUA_HAN'
  | 'HUY'

export type WorkflowAssignment = {
  id: string
  phan_anh_id: string
  phan_anh?: {
    tieu_de: string
    mo_ta: string
    loai: string
    muc_do: string
    dia_chi_phan_anh: string | null
    anh_urls: string[]
    nguoi_gui_ten: string | null
    nguoi_gui_sdt: string | null
    created_at: string
  }
  ai_tom_tat:         string | null
  ai_loai:            string | null
  ai_muc_do:          string | null
  ai_don_vi_de_xuat:  string | null
  ai_huong_xu_ly:     string | null
  ai_tags:            string[]
  ai_diem_uu_tien:    number
  ai_analyzed_at:     string | null
  don_vi_xu_ly:       string | null
  can_bo_phu_trach_id: string | null
  can_bo?: { ho_ten: string; vai_tro: string } | null
  phan_cong_luc:      string | null
  sla_gio:            number
  han_xu_ly:          string | null
  trang_thai:         TrangThaiWorkflow
  ghi_chu_phan_cong:  string | null
  ket_qua_xu_ly:      string | null
  hoan_thanh_luc:     string | null
  created_at:         string
}

// ─── SLA theo mức độ ─────────────────────────────────────────
const SLA_MAP: Record<string, Record<string, number>> = {
  AN_NINH:    { KHAN_CAP: 2,  CAO: 8,  TRUNG_BINH: 24,  THAP: 72  },
  MOI_TRUONG: { KHAN_CAP: 4,  CAO: 24, TRUNG_BINH: 72,  THAP: 168 },
  HA_TANG:    { KHAN_CAP: 4,  CAO: 24, TRUNG_BINH: 72,  THAP: 168 },
  AN_SINH:    { KHAN_CAP: 8,  CAO: 48, TRUNG_BINH: 120, THAP: 240 },
  GIAO_THONG: { KHAN_CAP: 2,  CAO: 8,  TRUNG_BINH: 48,  THAP: 120 },
  KHAC:       { KHAN_CAP: 8,  CAO: 48, TRUNG_BINH: 120, THAP: 240 },
}

const DON_VI_MAP: Record<string, string> = {
  AN_NINH:    `Công an ${KHU_PHO.ten}`,
  MOI_TRUONG: 'Tổ vệ sinh môi trường',
  HA_TANG:    'Tổ hạ tầng kỹ thuật',
  AN_SINH:    'Tổ an sinh xã hội',
  GIAO_THONG: 'Tổ giao thông trật tự đô thị',
  KHAC:       `Ban Quản lý ${KHU_PHO.ten}`,
}

// ─── AI Phân tích & tạo workflow ──────────────────────────────
export async function aiPhanTichVaTaoWorkflow(
  phanAnhId: string
): Promise<{ success: boolean; id?: string; message?: string }> {
  try {
    const supabase = await createClient()

    // Lấy thông tin phản ánh
    const { data: pa, error: paErr } = await supabase
      .from('phan_anh')
      .select('id, tieu_de, mo_ta, loai, muc_do, dia_chi_phan_anh')
      .eq('id', phanAnhId)
      .single()

    if (paErr || !pa) return { success: false, message: 'Không tìm thấy phản ánh' }

    // Kiểm tra đã có workflow chưa
    const { data: existing } = await supabase
      .from('workflow_assignments')
      .select('id')
      .eq('phan_anh_id', phanAnhId)
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) return { success: false, message: 'Phản ánh này đã có workflow' }

    // AI phân tích
    let aiResult: {
      tom_tat: string
      loai: string
      muc_do: string
      don_vi: string
      huong_xu_ly: string
      tags: string[]
      diem_uu_tien: number
    } = {
      tom_tat:      pa.tieu_de,
      loai:         pa.loai,
      muc_do:       pa.muc_do,
      don_vi:       DON_VI_MAP[pa.loai] ?? DON_VI_MAP['KHAC']!,
      huong_xu_ly:  '',
      tags:         [],
      diem_uu_tien: 50,
    }

    if (coGeminiKey()) {
      try {
        const model = taoModel(
          `Bạn là hệ thống phân công workflow của ${KHU_PHO.ten}. Chỉ trả về JSON hợp lệ, không kèm markdown hoặc giải thích.`
        )
        const prompt = `Phân tích phản ánh sau và trả về JSON:

Tiêu đề: ${pa.tieu_de}
Mô tả: ${pa.mo_ta}
Loại: ${pa.loai}
Mức độ: ${pa.muc_do}
Địa chỉ: ${pa.dia_chi_phan_anh ?? '{KHU_PHO.ten}'}

Trả về JSON:
{
  "tom_tat": "tóm tắt ngắn gọn 1-2 câu",
  "loai": "một trong [AN_NINH, MOI_TRUONG, HA_TANG, AN_SINH, GIAO_THONG, KHAC]",
  "muc_do": "một trong [KHAN_CAP, CAO, TRUNG_BINH, THAP]",
  "don_vi": "đơn vị phụ trách phù hợp nhất",
  "huong_xu_ly": "2-3 bước xử lý cụ thể",
  "tags": ["tag1", "tag2"],
  "diem_uu_tien": 0-100
}`

        const res  = await model.generateContent(prompt)
        const text = res.response.text().trim()
        const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(json) as typeof aiResult
        aiResult = { ...aiResult, ...parsed }
      } catch (aiErr) {
        console.warn('[workflow AI] fallback to rule-based:', aiErr)
      }
    }

    // Tính SLA
    const slaGio = SLA_MAP[aiResult.loai]?.[aiResult.muc_do] ?? 72
    const diem = typeof aiResult.diem_uu_tien === 'number'
      ? Math.min(100, Math.max(0, aiResult.diem_uu_tien))
      : 50

    // Tạo workflow assignment
    const { data: newAssign, error: insertErr } = await supabase
      .from('workflow_assignments')
      .insert({
        phan_anh_id:          phanAnhId,
        ai_tom_tat:           aiResult.tom_tat,
        ai_loai:              aiResult.loai,
        ai_muc_do:            aiResult.muc_do,
        ai_don_vi_de_xuat:    aiResult.don_vi,
        ai_huong_xu_ly:       aiResult.huong_xu_ly,
        ai_tags:              aiResult.tags ?? [],
        ai_diem_uu_tien:      diem,
        ai_analyzed_at:       new Date().toISOString(),
        don_vi_xu_ly:         aiResult.don_vi,
        sla_gio:              slaGio,
        trang_thai:           'CHO_PHAN_CONG',
      })
      .select('id')
      .single()

    if (insertErr || !newAssign) {
      return { success: false, message: insertErr?.message ?? 'Lỗi tạo workflow' }
    }

    revalidatePath('/dashboard/workflow')
    revalidatePath(`/dashboard/phan-anh/${phanAnhId}`)
    return { success: true, id: newAssign.id }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Phân công cán bộ ────────────────────────────────────────
export async function phanCongCanBo(
  assignmentId: string,
  canBoId: string,
  donViXuLy: string,
  ghiChu: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Dùng service client để bypass RLS và tránh FK stale
    const svc = createServiceClient()
    const now = new Date()

    // Xác minh can_bo tồn tại trước khi update (tránh FK error mơ hồ)
    const { data: canBoCheck, error: canBoErr } = await svc
      .from('can_bo')
      .select('id, ho_ten')
      .eq('id', canBoId)
      .single()

    if (canBoErr || !canBoCheck) {
      return {
        success: false,
        message: 'Cán bộ không tồn tại trong hệ thống. Vui lòng tải lại trang và thử lại.',
      }
    }

    // Lấy sla_gio hiện tại
    const { data: assign } = await svc
      .from('workflow_assignments')
      .select('sla_gio, phan_anh_id')
      .eq('id', assignmentId)
      .single()

    if (!assign) return { success: false, message: 'Không tìm thấy assignment' }

    const hanXuLy = new Date(now.getTime() + (assign.sla_gio ?? 72) * 3600 * 1000)

    const { error } = await svc
      .from('workflow_assignments')
      .update({
        can_bo_phu_trach_id: canBoId,
        don_vi_xu_ly:        donViXuLy,
        ghi_chu_phan_cong:   ghiChu,
        phan_cong_luc:       now.toISOString(),
        han_xu_ly:           hanXuLy.toISOString(),
        trang_thai:          'DA_PHAN_CONG',
        updated_at:          now.toISOString(),
      })
      .eq('id', assignmentId)

    if (error) return { success: false, message: error.message }

    // Cập nhật trạng thái phản ánh → DANG_XU_LY
    await svc
      .from('phan_anh')
      .update({ trang_thai: 'DANG_XU_LY' })
      .eq('id', assign.phan_anh_id)

    revalidatePath('/dashboard/workflow')
    revalidatePath(`/dashboard/workflow/${assignmentId}`)
    revalidatePath(`/dashboard/phan-anh/${assign.phan_anh_id}`)
    return { success: true, message: `Đã phân công cho ${canBoCheck.ho_ten}` }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Tiếp nhận (cán bộ xác nhận) ─────────────────────────────
export async function tiepNhanWorkflow(
  assignmentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('workflow_assignments')
      .update({ trang_thai: 'DANG_XU_LY', updated_at: new Date().toISOString() })
      .eq('id', assignmentId)

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/workflow')
    revalidatePath(`/dashboard/workflow/${assignmentId}`)
    return { success: true, message: 'Đã tiếp nhận xử lý' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Hoàn thành ───────────────────────────────────────────────
export async function hoanThanhWorkflow(
  assignmentId: string,
  ketQua: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const now = new Date()

    const { data: assign } = await supabase
      .from('workflow_assignments')
      .select('phan_anh_id')
      .eq('id', assignmentId)
      .single()

    if (!assign) return { success: false, message: 'Không tìm thấy assignment' }

    const { error } = await supabase
      .from('workflow_assignments')
      .update({
        trang_thai:       'HOAN_THANH',
        ket_qua_xu_ly:    ketQua,
        hoan_thanh_luc:   now.toISOString(),
        updated_at:       now.toISOString(),
      })
      .eq('id', assignmentId)

    if (error) return { success: false, message: error.message }

    // Cập nhật phản ánh → DA_XU_LY
    await supabase
      .from('phan_anh')
      .update({
        trang_thai:     'DA_XU_LY',
        ket_qua_xu_ly:  ketQua,
        thoi_gian_xu_ly: now.toISOString(),
      })
      .eq('id', assign.phan_anh_id)

    revalidatePath('/dashboard/workflow')
    revalidatePath(`/dashboard/workflow/${assignmentId}`)
    revalidatePath(`/dashboard/phan-anh/${assign.phan_anh_id}`)
    return { success: true, message: 'Đã hoàn thành xử lý' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Lấy danh sách assignments ────────────────────────────────
export async function layDanhSachWorkflow(): Promise<WorkflowAssignment[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('workflow_assignments')
      .select(`
        *,
        phan_anh:phan_anh_id (
          tieu_de, mo_ta, loai, muc_do,
          dia_chi_phan_anh, anh_urls,
          nguoi_gui_ten, nguoi_gui_sdt, created_at
        ),
        can_bo:can_bo_phu_trach_id (
          ho_ten, vai_tro
        )
      `)
      .is('deleted_at', null)
      .order('ai_diem_uu_tien', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as WorkflowAssignment[]
  } catch {
    return []
  }
}

// ─── Lấy chi tiết assignment ──────────────────────────────────
export async function layChiTietWorkflow(
  id: string
): Promise<WorkflowAssignment | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('workflow_assignments')
      .select(`
        *,
        phan_anh:phan_anh_id (
          tieu_de, mo_ta, loai, muc_do,
          dia_chi_phan_anh, anh_urls,
          nguoi_gui_ten, nguoi_gui_sdt, created_at
        ),
        can_bo:can_bo_phu_trach_id (
          ho_ten, vai_tro
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) return null
    return data as WorkflowAssignment
  } catch {
    return null
  }
}

// ─── Lấy danh sách cán bộ để phân công ───────────────────────
export async function layDanhSachCanBo(): Promise<
  Array<{ id: string; ho_ten: string; vai_tro: string; so_luong_xu_ly: number }>
> {
  try {
    // Service client: đảm bảo lấy đủ tất cả can_bo, không bị RLS filter
    const svc = createServiceClient()
    const { data: canBos } = await svc
      .from('can_bo')
      .select('id, ho_ten, vai_tro')
      .in('vai_tro', ['BI_THU','TRUONG_KHU_PHO','CONG_AN','AN_NINH','PHU_TRACH_NCT'])
      .eq('hoat_dong', true)
      .order('ho_ten')

    if (!canBos) return []

    // Đếm số việc đang xử lý
    const { data: counts } = await svc
      .from('workflow_assignments')
      .select('can_bo_phu_trach_id')
      .in('trang_thai', ['DA_PHAN_CONG', 'DANG_XU_LY'])
      .is('deleted_at', null)

    const countMap: Record<string, number> = {}
    counts?.forEach(c => {
      if (c.can_bo_phu_trach_id) {
        countMap[c.can_bo_phu_trach_id] = (countMap[c.can_bo_phu_trach_id] ?? 0) + 1
      }
    })

    return canBos.map(cb => ({
      ...cb,
      so_luong_xu_ly: countMap[cb.id] ?? 0,
    }))
  } catch {
    return []
  }
}

// ─── Thống kê tổng quan ───────────────────────────────────────
export async function layThongKeWorkflow(): Promise<{
  choPhanCong: number
  daPhanCong: number
  dangXuLy: number
  hoanThanh: number
  quaHan: number
  tongHom_nay: number
}> {
  try {
    const supabase = await createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('workflow_assignments')
      .select('trang_thai, created_at, han_xu_ly')
      .is('deleted_at', null)

    const result = { choPhanCong: 0, daPhanCong: 0, dangXuLy: 0, hoanThanh: 0, quaHan: 0, tongHom_nay: 0 }
    const now = new Date()

    data?.forEach(r => {
      if (r.trang_thai === 'CHO_PHAN_CONG') result.choPhanCong++
      if (r.trang_thai === 'DA_PHAN_CONG')  result.daPhanCong++
      if (r.trang_thai === 'DANG_XU_LY')    result.dangXuLy++
      if (r.trang_thai === 'HOAN_THANH')    result.hoanThanh++
      if (r.trang_thai === 'QUA_HAN')       result.quaHan++
      // Quá hạn chưa cập nhật status
      if (r.han_xu_ly && new Date(r.han_xu_ly) < now && ['DA_PHAN_CONG','DANG_XU_LY'].includes(r.trang_thai)) {
        result.quaHan++
      }
      if (new Date(r.created_at) >= today) result.tongHom_nay++
    })

    return result
  } catch {
    return { choPhanCong: 0, daPhanCong: 0, dangXuLy: 0, hoanThanh: 0, quaHan: 0, tongHom_nay: 0 }
  }
}
