'use server'

import { createClient } from '@/lib/supabase/server'

export interface PhanAnhMap {
  id: string
  tieuDe: string
  loai: string
  mucDo: string
  trangThai: string
  diaChiPhanAnh: string
  toaDoLat: number
  toaDoLng: number
}

export interface BanDoStats {
  tongHoDan: number
  tongNhanKhau: number
  phanAnhMoi: number
  phanAnhDangXuLy: number
}

export async function layDuLieuBanDoPublic(): Promise<{
  phanAnh: PhanAnhMap[]
  stats: BanDoStats
}> {
  try {
    const supabase = await createClient()

    const [paRes, hdRes] = await Promise.all([
      // Phản ánh có tọa độ GPS — hiển thị công khai
      supabase
        .from('phan_anh')
        .select('id, tieu_de, loai, muc_do, trang_thai, dia_chi_phan_anh, toa_do_lat, toa_do_lng')
        .is('deleted_at', null)
        .neq('trang_thai', 'DONG')
        .not('toa_do_lat', 'is', null)
        .not('toa_do_lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100),

      // Thống kê hộ dân — chỉ lấy số tổng, không lấy thông tin cá nhân
      supabase
        .from('ho_dan')
        .select('id, so_nhan_khau, trang_thai')
        .is('deleted_at', null),
    ])

    const phanAnhAll = await supabase
      .from('phan_anh')
      .select('trang_thai')
      .is('deleted_at', null)
      .neq('trang_thai', 'DONG')

    const phanAnh: PhanAnhMap[] = (paRes.data ?? []).map(p => ({
      id: p.id as string,
      tieuDe: (p.tieu_de ?? '') as string,
      loai: (p.loai ?? 'KHAC') as string,
      mucDo: (p.muc_do ?? 'TRUNG_BINH') as string,
      trangThai: (p.trang_thai ?? 'MOI') as string,
      diaChiPhanAnh: (p.dia_chi_phan_anh ?? '') as string,
      toaDoLat: p.toa_do_lat as number,
      toaDoLng: p.toa_do_lng as number,
    }))

    const hdData = hdRes.data ?? []
    const paData = phanAnhAll.data ?? []

    const stats: BanDoStats = {
      tongHoDan:       hdData.length,
      tongNhanKhau:    hdData.reduce((s, h) => s + ((h.so_nhan_khau as number) ?? 0), 0),
      phanAnhMoi:      paData.filter(p => p.trang_thai === 'MOI').length,
      phanAnhDangXuLy: paData.filter(p => p.trang_thai === 'DANG_XU_LY').length,
    }

    return { phanAnh, stats }
  } catch {
    return {
      phanAnh: [],
      stats: { tongHoDan: 0, tongNhanKhau: 0, phanAnhMoi: 0, phanAnhDangXuLy: 0 },
    }
  }
}
