'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'
import { layCanBoHienTai } from '@/lib/auth'

// ════════════════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════════════════
export type LoaiSuKien =
  | 'SINH' | 'MAT' | 'CHUYEN_DEN' | 'CHUYEN_DI'
  | 'TAM_TRU' | 'TAM_VANG' | 'VE_THUONG_TRU'
  | 'HO_NGHEO' | 'THOAT_NGHEO' | 'KET_HON' | 'CAP_NHAT' | 'KHAC'

export interface KetQua {
  success: boolean
  message: string
  suKienId?: string
}

// ════════════════════════════════════════════════════════════
//  HELPER: Ghi sự kiện vào sổ nhật ký
// ════════════════════════════════════════════════════════════
async function ghiSuKien(params: {
  loai:        LoaiSuKien
  hoId?:       string | null
  nhanKhauId?: string | null
  hoTen?:      string | null
  diaChi?:     string | null
  moTa:        string
  duLieu?:     Record<string, unknown>
  ngaySuKien?: string
  trangThai?:  'CHO_DUYET' | 'DA_DUYET'
}): Promise<string | null> {
  try {
    const supabase = await createClient()
    const canBo = await layCanBoHienTai()

    const { data, error } = await supabase
      .from('su_kien_dan_cu')
      .insert({
        loai_su_kien:   params.loai,
        ho_id:          params.hoId        ?? null,
        nhan_khau_id:   params.nhanKhauId  ?? null,
        ho_ten:         params.hoTen       ?? null,
        dia_chi:        params.diaChi      ?? null,
        mo_ta:          params.moTa,
        du_lieu:        params.duLieu      ?? {},
        ngay_su_kien:   params.ngaySuKien  ?? new Date().toISOString().split('T')[0],
        trang_thai:     params.trangThai   ?? 'DA_DUYET',
        can_bo_ghi_id:  canBo?.id          ?? null,
        can_bo_ghi_ten: canBo?.ho_ten      ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ghiSuKien]', JSON.stringify(error))
      return null
    }
    return data.id as string
  } catch (err) {
    console.error('[ghiSuKien] unexpected', err)
    return null
  }
}

// ── Lấy snapshot hộ dân ──────────────────────────────────────
async function laySnapshotHo(hoId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ho_dan')
    .select('chu_ho, dia_chi_day')
    .eq('id', hoId)
    .single()
  return data
}

function revalidateAll() {
  revalidatePath('/dashboard/dan-cu')
  revalidatePath('/dashboard/dan-cu/su-kien-nhanh')
  revalidatePath('/dashboard/an-sinh')
  revalidatePath('/dashboard')
}

