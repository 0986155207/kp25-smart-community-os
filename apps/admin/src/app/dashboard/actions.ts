'use server'

import { createServiceClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────

export interface DashboardStats {
  tongHoDan:        number
  tongNhanKhau:     number
  phanAnhMoi:       number
  phanAnhDangXuLy:  number
  phanAnhDaXuLy:    number
  dangTamTru:       number
  suKienThangNay:   number
  tyLeXuLy:         number
  // so sánh tháng trước
  phanAnhMoiDelta:  number   // % thay đổi so tháng trước
  capNhatLuc:       string
}

export interface DiemTrendThang {
  thang:   string   // 'T1', 'T2', ...
  moi:     number
  daXuLy:  number
  tong:    number
}

export interface PhanAnhTrangThai {
  name:  string
  value: number
  color: string
}

export interface SuKienSapToi {
  id:            string
  tieu_de:       string
  loai:          string
  trang_thai:    string
  ngay_bat_dau:  string
  dia_diem:      string | null
  noi_bat:       boolean
}

export interface PhanAnhGanDay {
  id:               string
  tieu_de:          string
  loai:             string
  trang_thai:       string
  muc_do:           string
  created_at:       string
  dia_chi_phan_anh: string | null
}

// ─── Thống kê tổng quan ───────────────────────────────────────

export async function layDashboardStats(): Promise<DashboardStats> {
  try {
    const svc = createServiceClient()

    const now    = new Date()
    const thang1 = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const thang2 = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // Tháng trước
    const prev1  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const prev2  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    const [
      hoDan,
      paMoi, paDangXL, paDaXL,
      tamTru, suKien,
      paMoiThangTruoc,
    ] = await Promise.all([
      svc.from('ho_dan').select('id, so_nhan_khau').is('deleted_at', null),

      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'MOI').is('deleted_at', null),
      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'DANG_XU_LY').is('deleted_at', null),
      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'DA_XU_LY').is('deleted_at', null),

      svc.from('dang_ky_tam_tru').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'DANG_TRU').is('deleted_at', null),

      svc.from('su_kien').select('id', { count: 'exact', head: true })
         .in('trang_thai', ['SAP_DIEN_RA', 'DANG_DIEN_RA'])
         .gte('ngay_bat_dau', thang1).lte('ngay_bat_dau', thang2)
         .is('deleted_at', null),

      // PA mới tháng trước để tính delta
      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'MOI')
         .gte('created_at', prev1).lte('created_at', prev2)
         .is('deleted_at', null),
    ])

    const tongHoDan     = hoDan.data?.length ?? 0
    const tongNhanKhau  = hoDan.data?.reduce((s, h) => s + (h.so_nhan_khau ?? 0), 0) ?? 0
    const moiCount      = paMoi.count ?? 0
    const dangXLCount   = paDangXL.count ?? 0
    const daXLCount     = paDaXL.count ?? 0
    const tongPA        = moiCount + dangXLCount + daXLCount
    const tyLeXuLy      = tongPA > 0 ? Math.round((daXLCount / tongPA) * 100) : 0

    const moiThangTruoc = paMoiThangTruoc.count ?? 0
    const delta = moiThangTruoc > 0
      ? Math.round(((moiCount - moiThangTruoc) / moiThangTruoc) * 100)
      : moiCount > 0 ? 100 : 0

    return {
      tongHoDan,
      tongNhanKhau,
      phanAnhMoi:       moiCount,
      phanAnhDangXuLy:  dangXLCount,
      phanAnhDaXuLy:    daXLCount,
      dangTamTru:       tamTru.count ?? 0,
      suKienThangNay:   suKien.count ?? 0,
      tyLeXuLy,
      phanAnhMoiDelta:  delta,
      capNhatLuc:       new Date().toISOString(),
    }
  } catch {
    return {
      tongHoDan: 0, tongNhanKhau: 0,
      phanAnhMoi: 0, phanAnhDangXuLy: 0, phanAnhDaXuLy: 0,
      dangTamTru: 0, suKienThangNay: 0, tyLeXuLy: 0,
      phanAnhMoiDelta: 0,
      capNhatLuc: new Date().toISOString(),
    }
  }
}

// ─── Xu hướng phản ánh 6 tháng ───────────────────────────────

