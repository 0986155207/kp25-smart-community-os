'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { KHU_PHO } from '@/lib/khu-pho'

// ─── Ranh giới khu phố của bản triển khai này ────────────────
export interface RanhGioiKhuPho {
  ranhGioi: [number, number][]
  tam:      [number, number] | null
  zoom:     number
}

const diemHopLe = (d: unknown): d is [number, number] =>
  Array.isArray(d) && d.length === 2 && typeof d[0] === 'number' && typeof d[1] === 'number'

/** Lấy ranh giới + tâm + zoom từ bảng don_vi (không hardcode) */
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

// ─── Types ───────────────────────────────────────────────────
export interface HoDanBanDo {
  id: string
  chuHo: string
  diaChiDay: string
  soNha: string
  duong: string
  soNhanKhau: number
  trangThai: string
  soDienThoai: string
  toaDoLat: number | null
  toaDoLng: number | null
  toaDoNguon: string | null   // NULL | 'GEOCODE' | 'GPS' | 'MANUAL'
  nhanKhauTen: string[]       // danh sách họ tên nhân khẩu (để tìm kiếm)
}

export interface PhanAnhBanDo {
  id: string
  tieuDe: string
  loai: string
  mucDo: string
  trangThai: string
  diaChiPhanAnh: string
  toaDoLat: number | null
  toaDoLng: number | null
}

// ─── Helper: map DB row → HoDanBanDo ─────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHoDan(h: any, nkMap: Map<string, string[]>): HoDanBanDo {
  return {
    id:           h.id as string,
    chuHo:        (h.chu_ho ?? '') as string,
    diaChiDay:    (h.dia_chi_day ?? '') as string,
    soNha:        (h.so_nha ?? '') as string,
    duong:        (h.duong ?? '') as string,
    soNhanKhau:   (h.so_nhan_khau ?? 0) as number,
    trangThai:    (h.trang_thai ?? 'THUONG_TRU') as string,
    soDienThoai:  (h.so_dien_thoai ?? '') as string,
    toaDoLat:     typeof h.toa_do_lat === 'number' ? h.toa_do_lat : null,
    toaDoLng:     typeof h.toa_do_lng === 'number' ? h.toa_do_lng : null,
    toaDoNguon:   (h.toa_do_nguon as string | null) ?? null,
    nhanKhauTen:  nkMap.get(h.id as string) ?? [],
  }
}

// ─── Lấy dữ liệu bản đồ ─────────────────────────────────────
export async function layDuLieuBanDo(): Promise<{
  hoDan: HoDanBanDo[]
  phanAnh: PhanAnhBanDo[]
}> {
  try {
    const supabase = await createClient()

    // Thử select có toa_do_nguon (migration 015 đã chạy?)
    // Nếu cột chưa tồn tại → fallback không có cột đó
    let hoRows: unknown[] = []

    const withNguon = await supabase
      .from('ho_dan')
      .select('id, chu_ho, dia_chi_day, so_nha, duong, so_nhan_khau, trang_thai, so_dien_thoai, toa_do_lat, toa_do_lng, toa_do_nguon')
      .is('deleted_at', null)
      .order('chu_ho')

    if (!withNguon.error) {
      hoRows = withNguon.data ?? []
    } else {
      // Fallback: cột toa_do_nguon chưa tồn tại
      const fallback = await supabase
        .from('ho_dan')
        .select('id, chu_ho, dia_chi_day, so_nha, duong, so_nhan_khau, trang_thai, so_dien_thoai, toa_do_lat, toa_do_lng')
        .is('deleted_at', null)
        .order('chu_ho')
      hoRows = fallback.data ?? []
    }

    // ── Lấy tên nhân khẩu để hỗ trợ tìm kiếm ─────────────────
    const nkRes = await supabase
      .from('nhan_khau')
      .select('ho_id, ho_ten')
      .is('deleted_at', null)
      .not('ho_ten', 'is', null)

    // Nhóm theo ho_id → Map<ho_id, string[]>
    const nkMap = new Map<string, string[]>()
    for (const nk of nkRes.data ?? []) {
      const hoId  = nk.ho_id as string
      const hoTen = (nk.ho_ten as string | null) ?? ''
      if (!hoTen) continue
      const arr = nkMap.get(hoId) ?? []
      arr.push(hoTen)
      nkMap.set(hoId, arr)
    }

    const paRes = await supabase
      .from('phan_anh')
      .select('id, tieu_de, loai, muc_do, trang_thai, dia_chi_phan_anh, toa_do_lat, toa_do_lng')
      .is('deleted_at', null)
      .neq('trang_thai', 'DONG')
      .order('created_at', { ascending: false })
      .limit(200)

    const hoDan  = hoRows.map(h => mapHoDan(h, nkMap))
    const phanAnh: PhanAnhBanDo[] = (paRes.data ?? []).map(p => ({
      id:             p.id as string,
      tieuDe:         (p.tieu_de ?? '') as string,
      loai:           (p.loai ?? 'KHAC') as string,
      mucDo:          (p.muc_do ?? 'TRUNG_BINH') as string,
      trangThai:      (p.trang_thai ?? 'MOI') as string,
      diaChiPhanAnh:  (p.dia_chi_phan_anh ?? '') as string,
      toaDoLat:       p.toa_do_lat as number | null,
      toaDoLng:       p.toa_do_lng as number | null,
    }))

    return { hoDan, phanAnh }
  } catch {
    return { hoDan: [], phanAnh: [] }
  }
}

// ─── Nominatim geocoding (OpenStreetMap, miễn phí) ──────────
// Vùng KP25: lat 10.797–10.804, lng 106.809–106.814
const NOMINATIM_UA = 'KP25-Smart-Community-OS/1.0 (taip2704@gmail.com)'

