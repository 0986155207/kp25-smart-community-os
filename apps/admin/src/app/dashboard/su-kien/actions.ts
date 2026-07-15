'use server'

import { KHU_PHO } from '@/lib/khu-pho'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SuKien, LoaiSuKien, TrangThaiSuKien } from './constants'

export type { SuKien }

// ─── Lấy danh sách ────────────────────────────────────────────

export async function layDanhSachSuKien(
  filter?: string,
  q?: string,
): Promise<SuKien[]> {
  const supabase = await createClient()
  let query = supabase
    .from('su_kien')
    .select('*')
    .is('deleted_at', null)
    .order('ngay_bat_dau', { ascending: false })
    .limit(200)

  if (filter && filter !== 'tat_ca') {
    // filter có thể là loại hoặc trạng thái
    const loaiKeys: LoaiSuKien[] = [
      'CHINH_TRI','VAN_HOA','THE_THAO','TU_THIEN',
      'HOP_MAT','AN_NINH','SUCK_KHOE','GIAO_DUC','KHAC',
    ]
    const ttKeys: TrangThaiSuKien[] = [
      'NHAP','SAP_DIEN_RA','DANG_DIEN_RA','DA_KET_THUC','HUY',
    ]
    if (loaiKeys.includes(filter as LoaiSuKien)) {
      query = query.eq('loai', filter)
    } else if (ttKeys.includes(filter as TrangThaiSuKien)) {
      query = query.eq('trang_thai', filter)
    }
  }

  if (q) {
    query = query.or(
      `tieu_de.ilike.%${q}%,dia_diem.ilike.%${q}%,don_vi_to_chuc.ilike.%${q}%,nguoi_phu_trach.ilike.%${q}%`
    )
  }

  const { data } = await query
  return (data ?? []) as SuKien[]
}

// ─── Lấy 1 sự kiện ────────────────────────────────────────────

export async function laySuKienById(id: string): Promise<SuKien | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('su_kien')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data as SuKien | null
}

// ─── Thống kê ──────────────────────────────────────────────────

export async function layThongKeSuKien() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('su_kien')
    .select('loai, trang_thai, so_luong_du_kien, so_luong_thuc_te, noi_bat')
    .is('deleted_at', null)

  const rows = data ?? []
  return {
    tong:          rows.length,
    sapDienRa:     rows.filter(r => r.trang_thai === 'SAP_DIEN_RA').length,
    dangDienRa:    rows.filter(r => r.trang_thai === 'DANG_DIEN_RA').length,
    daKetThuc:     rows.filter(r => r.trang_thai === 'DA_KET_THUC').length,
    noiBat:        rows.filter(r => r.noi_bat).length,
    tongNguoiDuKien: rows.reduce((s, r) => s + (r.so_luong_du_kien ?? 0), 0),
    tongNguoiThucTe: rows.reduce((s, r) => s + (r.so_luong_thuc_te ?? 0), 0),
    // theo loại
    CHINH_TRI:  rows.filter(r => r.loai === 'CHINH_TRI').length,
    VAN_HOA:    rows.filter(r => r.loai === 'VAN_HOA').length,
    THE_THAO:   rows.filter(r => r.loai === 'THE_THAO').length,
    TU_THIEN:   rows.filter(r => r.loai === 'TU_THIEN').length,
    HOP_MAT:    rows.filter(r => r.loai === 'HOP_MAT').length,
    AN_NINH:    rows.filter(r => r.loai === 'AN_NINH').length,
    SUCK_KHOE:  rows.filter(r => r.loai === 'SUCK_KHOE').length,
    GIAO_DUC:   rows.filter(r => r.loai === 'GIAO_DUC').length,
    KHAC:       rows.filter(r => r.loai === 'KHAC').length,
  }
}

// ─── Tạo mới ──────────────────────────────────────────────────

