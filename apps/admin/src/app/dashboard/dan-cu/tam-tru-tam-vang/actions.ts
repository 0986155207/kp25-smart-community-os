'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TrangThaiTamTru, TrangThaiTamVang } from './constants'

export interface DangKyTamTru {
  id:               string
  ho_ten:           string
  ngay_sinh:        string | null
  gioi_tinh:        string | null
  so_cccd:          string | null
  noi_sinh:         string | null
  quoc_tich:        string
  dan_toc:          string | null
  dia_chi_thuong_tru: string
  tinh_thanh_goc:   string | null
  dia_chi_tam_tru:  string
  so_nha_tam_tru:   string | null
  duong_tam_tru:    string | null
  chu_nha_ho_ten:   string | null
  chu_nha_sdt:      string | null
  ly_do_tam_tru:    string
  ngay_bat_dau:     string
  ngay_ket_thuc:    string | null
  trang_thai:       TrangThaiTamTru
  so_to_khai:       string | null
  can_bo_tiep_nhan: string | null
  ghi_chu:          string | null
  created_at:       string
  updated_at:       string
}

export interface DangKyTamVang {
  id:               string
  ho_dan_id:        string | null
  nhan_khau_id:     string | null
  ho_ten:           string
  ngay_sinh:        string | null
  gioi_tinh:        string | null
  so_cccd:          string | null
  dia_chi_hien_tai: string
  dia_chi_tam_vang: string
  tinh_thanh_den:   string | null
  ly_do_tam_vang:   string
  ngay_di:          string
  ngay_du_kien_ve:  string | null
  ngay_thuc_te_ve:  string | null
  sdt_lien_lac:     string | null
  sdt_nguoi_than:   string | null
  ho_ten_nguoi_than: string | null
  trang_thai:       TrangThaiTamVang
  can_bo_tiep_nhan: string | null
  ghi_chu:          string | null
  created_at:       string
  updated_at:       string
}

// ─── Lấy danh sách tạm trú ────────────────────────────────────

export async function layDanhSachTamTru(filter?: string, q?: string): Promise<DangKyTamTru[]> {
  const supabase = await createClient()
  let query = supabase
    .from('dang_ky_tam_tru')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(300)

  if (filter && filter !== 'tat_ca') {
    const trangThaiMap: Record<string, string> = {
      dang_tam_tru: 'DANG_TAM_TRU',
      het_han:      'HET_HAN',
      da_roi_di:    'DA_ROI_DI',
    }
    const ts = trangThaiMap[filter]
    if (ts) query = query.eq('trang_thai', ts)
  }

  if (q) {
    query = query.or(
      `ho_ten.ilike.%${q}%,so_cccd.ilike.%${q}%,dia_chi_tam_tru.ilike.%${q}%,chu_nha_ho_ten.ilike.%${q}%`
    )
  }

  const { data, error } = await query
  if (error) return []
  return (data ?? []) as DangKyTamTru[]
}

// ─── Lấy danh sách tạm vắng ───────────────────────────────────

export async function layDanhSachTamVang(filter?: string, q?: string): Promise<DangKyTamVang[]> {
  const supabase = await createClient()
  let query = supabase
    .from('dang_ky_tam_vang')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(300)

  if (filter && filter !== 'tat_ca') {
    const trangThaiMap: Record<string, string> = {
      dang_vang: 'DANG_VANG',
      da_ve:     'DA_VE',
      qua_han:   'QUA_HAN',
    }
    const ts = trangThaiMap[filter]
    if (ts) query = query.eq('trang_thai', ts)
  }

  if (q) {
    query = query.or(
      `ho_ten.ilike.%${q}%,so_cccd.ilike.%${q}%,dia_chi_tam_vang.ilike.%${q}%,tinh_thanh_den.ilike.%${q}%`
    )
  }

  const { data, error } = await query
  if (error) return []
  return (data ?? []) as DangKyTamVang[]
}

// ─── Thống kê ──────────────────────────────────────────────────

export async function layThongKeTamTruVang(): Promise<{
  tamTru:    { dangTamTru: number; hetHan: number; daRoiDi: number; total: number }
  tamVang:   { dangVang: number; daVe: number; quaHan: number; total: number }
}> {
  const supabase = await createClient()

  const [tt, tv] = await Promise.all([
    supabase.from('dang_ky_tam_tru').select('trang_thai').is('deleted_at', null),
    supabase.from('dang_ky_tam_vang').select('trang_thai').is('deleted_at', null),
  ])

  const ttData = tt.data ?? []
  const tvData = tv.data ?? []

  return {
    tamTru: {
      dangTamTru: ttData.filter(r => r.trang_thai === 'DANG_TAM_TRU').length,
      hetHan:     ttData.filter(r => r.trang_thai === 'HET_HAN').length,
      daRoiDi:    ttData.filter(r => r.trang_thai === 'DA_ROI_DI').length,
      total:      ttData.length,
    },
    tamVang: {
      dangVang: tvData.filter(r => r.trang_thai === 'DANG_VANG').length,
      daVe:     tvData.filter(r => r.trang_thai === 'DA_VE').length,
      quaHan:   tvData.filter(r => r.trang_thai === 'QUA_HAN').length,
      total:    tvData.length,
    },
  }
}

// ─── Lấy 1 hồ sơ tạm trú ──────────────────────────────────────