export async function layXuHuong6Thang(): Promise<DiemTrendThang[]> {
  try {
    const svc = createServiceClient()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const { data } = await svc
      .from('phan_anh')
      .select('trang_thai, created_at')
      .is('deleted_at', null)
      .gte('created_at', sixMonthsAgo.toISOString())

    if (!data) return []

    // Tạo 6 bucket tháng
    const buckets: Record<string, DiemTrendThang> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = { thang: `T${d.getMonth() + 1}`, moi: 0, daXuLy: 0, tong: 0 }
    }

    for (const row of data) {
      const d   = new Date(row.created_at as string)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!buckets[key]) continue
      buckets[key]!.tong++
      if (row.trang_thai === 'MOI')       buckets[key]!.moi++
      if (row.trang_thai === 'DA_XU_LY')  buckets[key]!.daXuLy++
    }

    return Object.values(buckets)
  } catch {
    return []
  }
}

// ─── Phân bổ trạng thái phản ánh ─────────────────────────────

export async function layPhanAnhTheoTrangThai(): Promise<PhanAnhTrangThai[]> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('phan_anh')
      .select('trang_thai')
      .is('deleted_at', null)

    if (!data) return []

    const counts: Record<string, number> = {}
    for (const row of data) {
      const tt = row.trang_thai as string
      counts[tt] = (counts[tt] ?? 0) + 1
    }

    const CFG: Record<string, { name: string; color: string }> = {
      MOI:          { name: 'Mới',         color: '#F59E0B' },
      DANG_XU_LY:   { name: 'Đang xử lý', color: '#3B82F6' },
      CHO_PHAN_HOI: { name: 'Chờ phản hồi', color: '#8B5CF6' },
      DA_XU_LY:     { name: 'Đã xử lý',   color: '#10B981' },
      DONG:         { name: 'Đã đóng',     color: '#94A3B8' },
    }

    return Object.entries(counts)
      .map(([k, v]) => ({ name: CFG[k]?.name ?? k, value: v, color: CFG[k]?.color ?? '#94A3B8' }))
      .filter(i => i.value > 0)
  } catch {
    return []
  }
}

// ─── Sự kiện sắp tới ─────────────────────────────────────────

export async function laySuKienSapToi(): Promise<SuKienSapToi[]> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('su_kien')
      .select('id, tieu_de, loai, trang_thai, ngay_bat_dau, dia_diem, noi_bat')
      .in('trang_thai', ['SAP_DIEN_RA', 'DANG_DIEN_RA'])
      .gte('ngay_bat_dau', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null)
      .order('ngay_bat_dau', { ascending: true })
      .limit(6)

    return (data ?? []) as SuKienSapToi[]
  } catch {
    return []
  }
}

// ─── Phản ánh gần đây ────────────────────────────────────────

export async function layPhanAnhGanDay(): Promise<PhanAnhGanDay[]> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('phan_anh')
      .select('id, tieu_de, loai, trang_thai, muc_do, created_at, dia_chi_phan_anh')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8)

    return (data ?? []) as PhanAnhGanDay[]
  } catch {
    return []
  }
}

// ─── Thống kê hôm nay ────────────────────────────────────────

export interface ThongKeHomNay {
  phanAnhMoiHomNay:   number   // tạo mới hôm nay
  phanAnhDongHomNay:  number   // đóng/xử lý xong hôm nay
  thongBaoThangNay:   number   // thông báo gửi tháng này
  phanAnhKhanCap:     number   // mức độ KHAN_CAP đang mở
}

export async function layThongKeHomNay(): Promise<ThongKeHomNay> {
  try {
    const svc     = createServiceClient()
    const now     = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const thangStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [moiHomNay, dongHomNay, thongBao, khanCap] = await Promise.all([
      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .gte('created_at', todayStart).is('deleted_at', null),

      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .in('trang_thai', ['DA_XU_LY', 'DONG'])
         .gte('updated_at', todayStart).is('deleted_at', null),

      svc.from('thong_bao').select('id', { count: 'exact', head: true })
         .gte('created_at', thangStart).is('deleted_at', null),

      svc.from('phan_anh').select('id', { count: 'exact', head: true })
         .eq('muc_do', 'KHAN_CAP')
         .in('trang_thai', ['MOI', 'DANG_XU_LY'])
         .is('deleted_at', null),
    ])

    return {
      phanAnhMoiHomNay:  moiHomNay.count  ?? 0,
      phanAnhDongHomNay: dongHomNay.count ?? 0,
      thongBaoThangNay:  thongBao.count   ?? 0,
      phanAnhKhanCap:    khanCap.count    ?? 0,
    }
  } catch {
    return { phanAnhMoiHomNay: 0, phanAnhDongHomNay: 0, thongBaoThangNay: 0, phanAnhKhanCap: 0 }
  }
}