async function nominatimGeocode(
  diaChi: string,
  duong: string,
): Promise<{ lat: number; lng: number } | null> {
  // Thứ tự ưu tiên: địa chỉ đầy đủ → chỉ tên đường
  const queries = [
    `${diaChi}, Phường Long Trường, TP.HCM`,
    `${duong}, Phường Long Trường, TP.HCM`,
    `${duong}, Long Trường, TP.HCM`,
  ].filter(q => q.trim().length > 5)

  for (const q of queries) {
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json` +
        `&q=${encodeURIComponent(q)}` +
        `&countrycodes=vn` +
        `&viewbox=106.800,10.790,106.820,10.810` +
        `&bounded=0` +
        `&limit=1` +
        `&accept-language=vi`

      const res = await fetch(url, {
        headers: { 'User-Agent': NOMINATIM_UA },
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) continue

      const data = await res.json() as Array<{ lat: string; lon: string }>
      if (data.length > 0 && data[0]) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        // Phải nằm trong vùng lân cận Long Trường (±2km)
        if (lat > 10.78 && lat < 10.82 && lng > 106.80 && lng < 106.83) {
          return { lat, lng }
        }
      }
    } catch {
      continue
    }
  }
  return null
}

// ─── Batch geocode (tối đa 20 hộ mỗi lần, 1.1s/hộ) ─────────
export async function geocodeBatch(batchSize = 20): Promise<{
  success: boolean
  processed: number
  found: number
  remaining: number
  message: string
}> {
  const supabase = await createClient()

  // Lấy hộ chưa có GPS
  const { data: rows, error } = await supabase
    .from('ho_dan')
    .select('id, dia_chi_day, duong')
    .is('deleted_at', null)
    .is('toa_do_lat', null)
    .order('chu_ho')
    .limit(batchSize)

  if (error || !rows) {
    return { success: false, processed: 0, found: 0, remaining: 0, message: 'Lỗi khi truy vấn DB' }
  }

  // Tổng hộ còn lại chưa geocode
  const { count: totalRemaining } = await supabase
    .from('ho_dan')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .is('toa_do_lat', null)

  let found = 0

  for (const row of rows) {
    const diaChi = (row.dia_chi_day as string) ?? ''
    const duong  = (row.duong as string) ?? ''
    const coords = await nominatimGeocode(diaChi, duong)

    if (coords) {
      // Thử update với toa_do_nguon (nếu cột tồn tại)
      const { error: e1 } = await supabase
        .from('ho_dan')
        .update({ toa_do_lat: coords.lat, toa_do_lng: coords.lng, toa_do_nguon: 'GEOCODE' })
        .eq('id', row.id)

      if (e1) {
        // Fallback: không có cột toa_do_nguon
        await supabase
          .from('ho_dan')
          .update({ toa_do_lat: coords.lat, toa_do_lng: coords.lng })
          .eq('id', row.id)
      }
      found++
    }

    // Nominatim: tối đa 1 request/giây
    await new Promise(r => setTimeout(r, 1100))
  }

  const remaining = Math.max(0, (totalRemaining ?? 0) - rows.length)

  return {
    success: true,
    processed: rows.length,
    found,
    remaining,
    message: `Xử lý ${rows.length} hộ → tìm được ${found} tọa độ. Còn ${remaining} hộ chưa có GPS.`,
  }
}

// ─── Geocode 1 hộ dân ────────────────────────────────────────
export async function geocodeMotHo(
  id: string,
  diaChi: string,
  duong: string,
): Promise<{ success: boolean; lat?: number; lng?: number; message: string }> {
  const result = await nominatimGeocode(diaChi, duong)
  if (!result) {
    return { success: false, message: 'Không tìm được tọa độ cho địa chỉ này' }
  }

  try {
    const supabase = await createClient()
    const { error: e1 } = await supabase
      .from('ho_dan')
      .update({ toa_do_lat: result.lat, toa_do_lng: result.lng, toa_do_nguon: 'GEOCODE' })
      .eq('id', id)

    if (e1) {
      await supabase
        .from('ho_dan')
        .update({ toa_do_lat: result.lat, toa_do_lng: result.lng })
        .eq('id', id)
    }
    return { success: true, lat: result.lat, lng: result.lng, message: 'Đã geocode thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi DB' }
  }
}

// ─── Lưu GPS thủ công (pin-drop trên bản đồ) ────────────────
export async function saveGPS(
  id:  string,
  lat: number,
  lng: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    // Thử update với toa_do_nguon = 'MANUAL'
    const { error: e1 } = await supabase
      .from('ho_dan')
      .update({ toa_do_lat: lat, toa_do_lng: lng, toa_do_nguon: 'MANUAL' })
      .eq('id', id)
    if (e1) {
      // Fallback không có cột toa_do_nguon
      await supabase
        .from('ho_dan')
        .update({ toa_do_lat: lat, toa_do_lng: lng })
        .eq('id', id)
    }
    return { success: true, message: 'Đã lưu GPS thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi DB' }
  }
}

// ─── Xoá GPS của 1 hộ (reset về ước tính) ───────────────────
export async function xoaGPSHoDan(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    const { error: e1 } = await supabase
      .from('ho_dan')
      .update({ toa_do_lat: null, toa_do_lng: null, toa_do_nguon: null })
      .eq('id', id)

    if (e1) {
      await supabase
        .from('ho_dan')
        .update({ toa_do_lat: null, toa_do_lng: null })
        .eq('id', id)
    }
    return { success: true }
  } catch {
    return { success: false }
  }
}
