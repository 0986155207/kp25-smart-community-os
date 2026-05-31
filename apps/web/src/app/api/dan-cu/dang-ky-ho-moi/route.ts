import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Rate limit
const RATE = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const e = RATE.get(ip)
  if (!e || e.reset < now) { RATE.set(ip, { count: 1, reset: now + 60_000 }); return true }
  if (e.count >= 3) return false
  e.count++; return true
}

interface ThanhVien {
  ho_ten: string
  ngay_sinh?: string
  gioi_tinh?: string
  cccd?: string
  quan_he?: string
  nghe_nghiep?: string
}

// POST /api/dan-cu/dang-ky-ho-moi
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json({ success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      chuHo: string
      diaChi: string
      soDienThoai: string
      soNha?: string
      duong?: string
      toKhuVuc?: string
      loaiCuTru?: 'THUONG_TRU' | 'TAM_TRU'
      thanhVien: ThanhVien[]
      ghiChu?: string
    }

    const { chuHo, diaChi, soDienThoai, thanhVien } = body

    if (!chuHo?.trim())  return NextResponse.json({ success: false, message: 'Vui lòng nhập tên chủ hộ' }, { status: 400 })
    if (!diaChi?.trim()) return NextResponse.json({ success: false, message: 'Vui lòng nhập địa chỉ' }, { status: 400 })
    if (!soDienThoai || !/^0\d{9}$/.test(soDienThoai)) {
      return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ (10 chữ số)' }, { status: 400 })
    }
    if (!Array.isArray(thanhVien) || thanhVien.length === 0) {
      return NextResponse.json({ success: false, message: 'Vui lòng khai báo ít nhất 1 thành viên' }, { status: 400 })
    }
    if (!thanhVien.every(tv => tv.ho_ten?.trim())) {
      return NextResponse.json({ success: false, message: 'Mỗi thành viên cần có họ tên' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Làm sạch thành viên
    const tvSach = thanhVien.slice(0, 20).map(tv => ({
      ho_ten:      String(tv.ho_ten).trim(),
      ngay_sinh:   tv.ngay_sinh || null,
      gioi_tinh:   tv.gioi_tinh === 'NU' ? 'NU' : tv.gioi_tinh === 'KHAC' ? 'KHAC' : 'NAM',
      cccd:        tv.cccd?.trim() || null,
      quan_he:     tv.quan_he?.trim() || 'Thành viên khác',
      nghe_nghiep: tv.nghe_nghiep?.trim() || null,
    }))

    const { error } = await supabase
      .from('dang_ky_ho_moi')
      .insert({
        chu_ho:         chuHo.trim(),
        dia_chi:        diaChi.trim(),
        so_dien_thoai:  soDienThoai,
        so_nha:         body.soNha?.trim() || null,
        duong:          body.duong?.trim() || null,
        to_dan_pho:     body.toKhuVuc?.trim() || null,
        loai_cu_tru:    body.loaiCuTru === 'TAM_TRU' ? 'TAM_TRU' : 'THUONG_TRU',
        thanh_vien:     tvSach,
        nguoi_khai_sdt: soDienThoai,
        ghi_chu:        body.ghiChu?.trim() || null,
        trang_thai:     'CHO_DUYET',
      })

    if (error) {
      console.error('[dang-ky-ho-moi]', JSON.stringify(error))
      return NextResponse.json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi đăng ký hộ dân mới. Cán bộ khu phố sẽ xác minh và tạo hồ sơ chính thức trong thời gian sớm nhất.',
    })
  } catch (err) {
    console.error('[dang-ky-ho-moi]', err)
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 })
  }
}
