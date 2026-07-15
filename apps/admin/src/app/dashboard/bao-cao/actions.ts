'use server'

import { KHU_PHO } from '@/lib/khu-pho'
import { createServiceClient } from '@/lib/supabase/server'
const createClient = () => createServiceClient()

// ─── Types ─────────────────────────────────────────────────────

export interface KpiTongQuan {
  tongHoDan:      number
  tongNhanKhau:   number
  tongPhanAnh:    number
  tyLeXuLyPA:     number   // %
  tongBHYT:       number
  tongHoNgheo:    number
  tongNCT:        number
  tongThongBao:   number
}

export interface PhanBoTo {
  ten:     string
  soHo:    number
  soNguoi: number
}

export interface PieSlice {
  name:  string
  value: number
  color: string
}

export interface BarSlice {
  nhom:    string
  soNguoi: number
}

export interface PhanAnhThang {
  thang:       string
  moi:         number
  dangXuLy:    number
  daXuLy:      number
}

export interface BaoCaoData {
  kpi:              KpiTongQuan
  // Dân cư
  phanBoTo:         PhanBoTo[]
  phanBoGioiTinh:   PieSlice[]
  phanBoDoTuoi:     BarSlice[]
  phanBoCuTru:      PieSlice[]
  // Phản ánh
  phanAnhTheoThang: PhanAnhThang[]
  phanAnhTheoLoai:  PieSlice[]
  phanAnhTheoTT:    PieSlice[]
  // An sinh
  bhytTheoTT:       PieSlice[]
  hoNgheoTheoLoai:  PieSlice[]
  nctTheoSK:        PieSlice[]
  // Meta
  ngayTao:          string
}

// ─── Helper: tính tuổi ─────────────────────────────────────────
function tinhTuoi(ngaySinh: string): number {
  const b = new Date(ngaySinh)
  const t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--
  return age
}

// ─── Helper: nhãn tháng ────────────────────────────────────────
function thangKey(date: Date): string {
  return `T${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`
}