export async function taoMoiSuKien(
  formData: FormData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const str    = (k: string) => (formData.get(k) as string | null)?.trim() || null
  const strReq = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''
  const bool   = (k: string) => formData.get(k) === 'true' || formData.get(k) === 'on'
  const num    = (k: string) => {
    const v = formData.get(k) as string | null
    return v && v.trim() ? parseInt(v.trim(), 10) : null
  }

  const payload = {
    tieu_de:          strReq('tieu_de'),
    mo_ta:            str('mo_ta'),
    noi_dung_day_du:  str('noi_dung_day_du'),
    loai:             strReq('loai') || 'KHAC',
    trang_thai:       strReq('trang_thai') || 'SAP_DIEN_RA',
    ngay_bat_dau:     strReq('ngay_bat_dau'),
    ngay_ket_thuc:    str('ngay_ket_thuc'),
    dia_diem:         strReq('dia_diem'),
    dia_chi_cu_the:   str('dia_chi_cu_the'),
    anh_bia_url:      str('anh_bia_url'),
    so_luong_du_kien: num('so_luong_du_kien'),
    can_dang_ky:      bool('can_dang_ky'),
    han_dang_ky:      str('han_dang_ky'),
    don_vi_to_chuc:   str('don_vi_to_chuc') ?? `Ban điều hành ${KHU_PHO.ma}`,
    nguoi_phu_trach:  str('nguoi_phu_trach'),
    sdt_lien_he:      str('sdt_lien_he'),
    noi_bat:          bool('noi_bat'),
    ghi_chu:          str('ghi_chu'),
  }

  if (!payload.tieu_de || !payload.ngay_bat_dau || !payload.dia_diem) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
  }

  const { data, error } = await supabase
    .from('su_kien')
    .insert(payload)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/su-kien')
  return { success: true, id: data.id }
}

// ─── Cập nhật ─────────────────────────────────────────────────

export async function capNhatSuKien(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const str    = (k: string) => (formData.get(k) as string | null)?.trim() || null
  const strReq = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''
  const bool   = (k: string) => formData.get(k) === 'true' || formData.get(k) === 'on'
  const num    = (k: string) => {
    const v = formData.get(k) as string | null
    return v && v.trim() ? parseInt(v.trim(), 10) : null
  }

  const payload = {
    tieu_de:          strReq('tieu_de'),
    mo_ta:            str('mo_ta'),
    noi_dung_day_du:  str('noi_dung_day_du'),
    loai:             strReq('loai') || 'KHAC',
    trang_thai:       strReq('trang_thai') || 'SAP_DIEN_RA',
    ngay_bat_dau:     strReq('ngay_bat_dau'),
    ngay_ket_thuc:    str('ngay_ket_thuc'),
    dia_diem:         strReq('dia_diem'),
    dia_chi_cu_the:   str('dia_chi_cu_the'),
    anh_bia_url:      str('anh_bia_url'),
    so_luong_du_kien: num('so_luong_du_kien'),
    so_luong_thuc_te: num('so_luong_thuc_te'),
    can_dang_ky:      bool('can_dang_ky'),
    han_dang_ky:      str('han_dang_ky'),
    don_vi_to_chuc:   str('don_vi_to_chuc') ?? `Ban điều hành ${KHU_PHO.ma}`,
    nguoi_phu_trach:  str('nguoi_phu_trach'),
    sdt_lien_he:      str('sdt_lien_he'),
    noi_bat:          bool('noi_bat'),
    ghi_chu:          str('ghi_chu'),
  }

  const { error } = await supabase
    .from('su_kien')
    .update(payload)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/su-kien')
  revalidatePath(`/dashboard/su-kien/${id}`)
  return { success: true }
}

// ─── Cập nhật trạng thái nhanh ────────────────────────────────

export async function capNhatTrangThaiSuKien(
  id: string,
  trangThai: TrangThaiSuKien,
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('su_kien')
    .update({ trang_thai: trangThai })
    .eq('id', id)
    .is('deleted_at', null)
  revalidatePath('/dashboard/su-kien')
  revalidatePath(`/dashboard/su-kien/${id}`)
  return { success: true }
}

// ─── Toggle nổi bật ───────────────────────────────────────────

export async function toggleNoiBat(
  id: string,
  noiBat: boolean,
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('su_kien')
    .update({ noi_bat: noiBat })
    .eq('id', id)
    .is('deleted_at', null)
  revalidatePath('/dashboard/su-kien')
  return { success: true }
}

// ─── Cập nhật số lượng thực tế ────────────────────────────────

export async function capNhatSoLuong(
  id: string,
  soLuong: number,
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('su_kien')
    .update({ so_luong_thuc_te: soLuong })
    .eq('id', id)
    .is('deleted_at', null)
  revalidatePath(`/dashboard/su-kien/${id}`)
  return { success: true }
}

// ─── Xoá mềm ──────────────────────────────────────────────────

export async function xoaSuKien(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('su_kien')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/dashboard/su-kien')
  return { success: true }
}
