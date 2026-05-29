'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ghiAuditLog } from '@/lib/audit'

// ─── Sinh mã hộ tự động ─────────────────────────────────────
function sinhMaHo(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `KP25-${yy}${mm}-${rand}`
}

// ─── Thêm hộ dân ────────────────────────────────────────────
export async function taoHoDan(
  formData: FormData
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const supabase = await createClient()

    const chuHo = (formData.get('chuHo') as string)?.trim()
    if (!chuHo) return { success: false, message: 'Vui lòng nhập tên chủ hộ' }

    const diaChiDay = (formData.get('diaChiDay') as string)?.trim()
    if (!diaChiDay) return { success: false, message: 'Vui lòng nhập địa chỉ đầy đủ' }

    const soNhanKhau = parseInt(formData.get('soNhanKhau') as string)
    const maHo = (formData.get('maHo') as string)?.trim() || sinhMaHo()

    const { data, error } = await supabase
      .from('ho_dan')
      .insert({
        ma_ho: maHo,
        chu_ho: chuHo,
        dia_chi_day: diaChiDay,
        so_nha: (formData.get('soNha') as string)?.trim() || null,
        duong: (formData.get('duong') as string)?.trim() || null,
        to_truong: (formData.get('toTruong') as string)?.trim() || null,
        so_dien_thoai: (formData.get('soDienThoai') as string)?.trim() || null,
        so_nhan_khau: isNaN(soNhanKhau) ? 0 : soNhanKhau,
        trang_thai: (formData.get('trangThai') as string) || 'THUONG_TRU',
        ghi_chu: (formData.get('ghiChu') as string)?.trim() || null,
        qr_token: crypto.randomUUID(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[taoHoDan] Supabase error:', JSON.stringify(error))
      // Nếu ma_ho bị trùng → thử lại với mã mới
      if (error.code === '23505') {
        return { success: false, message: 'Mã hộ đã tồn tại. Vui lòng thử lại hoặc nhập mã khác.' }
      }
      return { success: false, message: `Lỗi: ${error.message} (${error.code})` }
    }

    revalidatePath('/dashboard/dan-cu')
    ghiAuditLog({ hanh_dong: 'TAO', bang: 'ho_dan', ban_ghi_id: data.id, mo_ta: `Thêm hộ dân mới: "${chuHo}" — ${diaChiDay.slice(0, 60)}` }).catch(() => {})
    return { success: true, message: 'Thêm hộ dân thành công', id: data.id }
  } catch (err) {
    console.error('[taoHoDan] Unexpected:', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Cập nhật hộ dân ────────────────────────────────────────
export async function capNhatHoDan(
  id: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const chuHo = (formData.get('chuHo') as string)?.trim()
    if (!chuHo) return { success: false, message: 'Vui lòng nhập tên chủ hộ' }

    const diaChiDay = (formData.get('diaChiDay') as string)?.trim()
    if (!diaChiDay) return { success: false, message: 'Vui lòng nhập địa chỉ đầy đủ' }

    const soNhanKhau = parseInt(formData.get('soNhanKhau') as string)

    const { error } = await supabase
      .from('ho_dan')
      .update({
        chu_ho: chuHo,
        dia_chi_day: diaChiDay,
        so_nha: (formData.get('soNha') as string)?.trim() || null,
        duong: (formData.get('duong') as string)?.trim() || null,
        to_truong: (formData.get('toTruong') as string)?.trim() || null,
        so_dien_thoai: (formData.get('soDienThoai') as string)?.trim() || null,
        so_nhan_khau: isNaN(soNhanKhau) ? 0 : soNhanKhau,
        trang_thai: (formData.get('trangThai') as string) || 'THUONG_TRU',
        ghi_chu: (formData.get('ghiChu') as string)?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('[capNhatHoDan] Supabase error:', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message} (${error.code})` }
    }

    revalidatePath('/dashboard/dan-cu')
    revalidatePath(`/dashboard/dan-cu/${id}`)
    ghiAuditLog({ hanh_dong: 'CAP_NHAT', bang: 'ho_dan', ban_ghi_id: id, mo_ta: `Cập nhật thông tin hộ dân: "${chuHo}"` }).catch(() => {})
    return { success: true, message: 'Cập nhật hộ dân thành công' }
  } catch (err) {
    console.error('[capNhatHoDan] Unexpected:', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Xoá mềm hộ dân ─────────────────────────────────────────
export async function xoaHoDan(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('xoa_mem_ho_dan', { p_id: id })

    if (error) {
      console.error('[xoaHoDan] RPC error:', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message} (${error.code})` }
    }

    if (!data) {
      return { success: false, message: 'Không thể xoá hoặc hộ dân đã bị xoá trước đó.' }
    }

    revalidatePath('/dashboard/dan-cu')
    ghiAuditLog({ hanh_dong: 'XOA', bang: 'ho_dan', ban_ghi_id: id, mo_ta: `Xóa hộ dân #${id.slice(0, 8)}` }).catch(() => {})
    return { success: true, message: 'Đã xoá hộ dân thành công' }
  } catch (err) {
    console.error('[xoaHoDan]', err)
    return { success: false, message: 'Không thể xoá. Vui lòng thử lại.' }
  }
}

// ─── Xoá + redirect ──────────────────────────────────────────
export async function xoaHoDanVaRedirect(id: string) {
  const result = await xoaHoDan(id)
  if (result.success) redirect('/dashboard/dan-cu')
  return result
}

// ─── Thêm nhân khẩu ─────────────────────────────────────────
export async function themNhanKhau(
  hoId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const hoTen = (formData.get('hoTen') as string)?.trim()
    if (!hoTen) return { success: false, message: 'Vui lòng nhập họ tên' }

    const { error } = await supabase
      .from('nhan_khau')
      .insert({
        ho_id: hoId,
        ho_ten: hoTen,
        ngay_sinh: (formData.get('ngaySinh') as string)?.trim() || null,
        gioi_tinh: (formData.get('gioiTinh') as string) || 'NAM',
        cccd: (formData.get('cccd') as string)?.trim() || null,
        quan_he: (formData.get('quanHe') as string)?.trim() || 'Thành viên',
        nghe_nghiep: (formData.get('ngheNghiep') as string)?.trim() || null,
        so_dien_thoai: (formData.get('soDienThoai') as string)?.trim() || null,
        trang_thai: (formData.get('trangThai') as string) || 'THUONG_TRU',
        ghi_chu: (formData.get('ghiChu') as string)?.trim() || null,
      })

    if (error) {
      console.error('[themNhanKhau] Supabase error:', JSON.stringify(error))
      if (error.code === '23505') {
        return { success: false, message: 'Số CCCD đã tồn tại trong hệ thống.' }
      }
      return { success: false, message: `Lỗi: ${error.message} (${error.code})` }
    }

    revalidatePath(`/dashboard/dan-cu/${hoId}`)
    revalidatePath('/dashboard/dan-cu')
    return { success: true, message: 'Thêm nhân khẩu thành công' }
  } catch (err) {
    console.error('[themNhanKhau]', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Lấy dữ liệu từ Google Sheets (public) ──────────────────
export async function layDuLieuGoogleSheet(
  url: string
): Promise<{ success: boolean; csvData?: string; message: string }> {
  try {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!match?.[1]) {
      return { success: false, message: 'URL không hợp lệ. Vui lòng dán đúng link Google Sheets.' }
    }
    const sheetId = match[1]
    const gidMatch = url.match(/[#?&]gid=(\d+)/)
    const gid = gidMatch?.[1] ?? '0'

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

    const res = await fetch(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return {
          success: false,
          message: 'Không có quyền truy cập. Hãy mở Google Sheets → Chia sẻ → Đặt thành "Ai có link đều xem được".',
        }
      }
      return { success: false, message: `Không tải được dữ liệu (lỗi HTTP ${res.status})` }
    }

    const csvData = await res.text()
    if (!csvData.trim()) {
      return { success: false, message: 'Sheet trống hoặc không có dữ liệu.' }
    }

    return { success: true, csvData, message: 'Tải dữ liệu thành công' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định'
    return { success: false, message: `Lỗi kết nối: ${msg}` }
  }
}

// ─── Nhập hàng loạt từ Excel ────────────────────────────────

export interface NhapNhanKhauRow {
  hoTen: string
  ngaySinh?: string
  gioiTinh: 'NAM' | 'NU' | 'KHAC'
  cccd?: string
  quanHe: string
  ngheNghiep?: string
  soDienThoai?: string
  trangThai: string
}

export interface NhapHoDanRow {
  chuHo: string
  soNha?: string
  duong?: string
  toTruong?: string
  diaChiDay: string
  soDienThoai?: string
  trangThai: string
  nhanKhau: NhapNhanKhauRow[]
}

const HO_CHUNK = 50   // số hộ mỗi batch
const NK_CHUNK = 100  // số nhân khẩu mỗi batch

export async function nhapDuLieuHangLoat(
  danhSach: NhapHoDanRow[]
): Promise<{
  success: boolean
  tongHo: number
  tongNguoi: number
  loiHo: number
  loiNguoi: number
  chiTietLoi: string[]
  message: string
}> {
  const supabase = await createClient()
  let tongHo = 0, tongNguoi = 0, loiHo = 0, loiNguoi = 0
  const chiTietLoi: string[] = []

  // ── Chuẩn bị dữ liệu hộ dân với mã định danh riêng ─────────
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const ts = Date.now().toString().slice(-4)

  const hoRecords = danhSach.map((ho, idx) => ({
    _idx: idx,
    ma_ho: `KP25-${yy}${mm}-${ts}${String(idx).padStart(3, '0')}`,
    chu_ho: ho.chuHo.trim(),
    dia_chi_day: ho.diaChiDay.trim(),
    so_nha: ho.soNha?.trim() || null,
    duong: ho.duong?.trim() || null,
    to_truong: ho.toTruong?.trim() || null,
    so_dien_thoai: ho.soDienThoai?.trim() || null,
    trang_thai: (ho.trangThai || 'THUONG_TRU') as string,
    so_nhan_khau: ho.nhanKhau.length,
    ghi_chu: null as null,
  }))

  // ── Batch INSERT hộ dân ──────────────────────────────────────
  const hoIdMap = new Map<number, string>() // idx → ho_id

  for (let i = 0; i < hoRecords.length; i += HO_CHUNK) {
    const chunk = hoRecords.slice(i, i + HO_CHUNK)
    const insertData = chunk.map(({ _idx, ...rest }) => rest)

    const { data, error } = await supabase
      .from('ho_dan')
      .insert(insertData)
      .select('id, ma_ho')

    if (error || !data) {
      // Chunk lỗi → ghi nhận từng hộ trong chunk
      chunk.forEach((r) => {
        loiHo++
        chiTietLoi.push(`Hộ "${r.chu_ho}": ${error?.message ?? 'Lỗi không xác định'}`)
      })
      continue
    }

    // Ánh xạ ma_ho → id để kết nối với nhân khẩu
    const maHoToId = new Map(data.map((d) => [d.ma_ho as string, d.id as string]))
    chunk.forEach((r) => {
      const hoId = maHoToId.get(r.ma_ho)
      if (hoId) {
        hoIdMap.set(r._idx, hoId)
        tongHo++
      } else {
        loiHo++
        chiTietLoi.push(`Hộ "${r.chu_ho}": không lấy được ID sau khi tạo`)
      }
    })
  }

  // ── Chuẩn bị dữ liệu nhân khẩu ──────────────────────────────
  const nkRecords: {
    ho_id: string
    ho_ten: string
    ngay_sinh: string | null
    gioi_tinh: string
    cccd: string | null
    quan_he: string
    nghe_nghiep: string | null
    so_dien_thoai: string | null
    trang_thai: string
    ghi_chu: null
    _label: string  // chỉ để báo lỗi, không insert vào DB
  }[] = []

  danhSach.forEach((ho, idx) => {
    const hoId = hoIdMap.get(idx)
    if (!hoId) return
    ho.nhanKhau.forEach((nk) => {
      if (!nk.hoTen?.trim()) return
      nkRecords.push({
        ho_id: hoId,
        ho_ten: nk.hoTen.trim(),
        ngay_sinh: nk.ngaySinh || null,
        gioi_tinh: nk.gioiTinh || 'NAM',
        cccd: nk.cccd?.trim() || null,
        quan_he: nk.quanHe?.trim() || 'Thành viên',
        nghe_nghiep: nk.ngheNghiep?.trim() || null,
        so_dien_thoai: nk.soDienThoai?.trim() || null,
        trang_thai: nk.trangThai || 'THUONG_TRU',
        ghi_chu: null,
        _label: `${nk.hoTen} (hộ ${ho.chuHo})`,
      })
    })
  })

  // ── Batch INSERT nhân khẩu ───────────────────────────────────
  for (let i = 0; i < nkRecords.length; i += NK_CHUNK) {
    const chunk = nkRecords.slice(i, i + NK_CHUNK)
    const insertData = chunk.map(({ _label, ...rest }) => rest)

    const { error } = await supabase.from('nhan_khau').insert(insertData)

    if (!error) {
      tongNguoi += chunk.length
      continue
    }

    // Batch lỗi → thử từng record để xác định cái nào fail
    if (error.code === '23505' || chunk.length > 1) {
      for (const nk of chunk) {
        const { _label, ...nkData } = nk
        const { error: singleErr } = await supabase.from('nhan_khau').insert(nkData)
        if (singleErr) {
          loiNguoi++
          const detail = singleErr.code === '23505'
            ? `CCCD "${nk.cccd}" đã tồn tại trong hệ thống`
            : singleErr.message
          chiTietLoi.push(`Nhân khẩu "${_label}": ${detail}`)
        } else {
          tongNguoi++
        }
      }
    } else {
      loiNguoi += chunk.length
      chiTietLoi.push(`Lỗi nhân khẩu batch ${i + 1}–${i + chunk.length}: ${error.message}`)
    }
  }

  revalidatePath('/dashboard/dan-cu')

  const success = tongHo > 0
  const tong = loiHo + loiNguoi
  const message = success
    ? `Nhập thành công ${tongHo} hộ, ${tongNguoi} nhân khẩu${tong > 0 ? `. ${tong} bản ghi lỗi.` : '.'}`
    : 'Không nhập được hộ nào. Kiểm tra lại dữ liệu.'

  return { success, tongHo, tongNguoi, loiHo, loiNguoi, chiTietLoi, message }
}

// ─── Cập nhật nhân khẩu ─────────────────────────────────────
export async function capNhatNhanKhau(
  id: string,
  hoId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const hoTen = (formData.get('hoTen') as string)?.trim()
    if (!hoTen) return { success: false, message: 'Vui lòng nhập họ tên' }

    // da_mat chỉ có sau migration 009 — chỉ gửi nếu field tồn tại trong form
    const daMat = formData.get('daMat')

    const updatePayload: Record<string, unknown> = {
      ho_ten: hoTen,
      ngay_sinh: (formData.get('ngaySinh') as string)?.trim() || null,
      gioi_tinh: (formData.get('gioiTinh') as string) || 'NAM',
      cccd: (formData.get('cccd') as string)?.trim() || null,
      quan_he: (formData.get('quanHe') as string)?.trim() || 'Thành viên',
      nghe_nghiep: (formData.get('ngheNghiep') as string)?.trim() || null,
      so_dien_thoai: (formData.get('soDienThoai') as string)?.trim() || null,
      trang_thai: (formData.get('trangThai') as string) || 'THUONG_TRU',
      ghi_chu: (formData.get('ghiChu') as string)?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    // Chỉ cập nhật da_mat/ngay_mat nếu form có gửi field này (sau migration 009)
    if (daMat !== null) {
      const dead = daMat === 'true'
      updatePayload.da_mat  = dead
      updatePayload.ngay_mat = dead ? ((formData.get('ngayMat') as string)?.trim() || null) : null
    }

    let { error } = await supabase
      .from('nhan_khau')
      .update(updatePayload)
      .eq('id', id)

    // Nếu cột da_mat/ngay_mat chưa tồn tại (migration 009 chưa chạy) → thử lại không có 2 cột đó
    if (error && daMat !== null && (error.message?.includes('da_mat') || error.message?.includes('ngay_mat'))) {
      const { da_mat: _dm, ngay_mat: _nm, ...payloadWithout } = updatePayload as Record<string, unknown>
      void _dm; void _nm
      const retryResult = await supabase.from('nhan_khau').update(payloadWithout).eq('id', id)
      error = retryResult.error
    }

    if (error) {
      if (error.code === '23505') return { success: false, message: 'Số CCCD đã tồn tại trong hệ thống.' }
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    revalidatePath(`/dashboard/dan-cu/${hoId}`)
    return { success: true, message: 'Cập nhật nhân khẩu thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Xoá toàn bộ hộ dân + nhân khẩu ────────────────────────
// Dùng SECURITY DEFINER RPC để bypass RLS policy WITH CHECK
export async function xoaToanBoHoDan(): Promise<{
  success: boolean
  soHoXoa: number
  soNkXoa: number
  message: string
}> {
  try {
    const supabase = await createClient()

    // Xoá nhân khẩu trước qua SECURITY DEFINER function
    const { data: soNk, error: errNk } = await supabase
      .rpc('xoa_toan_bo_nhan_khau')

    if (errNk) {
      console.error('[xoaToanBoHoDan] errNk:', JSON.stringify(errNk))
      return { success: false, soHoXoa: 0, soNkXoa: 0, message: `Lỗi xoá nhân khẩu: ${errNk.message}` }
    }

    // Xoá hộ dân qua SECURITY DEFINER function
    const { data: soHo, error: errHo } = await supabase
      .rpc('xoa_toan_bo_ho_dan')

    if (errHo) {
      console.error('[xoaToanBoHoDan] errHo:', JSON.stringify(errHo))
      return { success: false, soHoXoa: 0, soNkXoa: soNk ?? 0, message: `Lỗi xoá hộ dân: ${errHo.message}` }
    }

    revalidatePath('/dashboard/dan-cu')

    return {
      success: true,
      soHoXoa: soHo ?? 0,
      soNkXoa: soNk ?? 0,
      message: `Đã xoá ${soHo ?? 0} hộ dân và ${soNk ?? 0} nhân khẩu`,
    }
  } catch (err) {
    console.error('[xoaToanBoHoDan]', err)
    return { success: false, soHoXoa: 0, soNkXoa: 0, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Dọn dữ liệu trùng (import 2 lần) — dùng RPC ───────────
export async function xoaDuLieuTrung(): Promise<{
  success: boolean
  soHoXoa: number
  soNkXoa: number
  message: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('xoa_trung_ho_dan')

    if (error) {
      console.error('[xoaDuLieuTrung] RPC error:', JSON.stringify(error))
      return { success: false, soHoXoa: 0, soNkXoa: 0, message: `Lỗi: ${error.message}` }
    }

    const soHoXoa = (data as { so_ho_xoa: number; so_nk_xoa: number })?.so_ho_xoa ?? 0
    const soNkXoa = (data as { so_ho_xoa: number; so_nk_xoa: number })?.so_nk_xoa ?? 0

    revalidatePath('/dashboard/dan-cu')

    if (soHoXoa === 0 && soNkXoa === 0) {
      return { success: true, soHoXoa: 0, soNkXoa: 0, message: 'Không tìm thấy dữ liệu trùng lặp' }
    }

    return {
      success: true,
      soHoXoa,
      soNkXoa,
      message: `Đã xoá ${soHoXoa} hộ trùng và ${soNkXoa} nhân khẩu liên quan`,
    }
  } catch (err) {
    console.error('[xoaDuLieuTrung]', err)
    return { success: false, soHoXoa: 0, soNkXoa: 0, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Đổi Chủ hộ ─────────────────────────────────────────────
// Đồng thời: bỏ "Chủ hộ" cũ → "Thành viên khác" + đặt người mới → "Chủ hộ" + cập nhật ho_dan.chu_ho
export async function doiChuHo(
  hoId: string,
  nhanKhauIdMoi: string,
  hoTenMoi: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    // 1. Hạ "Chủ hộ" cũ xuống "Thành viên khác"
    await supabase
      .from('nhan_khau')
      .update({ quan_he: 'Thành viên khác', updated_at: new Date().toISOString() })
      .eq('ho_id', hoId)
      .eq('quan_he', 'Chủ hộ')
      .is('deleted_at', null)

    // 2. Đặt người mới làm "Chủ hộ"
    const { error: errNk } = await supabase
      .from('nhan_khau')
      .update({ quan_he: 'Chủ hộ', updated_at: new Date().toISOString() })
      .eq('id', nhanKhauIdMoi)

    if (errNk) return { success: false, message: errNk.message }

    // 3. Cập nhật tên chủ hộ trong bảng ho_dan
    const { error: errHo } = await supabase
      .from('ho_dan')
      .update({ chu_ho: hoTenMoi, updated_at: new Date().toISOString() })
      .eq('id', hoId)

    if (errHo) return { success: false, message: errHo.message }

    revalidatePath(`/dashboard/dan-cu/${hoId}`)
    revalidatePath('/dashboard/dan-cu')
    return { success: true, message: `Đã đặt ${hoTenMoi} làm chủ hộ mới` }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Tạo / tái tạo QR Token ──────────────────────────────────
export async function taoQRToken(
  hoId: string
): Promise<{ success: boolean; token?: string; message: string }> {
  try {
    const supabase = await createClient()
    const token = crypto.randomUUID()
    const { error } = await supabase
      .from('ho_dan')
      .update({ qr_token: token, updated_at: new Date().toISOString() })
      .eq('id', hoId)
    if (error) return { success: false, message: error.message }
    revalidatePath(`/dashboard/dan-cu/${hoId}`)
    return { success: true, token, message: 'Đã tạo QR token mới' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ─── Xoá nhân khẩu ──────────────────────────────────────────
export async function xoaNhanKhau(
  id: string,
  hoId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()

    // Soft delete trực tiếp (nhan_khau_update policy USING(true))
    const { error } = await supabase
      .from('nhan_khau')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[xoaNhanKhau] error:', JSON.stringify(error))
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    revalidatePath(`/dashboard/dan-cu/${hoId}`)
    return { success: true, message: 'Đã xoá nhân khẩu' }
  } catch (err) {
    console.error('[xoaNhanKhau]', err)
    return { success: false, message: 'Không thể xoá. Vui lòng thử lại.' }
  }
}
