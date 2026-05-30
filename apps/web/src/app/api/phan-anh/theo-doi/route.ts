import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rate-limit đơn giản: max 10 request/phút per IP
const RATE_CACHE = new Map<string, { count: number; reset: number }>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = RATE_CACHE.get(ip)
  if (!entry || entry.reset < now) {
    RATE_CACHE.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

// GET /api/phan-anh/theo-doi?sdt=0901234567
export async function GET(req: NextRequest) {
  const ip  = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json({ success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
  }

  const sdt = req.nextUrl.searchParams.get('sdt')?.trim()

  // Validate SĐT
  if (!sdt || !/^(0[3-9][0-9]{8}|0[1-9][0-9]{8})$/.test(sdt)) {
    return NextResponse.json(
      { success: false, message: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('phan_anh')
      .select(`
        id,
        tieu_de,
        loai,
        muc_do,
        trang_thai,
        dia_chi_phan_anh,
        created_at,
        updated_at,
        anh_urls
      `)
      .eq('nguoi_gui_sdt', sdt)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data ?? [],
      sdt: sdt.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3'), // Che bớt SĐT
    })
  } catch (err) {
    console.error('[PhanAnh.TheoDoi]', err)
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
