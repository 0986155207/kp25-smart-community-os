'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'
import { TRUONG_HO_SO, tinhHoanThien } from './constants'

// ════════════════════════════════════════════════════════════
//  THỐNG KÊ TỔNG QUAN
// ════════════════════════════════════════════════════════════
export interface ThongKeHoanThien {
  tongNhanKhau:   number
  hoanThienToanBo: number   // 100%
  trungBinh:      number    // % trung bình
  // Đếm theo từng trường thiếu
  thieuTheoTruong: Array<{ key: string; label: string; soLuong: number }>
}

export async function layThongKeHoanThien(): Promise<ThongKeHoanThien> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('nhan_khau')
      .select(TRUONG_HO_SO.map(t => t.key).join(','))
      .is('deleted_at', null)
      .or('da_mat.is.null,da_mat.eq.false')

    const rows = (data ?? []) as unknown as Record<string, unknown>[]
    const tong = rows.length

    const demThieu: Record<string, number> = {}
    let tongPhanTram = 0
    let soHoanThien = 0

    for (const nk of rows) {
      const { phanTram, thieu } = tinhHoanThien(nk)
      tongPhanTram += phanTram
      if (phanTram === 100) soHoanThien++
      for (const k of thieu) demThieu[k] = (demThieu[k] ?? 0) + 1
    }

    const thieuTheoTruong = TRUONG_HO_SO
      .map(t => ({ key: t.key, label: t.label, soLuong: demThieu[t.key] ?? 0 }))
      .filter(t => t.soLuong > 0)
      .sort((a, b) => b.soLuong - a.soLuong)

    return {
      tongNhanKhau:    tong,
      hoanThienToanBo: soHoanThien,
      trungBinh:       tong > 0 ? Math.round(tongPhanTram / tong) : 0,
      thieuTheoTruong,
    }
  } catch (err) {
    console.error('[layThongKeHoanThien]', err)
    return { tongNhanKhau: 0, hoanThienToanBo: 0, trungBinh: 0, thieuTheoTruong: [] }
  }
}

// ════════════════════════════════════════════════════════════
//  DANH SÁCH HỒ SƠ THIẾU THÔNG TIN
// ════════════════════════════════════════════════════════════
export interface HoSoThieuItem {
  id:           string
  ho_id:        string
  ho_ten:       string
  chu_ho:       string | null
  dia_chi:      string | null
  phanTram:     number
  thieu:        string[]
  // Toàn bộ dữ liệu để sửa inline
  [key: string]: unknown
}

export async function layDanhSachHoSoThieu(opts: {
  locTruong?: string    // chỉ lấy hồ sơ thiếu trường này
  timKiem?:   string
  trang?:     number
  soLuong?:   number
}): Promise<{ items: HoSoThieuItem[]; tong: number }> {
  try {
    const supabase = await createClient()
    const soLuong = opts.soLuong ?? 50

    // ── Query 1: Lấy nhân khẩu (KHÔNG join, KHÔNG count exact — tránh timeout)
    const cols = TRUONG_HO_SO.map(t => t.key).join(',')
    let query = supabase
      .from('nhan_khau')
      .select(`id, ho_id, ${cols}`)
      .is('deleted_at', null)
      .or('da_mat.is.null,da_mat.eq.false')

    if (opts.timKiem?.trim()) {
      query = query.ilike('ho_ten', `%${opts.timKiem.trim()}%`)
    }
    if (opts.locTruong) {
      query = query.is(opts.locTruong, null)
    }

    // Lấy dư để lọc 100% hoàn thiện rồi mới cắt
    query = query.order('created_at', { ascending: false }).limit(soLuong * 3)

    const { data, error } = await query
    if (error) {
      console.error('[layDanhSachHoSoThieu] query', JSON.stringify(error))
      return { items: [], tong: 0 }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data ?? []) as any[]

    // ── Query 2: Lấy thông tin hộ riêng (đơn giản, theo danh sách id)
    const hoIds = [...new Set(rows.map(r => r.ho_id).filter(Boolean))]
    const hoMap = new Map<string, { chu_ho: string | null; dia_chi_day: string | null }>()
    if (hoIds.length > 0) {
      const { data: hoData } = await supabase
        .from('ho_dan')
        .select('id, chu_ho, dia_chi_day')
        .in('id', hoIds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const h of (hoData ?? []) as any[]) hoMap.set(h.id, h)
    }

    // ── Tính hoàn thiện + lọc hồ sơ chưa đầy đủ
    const items: HoSoThieuItem[] = rows
      .map(r => {
        const { phanTram, thieu } = tinhHoanThien(r)
        const ho = hoMap.get(r.ho_id)
        return { ...r, ho_id: r.ho_id, chu_ho: ho?.chu_ho ?? null, dia_chi: ho?.dia_chi_day ?? null, phanTram, thieu }
      })
      .filter(it => it.phanTram < 100)   // chỉ hiện hồ sơ chưa đầy đủ
      .sort((a, b) => a.phanTram - b.phanTram)
      .slice(0, soLuong)

    return { items, tong: items.length }
  } catch (err) {
    console.error('[layDanhSachHoSoThieu]', err)
    return { items: [], tong: 0 }
  }
}