// ─── Thống kê An sinh xã hội ─────────────────────────────────

export interface ThongKeAnSinh {
  hoNgheo:      number
  hoCanNgheo:   number
  nguoiCaoTuoi: number
  bhytConHan:   number
}

export async function layThongKeAnSinh(): Promise<ThongKeAnSinh> {
  try {
    const svc = createServiceClient()

    const [hoNgheoRes, hoCanNgheoRes, nctRes, bhytRes] = await Promise.all([
      svc.from('ho_ngheo').select('id', { count: 'exact', head: true })
         .eq('loai', 'NGHEO').eq('trang_thai', 'DANG_HUONG').is('deleted_at', null),

      svc.from('ho_ngheo').select('id', { count: 'exact', head: true })
         .eq('loai', 'CAN_NGHEO').eq('trang_thai', 'DANG_HUONG').is('deleted_at', null),

      svc.from('nguoi_cao_tuoi').select('id', { count: 'exact', head: true })
         .is('deleted_at', null).not('da_mat', 'eq', true),

      svc.from('bhyt').select('id', { count: 'exact', head: true })
         .eq('trang_thai', 'CON_HAN').is('deleted_at', null),
    ])

    return {
      hoNgheo:      hoNgheoRes.count  ?? 0,
      hoCanNgheo:   hoCanNgheoRes.count ?? 0,
      nguoiCaoTuoi: nctRes.count      ?? 0,
      bhytConHan:   bhytRes.count     ?? 0,
    }
  } catch {
    return { hoNgheo: 0, hoCanNgheo: 0, nguoiCaoTuoi: 0, bhytConHan: 0 }
  }
}

// ─── Phản ánh theo loại ───────────────────────────────────────

export interface PhanAnhTheoLoai {
  loai:     string
  ten:      string
  soLuong:  number
  color:    string
}

const LOAI_CFG: Record<string, { ten: string; color: string }> = {
  AN_NINH:      { ten: 'An ninh trật tự',  color: '#EF4444' },
  MOI_TRUONG:   { ten: 'Môi trường',        color: '#10B981' },
  CO_SO_HA_TANG:{ ten: 'Cơ sở hạ tầng',    color: '#3B82F6' },
  AN_SINH:      { ten: 'An sinh xã hội',    color: '#EC4899' },
  GIAO_THONG:   { ten: 'Giao thông',        color: '#F59E0B' },
  KHAC:         { ten: 'Khác',              color: '#94A3B8' },
}

export async function layPhanAnhTheoLoai(): Promise<PhanAnhTheoLoai[]> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('phan_anh')
      .select('loai')
      .is('deleted_at', null)

    if (!data) return []

    const counts: Record<string, number> = {}
    for (const row of data) {
      const k = row.loai as string
      counts[k] = (counts[k] ?? 0) + 1
    }

    return Object.entries(counts)
      .map(([k, v]) => ({
        loai:    k,
        ten:     LOAI_CFG[k]?.ten   ?? k,
        soLuong: v,
        color:   LOAI_CFG[k]?.color ?? '#94A3B8',
      }))
      .sort((a, b) => b.soLuong - a.soLuong)
  } catch {
    return []
  }
}

// ─── Hoạt động 30 ngày gần nhất ──────────────────────────────

export interface DiemHoatDong {
  ngay:    string   // 'dd/MM'
  soLuong: number
}

export async function layHoatDong30Ngay(): Promise<DiemHoatDong[]> {
  try {
    const svc  = createServiceClient()
    const from = new Date()
    from.setDate(from.getDate() - 29)
    from.setHours(0, 0, 0, 0)

    const { data } = await svc
      .from('phan_anh')
      .select('created_at')
      .gte('created_at', from.toISOString())
      .is('deleted_at', null)

    // Tạo 30 bucket ngày
    const buckets: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = 0
    }

    for (const row of data ?? []) {
      const d   = new Date(row.created_at as string)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in buckets) buckets[key]!++
    }

    return Object.entries(buckets).map(([ngay, soLuong]) => ({ ngay, soLuong }))
  } catch {
    return []
  }
}