export async function layTamTruById(id: string): Promise<DangKyTamTru | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dang_ky_tam_tru')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data as DangKyTamTru | null
}

// ─── Lấy 1 hồ sơ tạm vắng ────────────────────────────────────

export async function layTamVangById(id: string): Promise<DangKyTamVang | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dang_ky_tam_vang')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data as DangKyTamVang | null
}

// ─── Tạo mới tạm trú ──────────────────────────────────────────

export async function taoMoiTamTru(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const str = (k: string) => (formData.get(k) as string | null)?.trim() || null
  const strReq = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''

  const payload = {
    ho_ten:             strReq('ho_ten'),
    ngay_sinh:          str('ngay_sinh'),
    gioi_tinh:          str('gioi_tinh'),
    so_cccd:            str('so_cccd'),
    noi_sinh:           str('noi_sinh'),
    quoc_tich:          str('quoc_tich') ?? 'VN',
    dan_toc:            str('dan_toc') ?? 'Kinh',
    dia_chi_thuong_tru: strReq('dia_chi_thuong_tru'),
    tinh_thanh_goc:     str('tinh_thanh_goc'),
    dia_chi_tam_tru:    strReq('dia_chi_tam_tru'),
    so_nha_tam_tru:     str('so_nha_tam_tru'),
    duong_tam_tru:      str('duong_tam_tru'),
    chu_nha_ho_ten:     str('chu_nha_ho_ten'),
    chu_nha_sdt:        str('chu_nha_sdt'),
    chu_nha_cccd:       str('chu_nha_cccd'),
    ly_do_tam_tru:      strReq('ly_do_tam_tru') || 'LAM_VIEC',
    ngay_bat_dau:       strReq('ngay_bat_dau'),
    ngay_ket_thuc:      str('ngay_ket_thuc'),
    trang_thai:         'DANG_TAM_TRU' as TrangThaiTamTru,
    so_to_khai:         str('so_to_khai'),
    can_bo_tiep_nhan:   str('can_bo_tiep_nhan'),
    ghi_chu:            str('ghi_chu'),
  }

  if (!payload.ho_ten || !payload.dia_chi_thuong_tru || !payload.dia_chi_tam_tru || !payload.ngay_bat_dau) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
  }

  const { data, error } = await supabase.from('dang_ky_tam_tru').insert(payload).select('id').single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true, id: data.id }
}

// ─── Tạo mới tạm vắng ────────────────────────────────────────

export async function taoMoiTamVang(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const str = (k: string) => (formData.get(k) as string | null)?.trim() || null
  const strReq = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''

  const payload = {
    ho_dan_id:          str('ho_dan_id'),
    nhan_khau_id:       str('nhan_khau_id'),
    ho_ten:             strReq('ho_ten'),
    ngay_sinh:          str('ngay_sinh'),
    gioi_tinh:          str('gioi_tinh'),
    so_cccd:            str('so_cccd'),
    dia_chi_hien_tai:   strReq('dia_chi_hien_tai'),
    dia_chi_tam_vang:   strReq('dia_chi_tam_vang'),
    tinh_thanh_den:     str('tinh_thanh_den'),
    ly_do_tam_vang:     strReq('ly_do_tam_vang') || 'LAM_VIEC',
    ngay_di:            strReq('ngay_di'),
    ngay_du_kien_ve:    str('ngay_du_kien_ve'),
    sdt_lien_lac:       str('sdt_lien_lac'),
    sdt_nguoi_than:     str('sdt_nguoi_than'),
    ho_ten_nguoi_than:  str('ho_ten_nguoi_than'),
    trang_thai:         'DANG_VANG' as TrangThaiTamVang,
    can_bo_tiep_nhan:   str('can_bo_tiep_nhan'),
    ghi_chu:            str('ghi_chu'),
  }

  if (!payload.ho_ten || !payload.dia_chi_hien_tai || !payload.dia_chi_tam_vang || !payload.ngay_di) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
  }

  const { data, error } = await supabase.from('dang_ky_tam_vang').insert(payload).select('id').single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true, id: data.id }
}

// ─── Cập nhật trạng thái tạm trú ──────────────────────────────

export async function capNhatTrangThaiTamTru(
  id: string,
  trangThai: TrangThaiTamTru,
  ngayThucTe?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { trang_thai: trangThai }
  if (trangThai === 'DA_ROI_DI' && ngayThucTe) {
    update.ngay_ket_thuc = ngayThucTe
  }

  const { error } = await supabase
    .from('dang_ky_tam_tru')
    .update(update)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true }
}

// ─── Cập nhật trạng thái tạm vắng ────────────────────────────

export async function capNhatTrangThaiTamVang(
  id: string,
  trangThai: TrangThaiTamVang,
  ngayVe?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { trang_thai: trangThai }
  if (trangThai === 'DA_VE' && ngayVe) {
    update.ngay_thuc_te_ve = ngayVe
  }

  const { error } = await supabase
    .from('dang_ky_tam_vang')
    .update(update)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true }
}

// ─── Xoá mềm ──────────────────────────────────────────────────

export async function xoaTamTru(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('dang_ky_tam_tru')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true }
}

export async function xoaTamVang(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  await supabase
    .from('dang_ky_tam_vang')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/dashboard/dan-cu/tam-tru-tam-vang')
  return { success: true }
}