// ════════════════════════════════════════════════════════════
//  1. SINH — Thêm nhân khẩu mới (trẻ mới sinh / nhập khẩu)
// ════════════════════════════════════════════════════════════
export async function suKienSinh(input: {
  hoId:        string
  hoTen:       string
  ngaySinh:    string
  gioiTinh:    'NAM' | 'NU' | 'KHAC'
  quanHe:      string
  ghiChu?:     string
}): Promise<KetQua> {
  try {
    if (!input.hoId)   return { success: false, message: 'Vui lòng chọn hộ dân' }
    if (!input.hoTen?.trim()) return { success: false, message: 'Vui lòng nhập họ tên' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // 1. Thêm nhân khẩu mới
    const { data: nk, error } = await supabase
      .from('nhan_khau')
      .insert({
        ho_id:      input.hoId,
        ho_ten:     input.hoTen.trim(),
        ngay_sinh:  input.ngaySinh || null,
        gioi_tinh:  input.gioiTinh,
        quan_he:    input.quanHe || 'Con',
        trang_thai: 'THUONG_TRU',
        ghi_chu:    input.ghiChu?.trim() || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[suKienSinh]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    // 2. Tăng số nhân khẩu của hộ
    await tangSoNhanKhau(input.hoId, 1)

    // 3. Ghi sổ nhật ký
    const moTa = `Thêm nhân khẩu mới: ${input.hoTen} (${input.quanHe}) vào hộ ${snap?.chu_ho ?? ''}`
    const suKienId = await ghiSuKien({
      loai: 'SINH', hoId: input.hoId, nhanKhauId: nk.id,
      hoTen: input.hoTen, diaChi: snap?.dia_chi_day,
      moTa, duLieu: { ngaySinh: input.ngaySinh, gioiTinh: input.gioiTinh, quanHe: input.quanHe },
      ngaySuKien: input.ngaySinh || undefined,
    })

    ghiAuditLog({ hanh_dong: 'TAO', bang: 'nhan_khau', ban_ghi_id: nk.id, mo_ta: moTa }).catch(() => {})
    revalidateAll()
    return { success: true, message: 'Đã ghi nhận nhân khẩu mới', suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  2. MAT — Khai tử
// ════════════════════════════════════════════════════════════
export async function suKienMat(input: {
  nhanKhauId:   string
  hoId:         string
  hoTen:        string
  ngayMat:      string
  nguyenNhan?:  string
}): Promise<KetQua> {
  try {
    if (!input.nhanKhauId) return { success: false, message: 'Vui lòng chọn người' }
    if (!input.ngayMat)    return { success: false, message: 'Vui lòng nhập ngày mất' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // 1. Đánh dấu đã mất trong nhân khẩu
    const { error } = await supabase
      .from('nhan_khau')
      .update({
        da_mat:     true,
        ngay_mat:   input.ngayMat,
        ghi_chu:    input.nguyenNhan ? `Nguyên nhân: ${input.nguyenNhan}` : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.nhanKhauId)

    if (error) {
      console.error('[suKienMat]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    // 2. Đồng bộ sang NCT nếu có
    await supabase
      .from('nguoi_cao_tuoi')
      .update({ da_mat: true, ngay_mat: input.ngayMat, updated_at: new Date().toISOString() })
      .eq('nhan_khau_id', input.nhanKhauId)

    // 3. Giảm số nhân khẩu của hộ
    await tangSoNhanKhau(input.hoId, -1)

    // 4. Ghi sổ
    const moTa = `Khai tử: ${input.hoTen} — ${input.ngayMat}${input.nguyenNhan ? ` (${input.nguyenNhan})` : ''}`
    const suKienId = await ghiSuKien({
      loai: 'MAT', hoId: input.hoId, nhanKhauId: input.nhanKhauId,
      hoTen: input.hoTen, diaChi: snap?.dia_chi_day,
      moTa, duLieu: { ngayMat: input.ngayMat, nguyenNhan: input.nguyenNhan },
      ngaySuKien: input.ngayMat,
    })

    ghiAuditLog({ hanh_dong: 'CAP_NHAT', bang: 'nhan_khau', ban_ghi_id: input.nhanKhauId, mo_ta: moTa }).catch(() => {})
    revalidateAll()
    return { success: true, message: 'Đã ghi nhận khai tử', suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  3. CHUYEN_TRANG_THAI — Tạm trú / Tạm vắng / Về thường trú
// ════════════════════════════════════════════════════════════
export async function suKienChuyenTrangThai(input: {
  nhanKhauId:   string
  hoId:         string
  hoTen:        string
  trangThaiMoi: 'TAM_TRU' | 'TAM_VANG' | 'THUONG_TRU'
  diaChiMoi?:   string   // địa chỉ tạm trú/tạm vắng
  lyDo?:        string
  ngayBatDau?:  string
  ngayKetThuc?: string
}): Promise<KetQua> {
  try {
    if (!input.nhanKhauId) return { success: false, message: 'Vui lòng chọn người' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // 1. Cập nhật trạng thái nhân khẩu
    const { error } = await supabase
      .from('nhan_khau')
      .update({ trang_thai: input.trangThaiMoi, updated_at: new Date().toISOString() })
      .eq('id', input.nhanKhauId)

    if (error) {
      console.error('[suKienChuyenTrangThai]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    const loaiMap: Record<string, LoaiSuKien> = {
      TAM_TRU:    'TAM_TRU',
      TAM_VANG:   'TAM_VANG',
      THUONG_TRU: 'VE_THUONG_TRU',
    }
    const labelMap: Record<string, string> = {
      TAM_TRU: 'Tạm trú', TAM_VANG: 'Tạm vắng', THUONG_TRU: 'Về thường trú',
    }

    const moTa = `${labelMap[input.trangThaiMoi]}: ${input.hoTen}` +
      (input.diaChiMoi ? ` → ${input.diaChiMoi}` : '') +
      (input.lyDo ? ` (${input.lyDo})` : '')

    const suKienId = await ghiSuKien({
      loai: loaiMap[input.trangThaiMoi]!, hoId: input.hoId, nhanKhauId: input.nhanKhauId,
      hoTen: input.hoTen, diaChi: input.diaChiMoi ?? snap?.dia_chi_day,
      moTa, duLieu: {
        trangThaiMoi: input.trangThaiMoi, lyDo: input.lyDo,
        ngayBatDau: input.ngayBatDau, ngayKetThuc: input.ngayKetThuc,
      },
      ngaySuKien: input.ngayBatDau || undefined,
    })

    ghiAuditLog({ hanh_dong: 'CAP_NHAT', bang: 'nhan_khau', ban_ghi_id: input.nhanKhauId, mo_ta: moTa }).catch(() => {})
    revalidateAll()
    return { success: true, message: `Đã ghi nhận ${labelMap[input.trangThaiMoi]?.toLowerCase()}`, suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  4. CHUYEN_DI — Chuyển đi (xóa khỏi hộ)
// ════════════════════════════════════════════════════════════
export async function suKienChuyenDi(input: {
  nhanKhauId:  string
  hoId:        string
  hoTen:       string
  noiDen?:     string
  lyDo?:       string
  ngayDi:      string
}): Promise<KetQua> {
  try {
    if (!input.nhanKhauId) return { success: false, message: 'Vui lòng chọn người' }
    if (!input.ngayDi)     return { success: false, message: 'Vui lòng nhập ngày chuyển đi' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // Soft delete nhân khẩu (chuyển đi = rời hộ)
    const { error } = await supabase
      .from('nhan_khau')
      .update({
        deleted_at: new Date().toISOString(),
        ghi_chu: `Chuyển đi ${input.ngayDi}${input.noiDen ? ` → ${input.noiDen}` : ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.nhanKhauId)

    if (error) {
      console.error('[suKienChuyenDi]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    await tangSoNhanKhau(input.hoId, -1)

    const moTa = `Chuyển đi: ${input.hoTen}${input.noiDen ? ` → ${input.noiDen}` : ''}` +
      (input.lyDo ? ` (${input.lyDo})` : '')
    const suKienId = await ghiSuKien({
      loai: 'CHUYEN_DI', hoId: input.hoId, nhanKhauId: input.nhanKhauId,
      hoTen: input.hoTen, diaChi: snap?.dia_chi_day,
      moTa, duLieu: { noiDen: input.noiDen, lyDo: input.lyDo, ngayDi: input.ngayDi },
      ngaySuKien: input.ngayDi,
    })

    ghiAuditLog({ hanh_dong: 'CAP_NHAT', bang: 'nhan_khau', ban_ghi_id: input.nhanKhauId, mo_ta: moTa }).catch(() => {})
    revalidateAll()
    return { success: true, message: 'Đã ghi nhận chuyển đi', suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  5. HO_NGHEO — Công nhận hộ nghèo / cận nghèo
// ════════════════════════════════════════════════════════════
export async function suKienHoNgheo(input: {
  hoId:        string
  loai:        'NGHEO' | 'CAN_NGHEO'
  quyetDinhSo?: string
  ngayQuyetDinh?: string
  lyDo?:       string
}): Promise<KetQua> {
  try {
    if (!input.hoId) return { success: false, message: 'Vui lòng chọn hộ dân' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // Thêm bản ghi hộ nghèo
    const { error } = await supabase
      .from('ho_ngheo')
      .insert({
        ho_dan_id:       input.hoId,
        loai:            input.loai,
        trang_thai:      'DANG_HUONG',
        nam_xet_duyet:   new Date().getFullYear(),
        quyet_dinh_so:   input.quyetDinhSo || null,
        ngay_quyet_dinh: input.ngayQuyetDinh || null,
        ly_do_ngheo:     input.lyDo || null,
      })

    if (error) {
      console.error('[suKienHoNgheo]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    const label = input.loai === 'NGHEO' ? 'hộ nghèo' : 'hộ cận nghèo'
    const moTa = `Công nhận ${label}: ${snap?.chu_ho ?? ''}` +
      (input.quyetDinhSo ? ` (QĐ ${input.quyetDinhSo})` : '')
    const suKienId = await ghiSuKien({
      loai: 'HO_NGHEO', hoId: input.hoId,
      hoTen: snap?.chu_ho, diaChi: snap?.dia_chi_day,
      moTa, duLieu: { loai: input.loai, quyetDinhSo: input.quyetDinhSo, lyDo: input.lyDo },
      ngaySuKien: input.ngayQuyetDinh || undefined,
    })

    ghiAuditLog({ hanh_dong: 'TAO', bang: 'ho_ngheo', mo_ta: moTa }).catch(() => {})
    revalidateAll()
    revalidatePath('/dashboard/an-sinh/ho-ngheo')
    return { success: true, message: `Đã công nhận ${label}`, suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  6. THOAT_NGHEO — Thoát nghèo
// ════════════════════════════════════════════════════════════
export async function suKienThoatNgheo(input: {
  hoId:        string
  ngayThoat:   string
  lyDo?:       string
}): Promise<KetQua> {
  try {
    if (!input.hoId) return { success: false, message: 'Vui lòng chọn hộ dân' }

    const supabase = await createClient()
    const snap = await laySnapshotHo(input.hoId)

    // Cập nhật bản ghi hộ nghèo đang hưởng → thoát nghèo
    const { error } = await supabase
      .from('ho_ngheo')
      .update({
        trang_thai:        'THOAT_NGHEO',
        ngay_thoat_ngheo:  input.ngayThoat,
        ly_do_thoat_ngheo: input.lyDo || null,
        updated_at:        new Date().toISOString(),
      })
      .eq('ho_dan_id', input.hoId)
      .eq('trang_thai', 'DANG_HUONG')
      .is('deleted_at', null)

    if (error) {
      console.error('[suKienThoatNgheo]', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    const moTa = `Thoát nghèo: ${snap?.chu_ho ?? ''} — ${input.ngayThoat}` +
      (input.lyDo ? ` (${input.lyDo})` : '')
    const suKienId = await ghiSuKien({
      loai: 'THOAT_NGHEO', hoId: input.hoId,
      hoTen: snap?.chu_ho, diaChi: snap?.dia_chi_day,
      moTa, duLieu: { ngayThoat: input.ngayThoat, lyDo: input.lyDo },
      ngaySuKien: input.ngayThoat,
    })

    ghiAuditLog({ hanh_dong: 'CAP_NHAT', bang: 'ho_ngheo', mo_ta: moTa }).catch(() => {})
    revalidateAll()
    revalidatePath('/dashboard/an-sinh/ho-ngheo')
    return { success: true, message: 'Đã ghi nhận thoát nghèo', suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  7. CAP_NHAT / KHAC — Ghi nhận chung
// ════════════════════════════════════════════════════════════
export async function suKienCapNhatKhac(input: {
  hoId?:      string
  hoTen?:     string
  loai:       'CAP_NHAT' | 'KET_HON' | 'KHAC'
  moTa:       string
  ngaySuKien?: string
}): Promise<KetQua> {
  try {
    if (!input.moTa?.trim()) return { success: false, message: 'Vui lòng nhập mô tả sự kiện' }

    let diaChi: string | null = null
    let hoTen = input.hoTen ?? null
    if (input.hoId) {
      const snap = await laySnapshotHo(input.hoId)
      diaChi = snap?.dia_chi_day ?? null
      hoTen = hoTen ?? snap?.chu_ho ?? null
    }

    const suKienId = await ghiSuKien({
      loai: input.loai, hoId: input.hoId, hoTen, diaChi,
      moTa: input.moTa.trim(), ngaySuKien: input.ngaySuKien || undefined,
    })

    ghiAuditLog({ hanh_dong: 'TAO', bang: 'he_thong', mo_ta: `Sự kiện dân cư: ${input.moTa.slice(0, 80)}` }).catch(() => {})
    revalidateAll()
    return { success: true, message: 'Đã ghi nhận sự kiện', suKienId: suKienId ?? undefined }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  HELPER: Điều chỉnh số nhân khẩu của hộ
// ════════════════════════════════════════════════════════════
async function tangSoNhanKhau(hoId: string, delta: number) {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('ho_dan').select('so_nhan_khau').eq('id', hoId).single()
    const cur = (data?.so_nhan_khau as number) ?? 0
    const moi = Math.max(0, cur + delta)
    await supabase.from('ho_dan').update({ so_nhan_khau: moi, updated_at: new Date().toISOString() }).eq('id', hoId)
  } catch { /* ignore */ }
}

// ════════════════════════════════════════════════════════════
//  QUERIES
// ════════════════════════════════════════════════════════════

// Lấy nhân khẩu của 1 hộ (để chọn người)
export async function layNhanKhauTheoHo(hoId: string): Promise<Array<{
  id: string; ho_ten: string; quan_he: string; ngay_sinh: string | null
  gioi_tinh: string; trang_thai: string; da_mat: boolean
}>> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('nhan_khau')
      .select('id, ho_ten, quan_he, ngay_sinh, gioi_tinh, trang_thai, da_mat')
      .eq('ho_id', hoId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({ ...r, da_mat: r.da_mat ?? false }))
  } catch { return [] }
}

// Lấy danh sách sự kiện gần đây
export interface SuKienItem {
  id: string
  loai_su_kien: string
  ho_ten: string | null
  dia_chi: string | null
  mo_ta: string
  trang_thai: string
  can_bo_ghi_ten: string | null
  ngay_su_kien: string
  created_at: string
}

export async function layDanhSachSuKien(limit = 30): Promise<SuKienItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('su_kien_dan_cu')
      .select('id, loai_su_kien, ho_ten, dia_chi, mo_ta, trang_thai, can_bo_ghi_ten, ngay_su_kien, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as SuKienItem[]
  } catch { return [] }
}

// Thống kê nhanh
export async function layThongKeSuKien(): Promise<{
  homNay: number; tuanNay: number; thangNay: number
}> {
  try {
    const supabase = await createClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data } = await supabase
      .from('su_kien_dan_cu')
      .select('created_at')
      .is('deleted_at', null)
      .gte('created_at', monthStart)

    const rows = data ?? []
    return {
      homNay:  rows.filter(r => r.created_at >= todayStart).length,
      tuanNay: rows.filter(r => r.created_at >= weekStart).length,
      thangNay: rows.length,
    }
  } catch {
    return { homNay: 0, tuanNay: 0, thangNay: 0 }
  }
}
