import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getThuTucById } from '@/app/(portal)/thu-tuc/data'

// ─── Generate mã hồ sơ duy nhất ─────────────────────────────
function genMaHoSo(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `KP25-${year}-${rand}`
}

// ─── POST /api/thu-tuc/nop-ho-so ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { thuTucId, hoTen, cccd, sdt, email, diaChiNopHoSo, ghiChu, chuanBiHoSo } = body

    // ── Validate bắt buộc ──────────────────────────────────
    if (!thuTucId || !hoTen?.trim() || !cccd?.trim() || !sdt?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc (họ tên, CCCD, SĐT)' },
        { status: 400 }
      )
    }

    if (!chuanBiHoSo) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng xác nhận đã chuẩn bị đầy đủ hồ sơ' },
        { status: 400 }
      )
    }

    // ── Validate CCCD ──────────────────────────────────────
    const cccdClean = cccd.replace(/\s/g, '')
    if (!/^\d{9,12}$/.test(cccdClean)) {
      return NextResponse.json(
        { success: false, message: 'Số CCCD không hợp lệ (phải có 9 hoặc 12 chữ số)' },
        { status: 400 }
      )
    }

    // ── Validate SĐT ───────────────────────────────────────
    const sdtClean = sdt.replace(/\s/g, '')
    if (!/^(0|\+84)\d{9}$/.test(sdtClean)) {
      return NextResponse.json(
        { success: false, message: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      )
    }

    // ── Kiểm tra thủ tục tồn tại ───────────────────────────
    const thuTuc = getThuTucById(thuTucId)
    if (!thuTuc) {
      return NextResponse.json(
        { success: false, message: 'Thủ tục không tồn tại' },
        { status: 404 }
      )
    }

    // ── Kiểm tra mức độ trực tuyến ─────────────────────────
    if (thuTuc.mucDoTrucTuyen < 3) {
      return NextResponse.json(
        { success: false, message: 'Thủ tục này không hỗ trợ nộp hồ sơ trực tuyến, vui lòng đến UBND Phường trực tiếp' },
        { status: 400 }
      )
    }

    // ── Tính ngày hẹn trả ─────────────────────────────────
    const ngayHenTra = (() => {
      const d       = new Date()
      const soNgay  = parseInt(thuTuc.thoiHanGiaiQuyet.match(/(\d+)/)?.[1] ?? '5')
      let dem       = 0
      while (dem < soNgay) {
        d.setDate(d.getDate() + 1)
        const dow = d.getDay()
        if (dow !== 0 && dow !== 6) dem++  // Bỏ Chủ nhật và Thứ 7
      }
      return d.toISOString()
    })()

    // ── Lưu vào Supabase ──────────────────────────────────
    const supabase  = await createClient()
    const maHoSo    = genMaHoSo()

    const { data: inserted, error } = await supabase
      .from('ho_so_thu_tuc')
      .insert({
        ma_ho_so:        maHoSo,
        thu_tuc_id:      thuTucId,
        thu_tuc_ten:     thuTuc.ten,
        ho_ten:          hoTen.trim(),
        cccd:            cccdClean,
        sdt:             sdtClean,
        email:           email?.trim() || null,
        dia_chi:         diaChiNopHoSo?.trim() || null,
        ghi_chu_nguoi_nop: ghiChu?.trim() || null,
        trang_thai:      'TIEP_NHAN',
        ngay_hen_tra:    ngayHenTra,
      })
      .select('ma_ho_so, trang_thai, ngay_hen_tra, created_at')
      .single()

    if (error) {
      console.error('[NopHoSo] Supabase error:', error.message)
      return NextResponse.json(
        { success: false, message: 'Lỗi hệ thống, vui lòng thử lại sau' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đã ghi nhận hồ sơ thành công',
      data: {
        maHoSo:    inserted['ma_ho_so'],
        trangThai: inserted['trang_thai'],
        ngayHenTra: inserted['ngay_hen_tra'],
        ngayNop:   inserted['created_at'],
        thuTucTen: thuTuc.ten,
      },
    })

  } catch (err) {
    console.error('[NopHoSo] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống không xác định' },
      { status: 500 }
    )
  }
}
