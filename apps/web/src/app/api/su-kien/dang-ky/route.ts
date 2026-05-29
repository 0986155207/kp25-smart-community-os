import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      suKienId: string
      hoTen: string
      soDienThoai: string
      soNguoi: number
      ghiChu?: string | null
    }

    const { suKienId, hoTen, soDienThoai, soNguoi, ghiChu } = body

    if (!suKienId || !hoTen?.trim() || !soDienThoai?.trim()) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const supabase = await createClient()

    // Kiểm tra sự kiện còn mở đăng ký không
    const { data: sk } = await supabase
      .from('su_kien')
      .select('id, can_dang_ky, trang_thai, han_dang_ky')
      .eq('id', suKienId)
      .is('deleted_at', null)
      .single()

    if (!sk) {
      return NextResponse.json({ success: false, message: 'Sự kiện không tồn tại' }, { status: 404 })
    }
    if (!sk['can_dang_ky']) {
      return NextResponse.json({ success: false, message: 'Sự kiện này không cần đăng ký' }, { status: 400 })
    }
    if (sk['trang_thai'] !== 'SAP_DIEN_RA') {
      return NextResponse.json({ success: false, message: 'Sự kiện không còn nhận đăng ký' }, { status: 400 })
    }
    if (sk['han_dang_ky'] && new Date(sk['han_dang_ky'] as string) < new Date()) {
      return NextResponse.json({ success: false, message: 'Đã hết hạn đăng ký' }, { status: 400 })
    }

    // Kiểm tra đăng ký trùng (cùng SĐT + sự kiện)
    const { data: existing } = await supabase
      .from('dang_ky_su_kien')
      .select('id')
      .eq('su_kien_id', suKienId)
      .eq('so_dien_thoai', soDienThoai.trim())
      .neq('trang_thai', 'HUY')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Số điện thoại này đã đăng ký sự kiện rồi',
      }, { status: 409 })
    }

    // Lưu đăng ký
    const { error } = await supabase.from('dang_ky_su_kien').insert({
      su_kien_id:    suKienId,
      ho_ten:        hoTen.trim(),
      so_dien_thoai: soDienThoai.trim(),
      so_nguoi:      soNguoi ?? 1,
      ghi_chu:       ghiChu ?? null,
      trang_thai:    'CHO_XAC_NHAN',
    })

    if (error) throw new Error(error.message)

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Ban điều hành sẽ liên hệ xác nhận.',
    })
  } catch (err) {
    console.error('[POST /api/su-kien/dang-ky]', err)
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : 'Lỗi hệ thống',
    }, { status: 500 })
  }
}
