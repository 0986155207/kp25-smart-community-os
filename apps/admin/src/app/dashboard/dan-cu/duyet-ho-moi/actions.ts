'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'
import { layCanBoHienTai } from '@/lib/auth'

export interface ThanhVienKhai {
  ho_ten: string
  ngay_sinh: string | null
  gioi_tinh: string
  cccd: string | null
  quan_he: string
  nghe_nghiep: string | null
  // Trường mở rộng (migration 041)
  noi_sinh?: string | null
  nguyen_quan?: string | null
  dan_toc?: string | null
  ton_giao?: string | null
  quoc_tich?: string | null
  cccd_ngay_cap?: string | null
  cccd_noi_cap?: string | null
  tinh_trang_hon_nhan?: string | null
  noi_lam_viec?: string | null
  dia_chi_thuong_tru?: string | null
}

export interface HoMoiItem {
  id:             string
  chu_ho:         string
  dia_chi:        string
  so_dien_thoai:  string | null
  so_nha:         string | null
  duong:          string | null
  to_dan_pho:     string | null
  loai_cu_tru:    string
  thanh_vien:     ThanhVienKhai[]
  nguoi_khai_sdt: string | null
  ghi_chu:        string | null
  trang_thai:     string
  created_at:     string
}

// Sinh mã hộ
function sinhMaHo(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `KP25-${yy}${mm}-${rand}`
}

// ── Danh sách chờ duyệt ──────────────────────────────────────
export async function layDanhSachHoMoi(trangThai = 'CHO_DUYET'): Promise<HoMoiItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('dang_ky_ho_moi')
      .select('*')
      .eq('trang_thai', trangThai)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({ ...r, thanh_vien: Array.isArray(r.thanh_vien) ? r.thanh_vien : [] }))
  } catch (err) {
    console.error('[layDanhSachHoMoi]', err)
    return []
  }
}

export async function demHoMoiChoDuyet(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('dang_ky_ho_moi')
      .select('id', { count: 'exact', head: true })
      .eq('trang_thai', 'CHO_DUYET')
      .is('deleted_at', null)
    return count ?? 0
  } catch { return 0 }
}