// ─── Main action ───────────────────────────────────────────────
export async function layDuLieuBaoCao(): Promise<BaoCaoData> {
  const supabase = createClient()

  const [
    hoRes, nkRes, paRes, tbRes,
    bhytRes, hnRes, nctRes,
  ] = await Promise.all([
    supabase.from('ho_dan').select('id, to_truong, so_nhan_khau, trang_thai').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    // nhan_khau: lấy tất cả (kể cả da_mat) để dùng cho biểu đồ nhân khẩu học
    supabase.from('nhan_khau').select('gioi_tinh, ngay_sinh, trang_thai, da_mat').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    supabase.from('phan_anh').select('trang_thai, loai, created_at').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    supabase.from('thong_bao').select('id').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    supabase.from('bhyt').select('trang_thai').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    supabase.from('ho_ngheo').select('loai, trang_thai').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
    // nguoi_cao_tuoi: lấy tất cả (kể cả da_mat) để đếm tổng khớp với trang Dân cư
    supabase.from('nguoi_cao_tuoi').select('tinh_trang_sk, da_mat').eq('don_vi_id', KHU_PHO.id).is('deleted_at', null),
  ])

  const hoDan   = hoRes.data  ?? []
  const nk      = nkRes.data  ?? []
  const pa      = paRes.data  ?? []
  const bhyt    = bhytRes.data ?? []
  const hn      = hnRes.data  ?? []
  const nct     = nctRes.data ?? []

  // ── KPI ─────────────────────────────────────────────────────
  const tongHoDan = hoDan.length

  // ① Nhân khẩu: dùng SUM(ho_dan.so_nhan_khau) — khớp với trang Dân cư
  //    (COUNT nhan_khau rows có thể ít hơn nếu chưa nhập đủ từng người)
  const tongNhanKhau = hoDan.reduce((s, h) => s + ((h.so_nhan_khau as number | null) ?? 0), 0)

  // Nhân khẩu còn sống (dùng cho biểu đồ nhân khẩu học, loại trừ người đã mất)
  const nkConSong    = nk.filter(n => !(n.da_mat as boolean))
  // NCT còn sống (dùng cho KPI + biểu đồ sức khỏe — khớp với trang Người cao tuổi)
  const nctConSong   = nct.filter(n => !(n.da_mat as boolean))

  const tongPhanAnh  = pa.length
  const paXong       = pa.filter(p => p.trang_thai === 'DA_XU_LY' || p.trang_thai === 'DONG').length
  const tyLeXuLyPA   = tongPhanAnh > 0 ? Math.round(paXong / tongPhanAnh * 100) : 0

  const kpi: KpiTongQuan = {
    tongHoDan,
    tongNhanKhau,                                              // ← SUM(so_nhan_khau) khớp Dân cư
    tongPhanAnh,
    tyLeXuLyPA,
    tongBHYT:    bhyt.length,
    tongHoNgheo: hn.filter(h => h.trang_thai === 'DANG_HUONG').length,
    tongNCT:     nctConSong.length,                            // ← NCT còn sống, khớp trang NCT & Dân cư
    tongThongBao: tbRes.data?.length ?? 0,
  }

  // ── Phân bổ theo Tổ / Khu vực ───────────────────────────────
  const toMap = new Map<string, { soHo: number; soNguoi: number }>()
  hoDan.forEach(h => {
    const ten = (h.to_truong as string | null)?.trim() || 'Chưa phân tổ'
    const cur = toMap.get(ten) ?? { soHo: 0, soNguoi: 0 }
    cur.soHo++
    cur.soNguoi += (h.so_nhan_khau as number | null) ?? 0
    toMap.set(ten, cur)
  })
  const phanBoTo: PhanBoTo[] = [...toMap.entries()]
    .map(([ten, v]) => ({ ten, ...v }))
    .sort((a, b) => b.soHo - a.soHo)
    .slice(0, 12)

  // ── Giới tính (nhân khẩu còn sống) ─────────────────────────
  let nam = 0, nu = 0, khac = 0
  nkConSong.forEach(n => {
    const g = n.gioi_tinh as string | null
    if (g === 'NAM') nam++
    else if (g === 'NU') nu++
    else khac++
  })
  const phanBoGioiTinh: PieSlice[] = [
    { name: 'Nam',   value: nam,  color: '#3B82F6' },
    { name: 'Nữ',    value: nu,   color: '#EC4899' },
    ...(khac > 0 ? [{ name: 'Khác', value: khac, color: '#94A3B8' }] : []),
  ]

  // ── Nhóm độ tuổi (nhân khẩu còn sống) ──────────────────────
  const ageGroups: Record<string, number> = {
    'Dưới 6': 0, '6–17': 0, '18–35': 0,
    '36–60': 0,  'Trên 60': 0, 'Chưa rõ': 0,
  }
  nkConSong.forEach(n => {
    if (!n.ngay_sinh) { ageGroups['Chưa rõ']!++; return }
    const age = tinhTuoi(n.ngay_sinh as string)
    if (age < 6)        ageGroups['Dưới 6']!++
    else if (age <= 17) ageGroups['6–17']!++
    else if (age <= 35) ageGroups['18–35']!++
    else if (age <= 60) ageGroups['36–60']!++
    else                ageGroups['Trên 60']!++
  })
  const phanBoDoTuoi: BarSlice[] = Object.entries(ageGroups)
    .filter(([, v]) => v > 0)
    .map(([nhom, soNguoi]) => ({ nhom, soNguoi }))

  // ── Tình trạng cư trú ────────────────────────────────────────
  const cuTruMap: Record<string, number> = {}
  hoDan.forEach(h => {
    const tt = (h.trang_thai as string | null) ?? 'THUONG_TRU'
    cuTruMap[tt] = (cuTruMap[tt] ?? 0) + 1
  })
  const cuTruLabel: Record<string, string> = {
    THUONG_TRU: 'Thường trú', TAM_TRU: 'Tạm trú', TAM_VANG: 'Tạm vắng',
  }
  const cuTruColor: Record<string, string> = {
    THUONG_TRU: '#1E3A5F', TAM_TRU: '#3B82F6', TAM_VANG: '#94A3B8',
  }
  const phanBoCuTru: PieSlice[] = Object.entries(cuTruMap).map(([k, v]) => ({
    name: cuTruLabel[k] ?? k, value: v, color: cuTruColor[k] ?? '#CBD5E1',
  }))

  // ── Phản ánh theo tháng (12 tháng gần nhất) ─────────────────
  const now = new Date()
  const thangList: PhanAnhThang[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    thangList.push({ thang: thangKey(d), moi: 0, dangXuLy: 0, daXuLy: 0 })
  }
  pa.forEach(p => {
    const key = thangKey(new Date(p.created_at as string))
    const entry = thangList.find(t => t.thang === key)
    if (!entry) return
    if (p.trang_thai === 'MOI')           entry.moi++
    else if (p.trang_thai === 'DANG_XU_LY') entry.dangXuLy++
    else                                  entry.daXuLy++
  })

  // ── Phản ánh theo loại ───────────────────────────────────────
  const loaiMap: Record<string, number> = {}
  pa.forEach(p => { const l = (p.loai as string) ?? 'KHAC'; loaiMap[l] = (loaiMap[l] ?? 0) + 1 })
  const loaiLabel: Record<string, string> = {
    AN_NINH: 'An ninh', MOI_TRUONG: 'Môi trường', CO_SO_HA_TANG: 'Cơ sở hạ tầng',
    HA_TANG: 'Hạ tầng', AN_SINH: 'An sinh', GIAO_THONG: 'Giao thông', KHAC: 'Khác',
  }
  const loaiColor: Record<string, string> = {
    AN_NINH: '#8B1A1A', MOI_TRUONG: '#16A34A', CO_SO_HA_TANG: '#D97706',
    HA_TANG: '#D97706', AN_SINH: '#EC4899', GIAO_THONG: '#6366F1', KHAC: '#94A3B8',
  }
  const phanAnhTheoLoai: PieSlice[] = Object.entries(loaiMap).map(([k, v]) => ({
    name: loaiLabel[k] ?? k, value: v, color: loaiColor[k] ?? '#CBD5E1',
  }))

  // ── Phản ánh theo trạng thái ─────────────────────────────────
  const ttPAMap: Record<string, number> = {}
  pa.forEach(p => { const t = (p.trang_thai as string); ttPAMap[t] = (ttPAMap[t] ?? 0) + 1 })
  const ttPALabel: Record<string, string> = {
    MOI: 'Mới', DANG_XU_LY: 'Đang xử lý', DA_XU_LY: 'Đã xử lý', DONG: 'Đã đóng',
  }
  const ttPAColor: Record<string, string> = {
    MOI: '#F59E0B', DANG_XU_LY: '#3B82F6', DA_XU_LY: '#10B981', DONG: '#94A3B8',
  }
  const phanAnhTheoTT: PieSlice[] = Object.entries(ttPAMap).map(([k, v]) => ({
    name: ttPALabel[k] ?? k, value: v, color: ttPAColor[k] ?? '#CBD5E1',
  }))

  // ── BHYT theo trạng thái ─────────────────────────────────────
  const bhytMap: Record<string, number> = {}
  bhyt.forEach(b => { const t = b.trang_thai as string; bhytMap[t] = (bhytMap[t] ?? 0) + 1 })
  const bhytLabel: Record<string, string> = {
    CON_HAN: 'Còn hạn', SAP_HET_HAN: 'Sắp hết hạn', HET_HAN: 'Hết hạn', CHUA_CO: 'Chưa có',
  }
  const bhytColor: Record<string, string> = {
    CON_HAN: '#10B981', SAP_HET_HAN: '#F59E0B', HET_HAN: '#EF4444', CHUA_CO: '#94A3B8',
  }
  const bhytTheoTT: PieSlice[] = Object.entries(bhytMap).map(([k, v]) => ({
    name: bhytLabel[k] ?? k, value: v, color: bhytColor[k] ?? '#CBD5E1',
  }))

  // ── Hộ nghèo theo loại (đang hưởng) ─────────────────────────
  const hnNgheo    = hn.filter(h => h.loai === 'NGHEO'     && h.trang_thai === 'DANG_HUONG').length
  const hnCanNgheo = hn.filter(h => h.loai === 'CAN_NGHEO' && h.trang_thai === 'DANG_HUONG').length
  const hnThoat    = hn.filter(h => h.trang_thai === 'THOAT_NGHEO').length
  const hoNgheoTheoLoai: PieSlice[] = [
    { name: 'Hộ nghèo',    value: hnNgheo,    color: '#EF4444' },
    { name: 'Cận nghèo',   value: hnCanNgheo, color: '#F59E0B' },
    { name: 'Thoát nghèo', value: hnThoat,    color: '#10B981' },
  ].filter(s => s.value > 0)

  // ── NCT theo sức khỏe (chỉ NCT còn sống) ───────────────────
  const nctSKMap: Record<string, number> = {}
  nctConSong.forEach(n => { const sk = (n.tinh_trang_sk as string) ?? 'ON_DINH'; nctSKMap[sk] = (nctSKMap[sk] ?? 0) + 1 })
  const nctSKLabel: Record<string, string> = {
    TOT: 'Tốt', ON_DINH: 'Ổn định', YEU: 'Yếu', CAN_CHAM_SOC: 'Cần chăm sóc',
  }
  const nctSKColor: Record<string, string> = {
    TOT: '#10B981', ON_DINH: '#3B82F6', YEU: '#F59E0B', CAN_CHAM_SOC: '#EF4444',
  }
  const nctTheoSK: PieSlice[] = Object.entries(nctSKMap).map(([k, v]) => ({
    name: nctSKLabel[k] ?? k, value: v, color: nctSKColor[k] ?? '#CBD5E1',
  }))

  return {
    kpi,
    phanBoTo,
    phanBoGioiTinh,
    phanBoDoTuoi,
    phanBoCuTru,
    phanAnhTheoThang: thangList,
    phanAnhTheoLoai,
    phanAnhTheoTT,
    bhytTheoTT,
    hoNgheoTheoLoai,
    nctTheoSK,
    ngayTao: new Date().toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }),
  }
}
