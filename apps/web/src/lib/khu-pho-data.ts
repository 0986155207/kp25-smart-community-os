import { cache } from 'react'
import { createServiceClient } from '@/lib/supabase/server'
import { KHU_PHO } from '@/lib/khu-pho'

// ============================================================
// Thông tin LIÊN HỆ của khu phố — đọc từ bảng don_vi.
// Mỗi khu phố có cán bộ/SĐT riêng nên KHÔNG hardcode, cũng không
// để trong env (đây là dữ liệu do Phường quản lý qua giao diện).
//
// Dùng React cache() → mỗi request chỉ truy vấn 1 lần dù nhiều
// component cùng gọi (Footer, trang Liên hệ, Đăng ký…).
// ============================================================

export interface ThongTinKhuPho {
  truongKpTen:  string | null
  truongKpSdt:  string | null
  biThuTen:     string | null
  biThuSdt:     string | null
  congAnTen:    string | null
  congAnSdt:    string | null
  anNinhTen:    string | null
  anNinhSdt:    string | null
  email:        string | null
  diaChi:       string | null
  diaChiUbnd:   string | null
  hotlineUbnd:  string | null
}

const RONG: ThongTinKhuPho = {
  truongKpTen: null, truongKpSdt: null,
  biThuTen: null, biThuSdt: null,
  congAnTen: null, congAnSdt: null,
  anNinhTen: null, anNinhSdt: null,
  email: null, diaChi: null,
  diaChiUbnd: null, hotlineUbnd: null,
}

export const layThongTinKhuPho = cache(async (): Promise<ThongTinKhuPho> => {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('don_vi')
      .select('truong_kp_ten, truong_kp_sdt, bi_thu_ten, bi_thu_sdt, cong_an_ten, cong_an_sdt, an_ninh_ten, an_ninh_sdt, email, dia_chi, dia_chi_ubnd, hotline_ubnd')
      .eq('id', KHU_PHO.id)
      .maybeSingle()

    if (!data) return RONG
    return {
      truongKpTen: data.truong_kp_ten ?? null,
      truongKpSdt: data.truong_kp_sdt ?? null,
      biThuTen:    data.bi_thu_ten    ?? null,
      biThuSdt:    data.bi_thu_sdt    ?? null,
      congAnTen:   data.cong_an_ten   ?? null,
      congAnSdt:   data.cong_an_sdt   ?? null,
      anNinhTen:   data.an_ninh_ten   ?? null,
      anNinhSdt:   data.an_ninh_sdt   ?? null,
      email:       data.email         ?? null,
      diaChi:      data.dia_chi       ?? null,
      diaChiUbnd:  data.dia_chi_ubnd  ?? null,
      hotlineUbnd: data.hotline_ubnd  ?? null,
    }
  } catch (err) {
    console.error('[KhuPho] Lỗi đọc thông tin liên hệ:', err)
    return RONG
  }
})

/** Định dạng SĐT để hiển thị: 0773735317 → 0773 735 317 */
export function dinhDangSdt(sdt: string | null | undefined): string {
  const s = (sdt ?? '').replace(/\D/g, '')
  if (s.length !== 10) return sdt ?? ''
  return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`
}
