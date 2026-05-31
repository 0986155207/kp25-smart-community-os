'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'
import { layCanBoHienTai } from '@/lib/auth'

// Whitelist trường được phép cập nhật từ tự khai
const TRUONG_HOP_LE = new Set([
  'so_dien_thoai', 'email', 'nghe_nghiep', 'noi_lam_viec',
  'tinh_trang_hon_nhan', 'nguyen_quan', 'noi_sinh', 'dan_toc', 'ton_giao',
  'trinh_do_hoc_van', 'trinh_do_chuyen_mon',
])

export interface YeuCauItem {
  id:            string
  ho_id:         string | null
  nhan_khau_id:  string | null
  loai:          string
  ho_ten:        string | null
  nguoi_gui_sdt: string | null
  du_lieu_moi:   Record<string, string>
  du_lieu_cu:    Record<string, unknown>
  trang_thai:    string
  created_at:    string
  chu_ho:        string | null
}

// ── Danh sách yêu cầu chờ duyệt ──────────────────────────────
export async function layDanhSachYeuCau(trangThai = 'CHO_DUYET'): Promise<YeuCauItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .select('*, ho_dan(chu_ho)')
      .eq('trang_thai', trangThai)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      ...r,
      chu_ho: r.ho_dan?.chu_ho ?? null,
    }))
  } catch (err) {
    console.error('[layDanhSachYeuCau]', err)
    return []
  }
}

// ── Đếm số chờ duyệt ─────────────────────────────────────────
export async function demChoDuyet(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .select('id', { count: 'exact', head: true })
      .eq('trang_thai', 'CHO_DUYET')
      .is('deleted_at', null)
    return count ?? 0
  } catch { return 0 }
}

// ── Duyệt yêu cầu → áp dụng vào nhan_khau ────────────────────
export async function duyetYeuCau(
  id: string,
  duLieuDuyet: Record<string, string>   // dữ liệu đã được cán bộ kiểm tra (có thể chỉnh)
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const canBo = await layCanBoHienTai()

    // Lấy yêu cầu
    const { data: yc } = await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .select('*')
      .eq('id', id)
      .single()

    if (!yc) return { success: false, message: 'Không tìm thấy yêu cầu' }
    if (yc.trang_thai !== 'CHO_DUYET') return { success: false, message: 'Yêu cầu đã được xử lý' }

    // Lọc trường hợp lệ
    const update: Record<string, string | null> = {}
    for (const [k, v] of Object.entries(duLieuDuyet)) {
      if (TRUONG_HOP_LE.has(k)) {
        update[k] = (typeof v === 'string' && v.trim() === '') ? null : v
      }
    }

    // Validation
    if (update['so_dien_thoai'] && !/^0\d{9}$/.test(update['so_dien_thoai'])) {
      return { success: false, message: 'Số điện thoại không hợp lệ' }
    }

    // Áp dụng vào nhân khẩu (nếu là CAP_NHAT)
    if (yc.loai === 'CAP_NHAT' && yc.nhan_khau_id && Object.keys(update).length > 0) {
      update['updated_at'] = new Date().toISOString()
      const { error } = await supabase
        .from('nhan_khau')
        .update(update)
        .eq('id', yc.nhan_khau_id)

      if (error) {
        console.error('[duyetYeuCau] update nhan_khau', JSON.stringify(error))
        return { success: false, message: `Lỗi áp dụng: ${error.message}` }
      }
    }

    // Đánh dấu đã duyệt
    await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .update({
        trang_thai:       'DA_DUYET',
        can_bo_duyet_id:  canBo?.id ?? null,
        can_bo_duyet_ten: canBo?.ho_ten ?? null,
        ngay_duyet:       new Date().toISOString(),
        du_lieu_moi:      duLieuDuyet,   // lưu lại bản đã chỉnh
        updated_at:       new Date().toISOString(),
      })
      .eq('id', id)

    ghiAuditLog({
      hanh_dong: 'CAP_NHAT', bang: 'nhan_khau', ban_ghi_id: yc.nhan_khau_id ?? undefined,
      mo_ta: `Duyệt tự khai của ${yc.ho_ten}: cập nhật ${Object.keys(update).filter(k => k !== 'updated_at').length} trường`,
    }).catch(() => {})

    revalidatePath('/dashboard/dan-cu/duyet-cap-nhat')
    revalidatePath('/dashboard/dan-cu/ho-so-thieu')
    if (yc.ho_id) revalidatePath(`/dashboard/dan-cu/${yc.ho_id}`)
    return { success: true, message: 'Đã duyệt và cập nhật thông tin' }
  } catch (err) {
    console.error('[duyetYeuCau]', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Từ chối yêu cầu ──────────────────────────────────────────
export async function tuChoiYeuCau(id: string, lyDo: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const canBo = await layCanBoHienTai()

    const { error } = await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .update({
        trang_thai:       'TU_CHOI',
        ly_do_tu_choi:    lyDo || 'Không có lý do',
        can_bo_duyet_id:  canBo?.id ?? null,
        can_bo_duyet_ten: canBo?.ho_ten ?? null,
        ngay_duyet:       new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      })
      .eq('id', id)
      .eq('trang_thai', 'CHO_DUYET')

    if (error) return { success: false, message: `Lỗi: ${error.message}` }

    revalidatePath('/dashboard/dan-cu/duyet-cap-nhat')
    return { success: true, message: 'Đã từ chối yêu cầu' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}
