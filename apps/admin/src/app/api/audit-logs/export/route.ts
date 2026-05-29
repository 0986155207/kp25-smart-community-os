import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ghiAuditLog } from '@/lib/audit'

// Chuyển chuỗi có dấu phẩy / xuống dòng thành trường CSV an toàn
function csvCell(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const HANH_DONG_LABEL: Record<string, string> = {
  TAO:            'Tạo mới',
  CAP_NHAT:       'Cập nhật',
  XOA:            'Xóa',
  DANG_NHAP:      'Đăng nhập',
  DANG_XUAT:      'Đăng xuất',
  GUI_THONG_BAO:  'Gửi thông báo',
  XUAT_KHAU:      'Xuất dữ liệu',
  XEM_CHI_TIET:   'Xem chi tiết',
}

const BANG_LABEL: Record<string, string> = {
  phan_anh:         'Phản ánh',
  ho_dan:           'Hộ dân',
  nhan_khau:        'Nhân khẩu',
  thong_bao:        'Thông báo',
  su_kien:          'Sự kiện',
  can_bo:           'Cán bộ',
  bhyt:             'BHYT',
  ho_ngheo:         'Hộ nghèo',
  nguoi_cao_tuoi:   'Người cao tuổi',
  tai_lieu:         'Tài liệu',
  he_thong:         'Hệ thống',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const hanh_dong   = searchParams.get('hanh_dong') || undefined
    const bang        = searchParams.get('bang')       || undefined
    const can_bo      = searchParams.get('can_bo')     || undefined
    const tu_ngay     = searchParams.get('tu_ngay')    || undefined
    const den_ngay    = searchParams.get('den_ngay')   || undefined
    const q           = searchParams.get('q')          || undefined

    const svc = createServiceClient()

    let query = svc
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000)  // giới hạn 5 000 bản ghi mỗi lần xuất

    if (hanh_dong)    query = query.eq('hanh_dong', hanh_dong)
    if (bang)         query = query.eq('bang', bang)
    if (can_bo)       query = query.eq('can_bo_email', can_bo)
    if (tu_ngay)      query = query.gte('created_at', tu_ngay)
    if (den_ngay) {
      const d = new Date(den_ngay)
      d.setDate(d.getDate() + 1)
      query = query.lt('created_at', d.toISOString())
    }
    if (q) query = query.ilike('mo_ta', `%${q}%`)

    const { data, error } = await query

    if (error) throw error

    // ── Tạo nội dung CSV ────────────────────────────────────────
    const HEADER = [
      'Thời gian', 'Hành động', 'Bảng dữ liệu',
      'Mã bản ghi', 'Mô tả', 'Cán bộ', 'Email', 'IP',
    ]

    const rows = (data ?? []).map(row => [
      csvCell(new Date(row.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })),
      csvCell(HANH_DONG_LABEL[row.hanh_dong] ?? row.hanh_dong),
      csvCell(row.bang ? (BANG_LABEL[row.bang] ?? row.bang) : ''),
      csvCell(row.ban_ghi_id ? row.ban_ghi_id.slice(0, 8) : ''),
      csvCell(row.mo_ta),
      csvCell(row.can_bo_ten ?? 'Hệ thống'),
      csvCell(row.can_bo_email ?? ''),
      csvCell(row.ip_address ?? ''),
    ].join(','))

    const csv = '﻿' + [HEADER.join(','), ...rows].join('\r\n')

    // Ghi nhật ký xuất khẩu (fire-and-forget)
    const now = new Date().toISOString().slice(0, 10)
    ghiAuditLog({
      hanh_dong: 'XUAT_KHAU',
      bang: 'audit_logs',
      mo_ta: `Xuất CSV nhật ký hoạt động — ${(data ?? []).length} bản ghi (${now})`,
    }).catch(() => {})

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nhat-ky-${now}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[audit-logs/export]', err)
    return NextResponse.json({ error: 'Không thể xuất dữ liệu' }, { status: 500 })
  }
}
