'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { KHU_PHO } from '@/lib/khu-pho'

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

// ─── Ranh giới khu phố của bản triển khai này ────────────────
export interface RanhGioiKhuPho {
  ranhGioi: [number, number][]
  tam:      [number, number] | null
  zoom:     number
}

const diemHopLe = (d: unknown): d is [number, number] =>
  Array.isArray(d) && d.length === 2 && typeof d[0] === 'number' && typeof d[1] === 'number'

/** Lấy ranh giới khu phố từ bảng don_vi (không hardcode) */
export async function layRanhGioiKhuPho(): Promise<RanhGioiKhuPho> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('don_vi')
      .select('ranh_gioi, tam_lat, tam_lng, zoom')
      .eq('id', KHU_PHO.id)
      .maybeSingle()

    const raw = Array.isArray(data?.ranh_gioi) ? data!.ranh_gioi : []
    return {
      ranhGioi: raw.filter(diemHopLe),
      tam: data?.tam_lat != null && data?.tam_lng != null
        ? [Number(data.tam_lat), Number(data.tam_lng)]
        : null,
      zoom: data?.zoom ?? 16,
    }
  } catch (err) {
    console.error('[BanDo] Lỗi đọc ranh giới:', err)
    return { ranhGioi: [], tam: null, zoom: 16 }
  }
}

export async function layDuLieuBanDoPublic(): Promise<{
  phanAnh: PhanAnhMap[]
  stats: BanDoStats
}> {
  try {
    const supabase = await createClient()
    // ho_dan chứa PII → đọc bằng service role (server-side), chỉ tính số tổng
    const svc = createServiceClient()

    const [paRes, hdRes] = await Promise.all([
      // Phản ánh có tọa độ GPS — hiển thị công khai (đọc anon được)
      supabase
        .from('phan_anh')
        .select('id, tieu_de, loai, muc_do, trang_thai, dia_chi_phan_anh, toa_do_lat, toa_do_lng')
        .is('deleted_at', null)
        .eq('don_vi_id', KHU_PHO.id)
        .neq('trang_thai', 'DONG')
        .not('toa_do_lat', 'is', null)
        .not('toa_do_lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100),

      // Thống kê hộ dân — chỉ lấy số tổng, không lấy thông tin cá nhân
      svc
        .from('ho_dan')
        .select('id, so_nhan_khau, trang_thai')
        .is('deleted_at', null)
        .eq('don_vi_id', KHU_PHO.id),
    ])

    const phanAnhAll = await supabase
      .from('phan_anh')
      .select('trang_thai')
      .is('deleted_at', null)
      .eq('don_vi_id', KHU_PHO.id)
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
