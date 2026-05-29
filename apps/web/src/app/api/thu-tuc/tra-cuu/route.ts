import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET /api/thu-tuc/tra-cuu?ma=KP25-2026-XXXXXX
//              hoặc ?cccd=0123456789012 ───────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const maHoSo           = searchParams.get('ma')?.toUpperCase().trim()
  const cccd             = searchParams.get('cccd')?.trim()

  if (!maHoSo && !cccd) {
    return NextResponse.json(
      { success: false, message: 'Cần cung cấp mã hồ sơ hoặc số CCCD' },
      { status: 400 }
    )
  }

  // ── Validate CCCD ───────────────────────────────────────
  if (cccd && !/^\d{9,12}$/.test(cccd)) {
    return NextResponse.json(
      { success: false, message: 'Số CCCD không hợp lệ' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // ── Query ──────────────────────────────────────────────
    let query = supabase
      .from('ho_so_thu_tuc')
      .select(`
        ma_ho_so,
        thu_tuc_id,
        thu_tuc_ten,
        ho_ten,
        cccd,
        sdt,
        trang_thai,
        ngay_hen_tra,
        ghi_chu_can_bo,
        can_chuan_bi_bo_sung,
        created_at,
        updated_at
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (maHoSo) {
      query = query.eq('ma_ho_so', maHoSo)
    } else if (cccd) {
      query = query.eq('cccd', cccd).limit(10)
    }

    const { data, error } = await query

    if (error) {
      console.error('[TraCuu] Supabase error:', error.message)
      return NextResponse.json(
        { success: false, message: 'Lỗi hệ thống, vui lòng thử lại' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy hồ sơ' },
        { status: 404 }
      )
    }

    // ── Map sang camelCase ─────────────────────────────────
    const mapped = data.map((r) => ({
      maHoSo:           r['ma_ho_so']              as string,
      thuTucId:         r['thu_tuc_id']             as string,
      thuTucTen:        r['thu_tuc_ten']            as string,
      hoTen:            r['ho_ten']                 as string,
      cccd:             r['cccd']                   as string,
      sdt:              r['sdt']                    as string,
      trangThai:        r['trang_thai']             as string,
      ngayHenTra:       r['ngay_hen_tra']           as string | null,
      ghiChu:           r['ghi_chu_can_bo']         as string | null,
      chuanBiBoSung:    r['can_chuan_bi_bo_sung']   as string[] | null,
      ngayNop:          r['created_at']             as string,
      ngayCapNhat:      r['updated_at']             as string,
    }))

    return NextResponse.json({
      success: true,
      message: `Tìm thấy ${mapped.length} hồ sơ`,
      data: mapped,
    })

  } catch (err) {
    console.error('[TraCuu] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống không xác định' },
      { status: 500 }
    )
  }
}