// ── Duyệt → tạo ho_dan + nhan_khau ───────────────────────────
export async function duyetHoMoi(
  id: string,
  duLieu: { chu_ho: string; dia_chi: string; so_dien_thoai: string; so_nha: string; duong: string; to_khu_vuc: string; loai_cu_tru: string; thanh_vien: ThanhVienKhai[] }
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const canBo = await layCanBoHienTai()

    const { data: dk } = await supabase.from('dang_ky_ho_moi').select('trang_thai').eq('id', id).single()
    if (!dk) return { success: false, message: 'Không tìm thấy đăng ký' }
    if (dk.trang_thai !== 'CHO_DUYET') return { success: false, message: 'Đăng ký đã được xử lý' }

    if (!duLieu.chu_ho?.trim())  return { success: false, message: 'Thiếu tên chủ hộ' }
    if (!duLieu.dia_chi?.trim()) return { success: false, message: 'Thiếu địa chỉ' }
    const tv = (duLieu.thanh_vien ?? []).filter(t => t.ho_ten?.trim())
    if (tv.length === 0) return { success: false, message: 'Cần ít nhất 1 thành viên' }

    // 1. Tạo hộ dân — khớp đầy đủ các trường form hộ dân chuẩn
    const { data: ho, error: errHo } = await supabase
      .from('ho_dan')
      .insert({
        ma_ho:         sinhMaHo(),
        chu_ho:        duLieu.chu_ho.trim(),
        dia_chi_day:   duLieu.dia_chi.trim(),
        so_nha:        duLieu.so_nha?.trim() || null,
        duong:         duLieu.duong?.trim() || null,
        to_truong:     duLieu.to_khu_vuc?.trim() || null,
        so_dien_thoai: duLieu.so_dien_thoai?.trim() || null,
        trang_thai:    duLieu.loai_cu_tru === 'TAM_TRU' ? 'TAM_TRU' : 'THUONG_TRU',
        so_nhan_khau:  tv.length,
        qr_token:      crypto.randomUUID(),
      })
      .select('id')
      .single()

    if (errHo) {
      console.error('[duyetHoMoi] ho_dan', JSON.stringify(errHo))
      return { success: false, message: `Lỗi tạo hộ: ${errHo.message}` }
    }

    // 2. Tạo nhân khẩu — đầy đủ trường mở rộng
    const trangThaiNk = duLieu.loai_cu_tru === 'TAM_TRU' ? 'TAM_TRU' : 'THUONG_TRU'
    const cl = (v?: string | null) => (v?.trim() || null)

    const nkCore = tv.map(t => ({
      ho_id:       ho.id,
      ho_ten:      t.ho_ten.trim(),
      ngay_sinh:   t.ngay_sinh || null,
      gioi_tinh:   t.gioi_tinh === 'NU' ? 'NU' : t.gioi_tinh === 'KHAC' ? 'KHAC' : 'NAM',
      cccd:        cl(t.cccd),
      quan_he:     t.quan_he?.trim() || 'Thành viên khác',
      nghe_nghiep: cl(t.nghe_nghiep),
      trang_thai:  trangThaiNk,
    }))
    // Thêm trường mở rộng (nếu migration 041 đã chạy)
    const nkRows = tv.map((t, idx) => ({
      ...nkCore[idx]!,
      noi_sinh:            cl(t.noi_sinh),
      nguyen_quan:         cl(t.nguyen_quan),
      dan_toc:             cl(t.dan_toc),
      ton_giao:            cl(t.ton_giao),
      quoc_tich:           cl(t.quoc_tich),
      cccd_ngay_cap:       cl(t.cccd_ngay_cap),
      cccd_noi_cap:        cl(t.cccd_noi_cap),
      tinh_trang_hon_nhan: cl(t.tinh_trang_hon_nhan),
      noi_lam_viec:        cl(t.noi_lam_viec),
      dia_chi_thuong_tru:  cl(t.dia_chi_thuong_tru),
    }))

    let { error: errNk } = await supabase.from('nhan_khau').insert(nkRows)
    // Fallback: nếu cột mở rộng chưa tồn tại → chỉ insert trường cơ bản
    if (errNk && errNk.message && ['noi_sinh', 'dan_toc', 'ton_giao', 'cccd_ngay_cap', 'tinh_trang_hon_nhan'].some(c => errNk!.message.includes(c))) {
      const retry = await supabase.from('nhan_khau').insert(nkCore)
      errNk = retry.error
    }
    if (errNk) {
      console.error('[duyetHoMoi] nhan_khau', JSON.stringify(errNk))
      // Hộ đã tạo nhưng nhân khẩu lỗi → vẫn tiếp tục, cán bộ bổ sung sau
    }

    // 3. Đánh dấu đã duyệt
    await supabase.from('dang_ky_ho_moi').update({
      trang_thai:       'DA_DUYET',
      ho_id_tao:        ho.id,
      can_bo_duyet_id:  canBo?.id ?? null,
      can_bo_duyet_ten: canBo?.ho_ten ?? null,
      ngay_duyet:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }).eq('id', id)

    ghiAuditLog({ hanh_dong: 'TAO', bang: 'ho_dan', ban_ghi_id: ho.id, mo_ta: `Duyệt đăng ký hộ mới: "${duLieu.chu_ho}" — ${tv.length} nhân khẩu` }).catch(() => {})

    revalidatePath('/dashboard/dan-cu/duyet-ho-moi')
    revalidatePath('/dashboard/dan-cu')
    return { success: true, message: `Đã tạo hộ "${duLieu.chu_ho}" với ${tv.length} nhân khẩu` }
  } catch (err) {
    console.error('[duyetHoMoi]', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Từ chối ──────────────────────────────────────────────────
export async function tuChoiHoMoi(id: string, lyDo: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const canBo = await layCanBoHienTai()
    const { error } = await supabase.from('dang_ky_ho_moi').update({
      trang_thai:       'TU_CHOI',
      ly_do_tu_choi:    lyDo || 'Không có lý do',
      can_bo_duyet_id:  canBo?.id ?? null,
      can_bo_duyet_ten: canBo?.ho_ten ?? null,
      ngay_duyet:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }).eq('id', id).eq('trang_thai', 'CHO_DUYET')
    if (error) return { success: false, message: `Lỗi: ${error.message}` }
    revalidatePath('/dashboard/dan-cu/duyet-ho-moi')
    return { success: true, message: 'Đã từ chối đăng ký' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}
