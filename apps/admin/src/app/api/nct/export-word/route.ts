import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle,
  HeadingLevel, Header, Footer, PageNumber,
  convertInchesToTwip, ShadingType,
} from 'docx'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Helpers ─────────────────────────────────────────────────
function tinhTuoi(ngaySinh: string): number {
  const diff = Date.now() - new Date(ngaySinh).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  } catch { return '—' }
}

function formatMoney(amount: number | null): string {
  if (!amount) return '—'
  return amount.toLocaleString('vi-VN') + ' đ'
}

const SK_TEXT: Record<string, string> = {
  TOT:          'Tốt',
  ON_DINH:      'Ổn định',
  YEU:          'Yếu',
  CAN_CHAM_SOC: 'Cần chăm sóc',
}

// ─── Border styles ────────────────────────────────────────────
const THIN_BORDER = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' },
  left:   { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' },
  right:  { style: BorderStyle.SINGLE, size: 4, color: 'AAAAAA' },
}

// ─── Cell factory ─────────────────────────────────────────────
function cell(
  text: string,
  options: {
    bold?: boolean
    center?: boolean
    shade?: boolean
    width?: number        // phần trăm
    fontSize?: number
    color?: string
    italics?: boolean
  } = {}
): TableCell {
  const { bold = false, center = false, shade = false, width, fontSize = 18, color, italics } = options
  return new TableCell({
    borders: THIN_BORDER,
    shading: shade ? { fill: 'E8EEF7', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    margins: {
      top:    convertInchesToTwip(0.03),
      bottom: convertInchesToTwip(0.03),
      left:   convertInchesToTwip(0.06),
      right:  convertInchesToTwip(0.06),
    },
    children: [
      new Paragraph({
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold,
            size: fontSize,
            color: color ?? (shade ? '1E3A5F' : '1A1A1A'),
            font: 'Times New Roman',
            italics,
          }),
        ],
      }),
    ],
  })
}

