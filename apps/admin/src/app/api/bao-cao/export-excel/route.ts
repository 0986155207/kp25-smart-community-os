import { KHU_PHO } from '@/lib/khu-pho'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { layDuLieuBaoCao } from '@/app/dashboard/bao-cao/actions'

// ─── Tiêu đề cột (in hoa, chuẩn hành chính) ─────────────────────
function header(ws: XLSX.WorkSheet, rowIdx: number, cols: string[]) {
  cols.forEach((text, c) => {
    const ref = XLSX.utils.encode_cell({ r: rowIdx, c })
    ws[ref] = { v: text, t: 's' }
  })
}

// ─── Merge dải ô ────────────────────────────────────────────────
function merge(ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) {
  ws['!merges'] = ws['!merges'] ?? []
  ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } })
}

export async function GET() {
  const data = await layDuLieuBaoCao()
  const { kpi, phanBoTo, phanBoGioiTinh, phanBoDoTuoi, phanBoCuTru,
          phanAnhTheoThang, phanAnhTheoLoai, phanAnhTheoTT,
          bhytTheoTT, hoNgheoTheoLoai, nctTheoSK, ngayTao } = data

  const wb = XLSX.utils.book_new()
  const ngayXuat = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

  // ═══════════════════════════════════════════════════════════════
  //  SHEET 1 — TỔNG QUAN KPI
  // ═══════════════════════════════════════════════════════════════
  {
    const rows: (string | number)[][] = [
      ['KHU PHỐ 25 – PHƯỜNG LONG TRƯỜNG – TP.HCM', '', '', ''],
      ['BÁO CÁO TỔNG HỢP CÁC CHỈ TIÊU CHÍNH', '', '', ''],
      [`Ngày xuất: ${ngayXuat}`, '', '', ''],
      [],
      ['STT', 'CHỈ TIÊU', 'GIÁ TRỊ', 'ĐƠN VỊ'],
      ['1',  'Tổng số hộ dân',                        kpi.tongHoDan,                          'hộ'],
      ['2',  'Tổng nhân khẩu',                         kpi.tongNhanKhau,                       'người'],
      ['3',  'Tổng phản ánh hiện trường',               kpi.tongPhanAnh,                        'vụ'],
      ['4',  'Tỷ lệ xử lý phản ánh',                   `${kpi.tyLeXuLyPA}%`,                   ''],
      ['5',  'Tổng thẻ Bảo hiểm Y tế',                 kpi.tongBHYT,                           'thẻ'],
      ['6',  'Hộ nghèo/cận nghèo đang hưởng',          kpi.tongHoNgheo,                        'hộ'],
      ['7',  'Người cao tuổi (còn sống)',               kpi.tongNCT,                            'người'],
      ['8',  'Tổng thông báo đã phát hành',             kpi.tongThongBao,                       'bản'],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 6 }, { wch: 42 }, { wch: 18 }, { wch: 12 }]
    merge(ws, 0, 0, 0, 3)
    merge(ws, 1, 0, 1, 3)
    merge(ws, 2, 0, 2, 3)
    XLSX.utils.book_append_sheet(wb, ws, 'Tổng quan')
  }

  // ═══════════════════════════════════════════════════════════════
  //  SHEET 2 — DÂN CƯ
  // ═══════════════════════════════════════════════════════════════
  {
    const rows: (string | number)[][] = [
      ['I. PHÂN BỔ HỘ DÂN THEO TỔ / KHU VỰC', '', ''],
      ['TỔ / KHU VỰC', 'SỐ HỘ', 'NHÂN KHẨU'],
      ...phanBoTo.map(t => [t.ten, t.soHo, t.soNguoi]),
      ['TỔNG CỘNG', phanBoTo.reduce((s, t) => s + t.soHo, 0), phanBoTo.reduce((s, t) => s + t.soNguoi, 0)],
      [],
      ['II. PHÂN BỔ GIỚI TÍNH NHÂN KHẨU', '', ''],
      ['GIỚI TÍNH', 'SỐ LƯỢNG', 'TỶ LỆ (%)'],
      ...phanBoGioiTinh.map(g => {
        const total = phanBoGioiTinh.reduce((s, x) => s + x.value, 0)
        return [g.name, g.value, total > 0 ? `${Math.round(g.value / total * 100)}%` : '0%']
      }),
      [],
      ['III. PHÂN BỔ ĐỘ TUỔI NHÂN KHẨU', '', ''],
      ['NHÓM TUỔI', 'SỐ NGƯỜI', ''],
      ...phanBoDoTuoi.map(d => [d.nhom, d.soNguoi, '']),
      [],
      ['IV. TÌNH TRẠNG CƯ TRÚ HỘ DÂN', '', ''],
      ['TÌNH TRẠNG', 'SỐ HỘ', 'TỶ LỆ (%)'],
      ...phanBoCuTru.map(c => {
        const total = phanBoCuTru.reduce((s, x) => s + x.value, 0)
        return [c.name, c.value, total > 0 ? `${Math.round(c.value / total * 100)}%` : '0%']
      }),
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 14 }]
    merge(ws, 0, 0, 0, 2)
    XLSX.utils.book_append_sheet(wb, ws, 'Dân cư')
  }

  // ═══════════════════════════════════════════════════════════════
  //  SHEET 3 — PHẢN ÁNH HIỆN TRƯỜNG
  // ═══════════════════════════════════════════════════════════════
  {
    const rows: (string | number)[][] = [
      ['I. PHẢN ÁNH THEO THÁNG (12 THÁNG GẦN NHẤT)', '', '', ''],
      ['THÁNG', 'MỚI TIẾP NHẬN', 'ĐANG XỬ LÝ', 'ĐÃ HOÀN THÀNH'],
      ...phanAnhTheoThang.map(t => [t.thang, t.moi, t.dangXuLy, t.daXuLy]),
      ['TỔNG CỘNG',
        phanAnhTheoThang.reduce((s, t) => s + t.moi, 0),
        phanAnhTheoThang.reduce((s, t) => s + t.dangXuLy, 0),
        phanAnhTheoThang.reduce((s, t) => s + t.daXuLy, 0),
      ],
      [],
      ['II. PHÂN LOẠI PHẢN ÁNH THEO NỘI DUNG', '', '', ''],
      ['LOẠI PHẢN ÁNH', 'SỐ LƯỢNG', 'TỶ LỆ (%)', ''],
      ...phanAnhTheoLoai.map(l => {
        const total = phanAnhTheoLoai.reduce((s, x) => s + x.value, 0)
        return [l.name, l.value, total > 0 ? `${Math.round(l.value / total * 100)}%` : '', '']
      }),
      [],
      ['III. TRẠNG THÁI XỬ LÝ PHẢN ÁNH', '', '', ''],
      ['TRẠNG THÁI', 'SỐ LƯỢNG', 'TỶ LỆ (%)', ''],
      ...phanAnhTheoTT.map(t => {
        const total = phanAnhTheoTT.reduce((s, x) => s + x.value, 0)
        return [t.name, t.value, total > 0 ? `${Math.round(t.value / total * 100)}%` : '', '']
      }),
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
    merge(ws, 0, 0, 0, 3)
    XLSX.utils.book_append_sheet(wb, ws, 'Phản ánh')
  }

  // ═══════════════════════════════════════════════════════════════
  //  SHEET 4 — AN SINH XÃ HỘI
  // ═══════════════════════════════════════════════════════════════
  {
    const rows: (string | number)[][] = [
      ['I. BẢO HIỂM Y TẾ', ''],
      ['TRẠNG THÁI', 'SỐ LƯỢNG'],
      ...bhytTheoTT.map(b => [b.name, b.value]),
      ['TỔNG CỘNG', bhytTheoTT.reduce((s, b) => s + b.value, 0)],
      [],
      ['II. HỘ NGHÈO VÀ CẬN NGHÈO', ''],
      ['PHÂN LOẠI', 'SỐ HỘ'],
      ...hoNgheoTheoLoai.map(h => [h.name, h.value]),
      ['TỔNG', hoNgheoTheoLoai.reduce((s, h) => s + h.value, 0)],
      [],
      ['III. NGƯỜI CAO TUỔI (THEO SỨC KHỎE)', ''],
      ['TÌNH TRẠNG SỨC KHỎE', 'SỐ NGƯỜI'],
      ...nctTheoSK.map(n => [n.name, n.value]),
      ['TỔNG', nctTheoSK.reduce((s, n) => s + n.value, 0)],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 32 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws, 'An sinh xã hội')
  }

  // ── Xuất file ──────────────────────────────────────────────────
  const buf  = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''Bao-cao-${KHU_PHO.ma}-${date}.xlsx`,
      'Cache-Control': 'no-store',
    },
  })
}
