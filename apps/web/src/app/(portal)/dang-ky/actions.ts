'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Gửi đơn đăng ký tạm trú ────────────────────────────────────
export async function guiDangKyTamTru(
  formData: FormData
): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    const supabase = await createClient()
    const s = (k: string) => (formData.get(k) as string | null)?.trim() || null
    const r = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''

    const hoTen = r('ho_ten')
    const diaChiThuongTru = r('dia_chi_thuong_tru')
    const diaChiTamTru = r('dia_chi_tam_tru')
    const ngayBatDau = r('ngay_bat_dau')

    if (!hoTen)          return { success: false, message: 'Vui lòng nhập họ tên' }
    if (!diaChiThuongTru) return { success: false, message: 'Vui lòng nhập địa chỉ thường trú' }
    if (!diaChiTamTru)   return { success: false, message: 'Vui lòng nhập địa chỉ tạm trú' }
    if (!ngayBatDau)     return { success: false, message: 'Vui lòng chọn ngày bắt đầu' }

    const { data, error } = await supabase
      .from('dang_ky_tam_tru')
      .insert({
        ho_ten:              hoTen,
        ngay_sinh:           s('ngay_sinh'),
        gioi_tinh:           s('gioi_tinh'),
        so_cccd:             s('so_cccd'),
        noi_sinh:            s('noi_sinh'),
        quoc_tich:           s('quoc_tich') ?? 'VN',
        dan_toc:             s('dan_toc') ?? 'Kinh',
        dia_chi_thuong_tru:  diaChiThuongTru,
        tinh_thanh_goc:      s('tinh_thanh_goc'),
        dia_chi_tam_tru:     diaChiTamTru,
        so_nha_tam_tru:      s('so_nha_tam_tru'),
        duong_tam_tru:       s('duong_tam_tru'),
        chu_nha_ho_ten:      s('chu_nha_ho_ten'),
        chu_nha_sdt:         s('chu_nha_sdt'),
        ly_do_tam_tru:       r('ly_do_tam_tru') || 'LAM_VIEC',
        ngay_bat_dau:        ngayBatDau,
        ngay_ket_thuc:       s('ngay_ket_thuc'),
        trang_thai:          'DANG_TAM_TRU',
        ghi_chu:             s('ghi_chu'),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[guiDangKyTamTru]', error)
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    return {
      success: true,
      id: data.id,
      message: 'Đăng ký tạm trú thành công! Ban quản lý khu phố sẽ liên hệ xác nhận trong 1–2 ngày làm việc.',
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Gửi khai báo tạm vắng ─────────────────────────────────────
export async function guiDangKyTamVang(
  formData: FormData
): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    const supabase = await createClient()
    const s = (k: string) => (formData.get(k) as string | null)?.trim() || null
    const r = (k: string) => (formData.get(k) as string | null)?.trim() ?? ''

    const hoTen = r('ho_ten')
    const diaChiHienTai = r('dia_chi_hien_tai')
    const diaChiTamVang = r('dia_chi_tam_vang')
    const ngayDi = r('ngay_di')

    if (!hoTen)          return { success: false, message: 'Vui lòng nhập họ tên' }
    if (!diaChiHienTai)  return { success: false, message: 'Vui lòng nhập địa chỉ tại KP25' }
    if (!diaChiTamVang)  return { success: false, message: 'Vui lòng nhập nơi đến' }
    if (!ngayDi)         return { success: false, message: 'Vui lòng chọn ngày đi' }

    const { data, error } = await supabase
      .from('dang_ky_tam_vang')
      .insert({
        ho_ten:            hoTen,
        ngay_sinh:         s('ngay_sinh'),
        gioi_tinh:         s('gioi_tinh'),
        so_cccd:           s('so_cccd'),
        dia_chi_hien_tai:  diaChiHienTai,
        dia_chi_tam_vang:  diaChiTamVang,
        tinh_thanh_den:    s('tinh_thanh_den'),
        ly_do_tam_vang:    r('ly_do_tam_vang') || 'LAM_VIEC',
        ngay_di:           ngayDi,
        ngay_du_kien_ve:   s('ngay_du_kien_ve'),
        sdt_lien_lac:      s('sdt_lien_lac'),
        sdt_nguoi_than:    s('sdt_nguoi_than'),
        ho_ten_nguoi_than: s('ho_ten_nguoi_than'),
        trang_thai:        'DANG_VANG',
        ghi_chu:           s('ghi_chu'),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[guiDangKyTamVang]', error)
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    return {
      success: true,
      id: data.id,
      message: 'Khai báo tạm vắng thành công! Đơn đã được tiếp nhận và lưu vào hệ thống.',
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Tra cứu theo CCCD ────────────────────────────────────────
export async function traCuuTheoCCCD(cccd: string): Promise<{
  tamTru:  { id: string; trang_thai: string; dia_chi_tam_tru: string; ngay_bat_dau: string; ngay_ket_thuc: string | null; ly_do_tam_tru: string; created_at: string }[]
  tamVang: { id: string; trang_thai: string; dia_chi_tam_vang: string; ngay_di: string; ngay_du_kien_ve: string | null; ly_do_tam_vang: string; created_at: string }[]
}> {
  const supabase = await createClient()
  const cccdClean = cccd.trim()

  const [tt, tv] = await Promise.all([
    supabase
      .from('dang_ky_tam_tru')
      .select('id, trang_thai, dia_chi_tam_tru, ngay_bat_dau, ngay_ket_thuc, ly_do_tam_tru, created_at')
      .eq('so_cccd', cccdClean)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('dang_ky_tam_vang')
      .select('id, trang_thai, dia_chi_tam_vang, ngay_di, ngay_du_kien_ve, ly_do_tam_vang, created_at')
      .eq('so_cccd', cccdClean)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  return {
    tamTru:  (tt.data ?? []) as { id: string; trang_thai: string; dia_chi_tam_tru: string; ngay_bat_dau: string; ngay_ket_thuc: string | null; ly_do_tam_tru: string; created_at: string }[],
    tamVang: (tv.data ?? []) as { id: string; trang_thai: string; dia_chi_tam_vang: string; ngay_di: string; ngay_du_kien_ve: string | null; ly_do_tam_vang: string; created_at: string }[],
  }
}
