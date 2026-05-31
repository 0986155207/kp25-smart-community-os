import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Rate limit đơn giản
const RATE = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const e = RATE.get(ip)
  if (!e || e.reset < now) { RATE.set(ip, { count: 1, reset: now + 60_000 }); return true }
  if (e.count >= 5) return false
  e.count++; return true
}

// POST /api/dan-cu/tu-khai
// Người dân tự khai → tạo yêu cầu chờ duyệt (KHÔNG ghi thẳng vào nhan_khau)
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json({ success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      token:       string
      loai:        'THEM_MOI' | 'CAP_NHAT'
      nhanKhauId?: string
      hoTen:       string
      nguoiGuiSdt: string
      duLieuMoi:   Record<string, string>
    }

    const { token, loai, nhanKhauId, hoTen, nguoiGuiSdt, duLieuMoi } = body

    if (!token)        return NextResponse.json({ success: false, message: 'Thiếu mã QR' }, { status: 400 })
    if (!hoTen?.trim()) return NextResponse.json({ success: false, message: 'Vui lòng nhập họ tên' }, { status: 400 })
    if (!nguoiGuiSdt || !/^0\d{9}$/.test(nguoiGuiSdt)) {
      return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ' }, { status: 400 })
    }
    if (!duLieuMoi || Object.keys(duLieuMoi).length === 0) {
      return NextResponse.json({ success: false, message: 'Chưa có thông tin nào để cập nhật' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Xác thực token → lấy hộ
    const { data: ho } = await supabase
      .from('ho_dan')
      .select('id, chu_ho')
      .eq('qr_token', token)
      .is('deleted_at', null)
      .single()

    if (!ho) {
      return NextResponse.json({ success: false, message: 'Mã QR không hợp lệ' }, { status: 404 })
    }

    // Lấy dữ liệu cũ nếu là cập nhật nhân khẩu có sẵn
    let duLieuCu: Record<string, unknown> = {}
    if (loai === 'CAP_NHAT' && nhanKhauId) {
      const { data: nk } = await supabase
        .from('nhan_khau')
        .select('*')
        .eq('id', nhanKhauId)
        .eq('ho_id', ho.id)   // đảm bảo nhân khẩu thuộc đúng hộ
        .single()
      if (nk) {
        duLieuCu = Object.fromEntries(
          Object.keys(duLieuMoi).map(k => [k, (nk as Record<string, unknown>)[k] ?? null])
        )
      }
    }

    // Tạo yêu cầu chờ duyệt
    const { error } = await supabase
      .from('yeu_cau_cap_nhat_dan_cu')
      .insert({
        ho_id:         ho.id,
        nhan_khau_id:  loai === 'CAP_NHAT' ? (nhanKhauId ?? null) : null,
        loai,
        ho_ten:        hoTen.trim(),
        nguoi_gui_sdt: nguoiGuiSdt,
        du_lieu_moi:   duLieuMoi,
        du_lieu_cu:    duLieuCu,
        trang_thai:    'CHO_DUYET',
      })

    if (error) {
      console.error('[tu-khai]', JSON.stringify(error))
      return NextResponse.json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi yêu cầu cập nhật. Cán bộ khu phố sẽ xem xét và xác nhận trong thời gian sớm nhất.',
    })
  } catch (err) {
    console.error('[tu-khai]', err)
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 })
  }
}