// ════════════════════════════════════════════════════════════
//  CẬP NHẬT NHANH 1 HỒ SƠ (inline)
// ════════════════════════════════════════════════════════════
export async function capNhatHoSoNhanh(
  nhanKhauId: string,
  duLieu: Record<string, string | null>
): Promise<{ success: boolean; message: string; phanTram?: number }> {
  try {
    if (!nhanKhauId) return { success: false, message: 'Thiếu ID nhân khẩu' }

    const supabase = await createClient()

    // Chỉ cho phép cập nhật các trường hợp lệ
    const validKeys = new Set(TRUONG_HO_SO.map(t => t.key as string))
    const update: Record<string, string | null> = {}
    for (const [k, v] of Object.entries(duLieu)) {
      if (validKeys.has(k)) {
        update[k] = (typeof v === 'string' && v.trim() === '') ? null : v
      }
    }

    // Validation cơ bản
    if (update['cccd'] && !/^\d{9,12}$/.test(update['cccd'])) {
      return { success: false, message: 'CCCD phải có 9-12 chữ số' }
    }
    if (update['so_dien_thoai'] && !/^0\d{9}$/.test(update['so_dien_thoai'])) {
      return { success: false, message: 'Số điện thoại không hợp lệ (10 chữ số)' }
    }

    update['updated_at'] = new Date().toISOString()

    const { data, error } = await supabase
      .from('nhan_khau')
      .update(update)
      .eq('id', nhanKhauId)
      .select(TRUONG_HO_SO.map(t => t.key).join(','))
      .single()

    if (error) {
      console.error('[capNhatHoSoNhanh]', JSON.stringify(error))
      if (error.code === '23505') return { success: false, message: 'CCCD đã tồn tại trong hệ thống' }
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    const { phanTram } = tinhHoanThien(data as unknown as Record<string, unknown>)
    const soTruong = Object.keys(update).length - 1
    ghiAuditLog({
      hanh_dong: 'CAP_NHAT', bang: 'nhan_khau', ban_ghi_id: nhanKhauId,
      mo_ta: `Bổ sung ${soTruong} trường hồ sơ → hoàn thiện ${phanTram}%`,
    }).catch(() => {})

    revalidatePath('/dashboard/dan-cu/ho-so-thieu')
    revalidatePath(`/dashboard/dan-cu/${(data as { ho_id?: string })['ho_id'] ?? ''}`)
    return { success: true, message: `Đã cập nhật — hồ sơ hoàn thiện ${phanTram}%`, phanTram }
  } catch (err) {
    console.error('[capNhatHoSoNhanh]', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}
