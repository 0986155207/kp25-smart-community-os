import { createClient, createServiceClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import QuickActions from '@/components/home/QuickActions'
import StatsSection from '@/components/home/StatsSection'
import NewsSection from '@/components/home/NewsSection'
import EventsSection from '@/components/home/EventsSection'
import { mapThongBao } from '@/lib/utils'
import type { ThongBao } from '@kp25/types'

export const revalidate = 60

interface SuKienTomTat {
  id: string; tieuDe: string; loai: string; trangThai: string
  ngayBatDau: string; diaDiem: string; noiBat: boolean; anhBiaUrl: string | null
}

async function getSuKienSapToi(): Promise<SuKienTomTat[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('su_kien')
      .select('id, tieu_de, loai, trang_thai, ngay_bat_dau, dia_diem, noi_bat, anh_bia_url')
      .is('deleted_at', null)
      .in('trang_thai', ['SAP_DIEN_RA', 'DANG_DIEN_RA'])
      .order('noi_bat', { ascending: false })
      .order('ngay_bat_dau', { ascending: true })
      .limit(3)
    return (data ?? []).map(r => ({
      id:          r['id']           as string,
      tieuDe:      r['tieu_de']      as string,
      loai:        r['loai']         as string,
      trangThai:   r['trang_thai']   as string,
      ngayBatDau:  r['ngay_bat_dau'] as string,
      diaDiem:     r['dia_diem']     as string,
      noiBat:      (r['noi_bat'] ?? false) as boolean,
      anhBiaUrl:   r['anh_bia_url']  as string | null,
    }))
  } catch { return [] }
}

async function getThongBaoMoiNhat(): Promise<ThongBao[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('thong_bao')
      .select('*')
      .is('deleted_at', null)
      .order('ghim_len', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    // Supabase trả về snake_case → map sang camelCase
    return (data ?? []).map(mapThongBao) as ThongBao[]
  } catch {
    return []
  }
}

async function getDashboardStats() {
  try {
    const supabase = await createClient()
    // ho_dan chứa PII → đọc bằng service role (server-side), chỉ tính số tổng
    const svc = createServiceClient()

    const [hoDan, phanAnhDaXuLy, phanAnhDangXuLy] = await Promise.all([
      svc.from('ho_dan').select('id, so_nhan_khau').is('deleted_at', null),
      supabase
        .from('phan_anh')
        .select('id', { count: 'exact' })
        .eq('trang_thai', 'DA_XU_LY')
        .is('deleted_at', null),
      supabase
        .from('phan_anh')
        .select('id', { count: 'exact' })
        .eq('trang_thai', 'DANG_XU_LY')
        .is('deleted_at', null),
    ])

    const tongHoDan = hoDan.data?.length ?? 0
    const tongNhanKhau =
      hoDan.data?.reduce((sum, h) => sum + ((h['so_nhan_khau'] as number) ?? 0), 0) ?? 0

    return {
      tongHoDan,
      tongNhanKhau,
      phanAnhDaXuLy: phanAnhDaXuLy.count ?? 0,
      phanAnhDangXuLy: phanAnhDangXuLy.count ?? 0,
    }
  } catch {
    return undefined
  }
}

export default async function TrangChu() {
  const [thongBaoList, stats, suKienList] = await Promise.all([
    getThongBaoMoiNhat(),
    getDashboardStats(),
    getSuKienSapToi(),
  ])

  return (
    <>
      <HeroSection />
      <QuickActions />
      <StatsSection data={stats} />
      <EventsSection items={suKienList} />
      <NewsSection items={thongBaoList} />
    </>
  )
}