// ─── GET /api/nct/export-word ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') ?? 'all'

    // ── Fetch data ──────────────────────────────────────────
    const supabase = createServiceClient()
    let query = supabase
      .from('nguoi_cao_tuoi')
      .select('*')
      .is('deleted_at', null)
      .or('da_mat.is.null,da_mat.eq.false')
      .order('ngay_sinh', { ascending: true })

    if (filter === 'co_don')        query = query.eq('song_co_don', true)
    else if (filter === 'tro_cap')  query = query.eq('nhan_tro_cap_xh', true)
    else if (filter === 'can_cham_soc') query = query.in('tinh_trang_sk', ['CAN_CHAM_SOC', 'YEU'])
    else if (filter === 'tu_80')    query = query.lte('ngay_sinh',
      new Date(new Date().getFullYear() - 80, 0, 1).toISOString().split('T')[0])

    const { data: rows } = await query.limit(500)
    const records = (rows ?? []).map(r => ({ ...r, tuoi: r.ngay_sinh ? tinhTuoi(r.ngay_sinh) : 0 }))

    // ── Stats ───────────────────────────────────────────────
    const total    = records.length
    const tu80     = records.filter(r => (r.tuoi ?? 0) >= 80).length
    const coDon    = records.filter(r => r.song_co_don).length
    const troCap   = records.filter(r => r.nhan_tro_cap_xh).length
    const canChamSoc = records.filter(r => r.tinh_trang_sk === 'CAN_CHAM_SOC').length
    const ngayXuat = new Date()
    const filterLabel: Record<string, string> = {
      all:          'Tất cả',
      tu_80:        'Từ 80 tuổi trở lên',
      co_don:       'Sống cô đơn',
      tro_cap:      'Nhận trợ cấp xã hội',
      can_cham_soc: 'Cần chăm sóc đặc biệt',
    }

    // ── Document ────────────────────────────────────────────
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 22 },
          },
        },
      },

      sections: [{
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(0.9),
              bottom: convertInchesToTwip(0.8),
              left:   convertInchesToTwip(1.1),
              right:  convertInchesToTwip(0.8),
            },
          },
        },

        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'KHU PHỐ 25 – PHƯỜNG LONG TRƯỜNG – TP.HCM',
                    font: 'Times New Roman', size: 18, color: '5A5A5A',
                  }),
                ],
              }),
            ],
          }),
        },

        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 18, color: '888888' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18, color: '888888' }),
                  new TextRun({ text: '/', font: 'Times New Roman', size: 18, color: '888888' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Times New Roman', size: 18, color: '888888' }),
                ],
              }),
            ],
          }),
        },

        children: [

          // ── Tiêu đề chính ────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'DANH SÁCH NGƯỜI CAO TUỔI',
                bold: true, size: 32,
                font: 'Times New Roman',
                color: '1E3A5F',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: 'Khu phố 25 – Phường Long Trường – TP.HCM',
                bold: true, size: 22,
                font: 'Times New Roman',
                color: '1E3A5F',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Bộ lọc: ${filterLabel[filter] ?? 'Tất cả'} · Xuất ngày ${formatDate(ngayXuat.toISOString())}`,
                size: 18, italics: true,
                font: 'Times New Roman',
                color: '666666',
              }),
            ],
          }),

          // ── Bảng thống kê tóm tắt ────────────────────────
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { bottom: convertInchesToTwip(0.1) },
            rows: [
              new TableRow({
                children: [
                  cell('Tổng NCT', { bold: true, center: true, shade: true, fontSize: 18 }),
                  cell('Từ 80 tuổi', { bold: true, center: true, shade: true, fontSize: 18 }),
                  cell('Sống cô đơn', { bold: true, center: true, shade: true, fontSize: 18 }),
                  cell('Nhận trợ cấp', { bold: true, center: true, shade: true, fontSize: 18 }),
                  cell('Cần chăm sóc', { bold: true, center: true, shade: true, fontSize: 18 }),
                ],
              }),
              new TableRow({
                children: [
                  cell(String(total),    { bold: true, center: true, fontSize: 24, color: '1E3A5F' }),
                  cell(String(tu80),     { bold: true, center: true, fontSize: 24, color: '3730a3' }),
                  cell(String(coDon),    { bold: true, center: true, fontSize: 24, color: 'b45309' }),
                  cell(String(troCap),   { bold: true, center: true, fontSize: 24, color: '059669' }),
                  cell(String(canChamSoc), { bold: true, center: true, fontSize: 24, color: 'DC2626' }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 160 }, children: [] }),

          // ── Bảng chính ────────────────────────────────────
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                tableHeader: true,
                children: [
                  cell('STT',          { bold: true, center: true, shade: true, width: 4,  fontSize: 17 }),
                  cell('Họ và tên',    { bold: true, center: true, shade: true, width: 14, fontSize: 17 }),
                  cell('Ngày sinh / Tuổi', { bold: true, center: true, shade: true, width: 9, fontSize: 17 }),
                  cell('GT',           { bold: true, center: true, shade: true, width: 4,  fontSize: 17 }),
                  cell('Địa chỉ',      { bold: true, center: true, shade: true, width: 16, fontSize: 17 }),
                  cell('Tình trạng SK',{ bold: true, center: true, shade: true, width: 9,  fontSize: 17 }),
                  cell('Bệnh mãn tính',{ bold: true, center: true, shade: true, width: 12, fontSize: 17 }),
                  cell('Lương hưu',    { bold: true, center: true, shade: true, width: 8,  fontSize: 17 }),
                  cell('Trợ cấp XH',  { bold: true, center: true, shade: true, width: 8,  fontSize: 17 }),
                  cell('Người CS',     { bold: true, center: true, shade: true, width: 10, fontSize: 17 }),
                  cell('Ghi chú',      { bold: true, center: true, shade: true, width: 6,  fontSize: 17 }),
                ],
              }),

              // Data rows
              ...records.map((r, idx) => {
                const evenRow = idx % 2 === 1
                const rowShade = evenRow ? { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' } : undefined

                function dataCell(text: string, opts: {
                  bold?: boolean; center?: boolean; width?: number; color?: string
                } = {}): TableCell {
                  return new TableCell({
                    borders: THIN_BORDER,
                    shading: rowShade,
                    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
                    margins: {
                      top:    convertInchesToTwip(0.03),
                      bottom: convertInchesToTwip(0.03),
                      left:   convertInchesToTwip(0.06),
                      right:  convertInchesToTwip(0.06),
                    },
                    children: [
                      new Paragraph({
                        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text,
                            bold: opts.bold ?? false,
                            size: 18,
                            font: 'Times New Roman',
                            color: opts.color ?? '1A1A1A',
                          }),
                        ],
                      }),
                    ],
                  })
                }

                const tags = [
                  r.song_co_don     ? '[Cô đơn]' : '',
                  r.la_liet_si      ? '[LS]' : '',
                  r.la_nguoi_co_cong ? '[NCC]' : '',
                  r.la_dtts         ? '[DTTS]' : '',
                ].filter(Boolean).join(' ')

                const tenVaTags = r.ho_ten + (tags ? `\n${tags}` : '')

                return new TableRow({
                  children: [
                    dataCell(String(idx + 1),                              { center: true, width: 4 }),
                    dataCell(tenVaTags,                                     { bold: true,   width: 14 }),
                    dataCell(formatDate(r.ngay_sinh) + (r.tuoi ? `\n(${r.tuoi} tuổi)` : ''), { center: true, width: 9 }),
                    dataCell(r.gioi_tinh === 'NAM' ? 'Nam' : r.gioi_tinh === 'NU' ? 'Nữ' : '—', { center: true, width: 4 }),
                    dataCell(r.dia_chi_day ?? '—',                         { width: 16 }),
                    dataCell(SK_TEXT[r.tinh_trang_sk] ?? r.tinh_trang_sk,  { center: true, width: 9,
                      color: r.tinh_trang_sk === 'CAN_CHAM_SOC' ? 'DC2626'
                           : r.tinh_trang_sk === 'TOT'          ? '059669' : '1A1A1A' }),
                    dataCell(r.benh_man_tinh ?? '—',                       { width: 12 }),
                    dataCell(r.co_luong_huu ? (formatMoney(r.muc_luong_huu)) : 'Không', { center: true, width: 8,
                      color: r.co_luong_huu ? '059669' : '888888' }),
                    dataCell(r.nhan_tro_cap_xh ? (formatMoney(r.muc_tro_cap_xh) + '/tháng') : 'Không', { center: true, width: 8,
                      color: r.nhan_tro_cap_xh ? '059669' : '888888' }),
                    dataCell(r.co_nguoi_cham_soc && r.ten_nguoi_cham_soc
                      ? r.ten_nguoi_cham_soc + (r.sdt_nguoi_cham_soc ? `\n${r.sdt_nguoi_cham_soc}` : '')
                      : (r.song_co_don ? 'Không có' : '—'),              { width: 10,
                      color: r.song_co_don && !r.co_nguoi_cham_soc ? 'b45309' : '1A1A1A' }),
                    dataCell(r.ghi_chu ?? '—',                             { width: 6 }),
                  ],
                })
              }),
            ],
          }),

          // ── Ghi chú cuối ─────────────────────────────────
          new Paragraph({ spacing: { before: 240 }, children: [] }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `Tổng cộng: ${total} người cao tuổi`,
                bold: true, size: 20, font: 'Times New Roman', color: '1E3A5F',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `Ngày xuất báo cáo: ${formatDate(ngayXuat.toISOString())} ${String(ngayXuat.getHours()).padStart(2,'0')}:${String(ngayXuat.getMinutes()).padStart(2,'0')}`,
                size: 18, font: 'Times New Roman', color: '666666', italics: true,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Căn cứ: Luật Người cao tuổi 2009 · Nghị định 20/2021/NĐ-CP · Quyết định UBND TP.HCM',
                size: 16, font: 'Times New Roman', color: '888888', italics: true,
              }),
            ],
          }),

          // ── Chữ ký ───────────────────────────────────────
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top:    { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left:   { style: BorderStyle.NONE },
              right:  { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'NGƯỜI LẬP DANH SÁCH', bold: true, size: 18, font: 'Times New Roman' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', size: 16, italics: true, font: 'Times New Roman', color: '666666' })],
                      }),
                      new Paragraph({ spacing: { after: 600 }, children: [] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'TRƯỞNG KHU PHỐ 25', bold: true, size: 18, font: 'Times New Roman' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: '(Ký, đóng dấu)', size: 16, italics: true, font: 'Times New Roman', color: '666666' })],
                      }),
                      new Paragraph({ spacing: { after: 600 }, children: [] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

        ], // end children
      }], // end sections
    })

    // ── Serialize ──────────────────────────────────────────
    const buffer = await Packer.toBuffer(doc)
    const uint8  = new Uint8Array(buffer)

    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const filterPart = filter === 'all' ? '' : `_${filter}`
    const filename = `DS_NCT_KP25${filterPart}_${datePart}.docx`

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length':      String(uint8.byteLength),
      },
    })
  } catch (err) {
    console.error('[export-word NCT]', err)
    return NextResponse.json({ error: 'Không thể tạo file Word' }, { status: 500 })
  }
}
