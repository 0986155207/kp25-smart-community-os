import { NextResponse } from 'next/server'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
  VerticalAlign,
  convertMillimetersToTwip,
} from 'docx'
import { layDuLieuBaoCao } from '@/app/dashboard/bao-cao/actions'

// ─── Helper: dòng trống ──────────────────────────────────────────
const emptyLine = () => new Paragraph({ text: '' })

// ─── Helper: đoạn văn thông thường ──────────────────────────────
function para(text: string, opts?: {
  bold?: boolean
  size?: number
  align?: (typeof AlignmentType)[keyof typeof AlignmentType]
  indent?: boolean
}) {
  return new Paragraph({
    alignment: opts?.align ?? AlignmentType.LEFT,
    indent:    opts?.indent ? { left: convertMillimetersToTwip(10) } : undefined,
    children: [new TextRun({
      text,
      bold:     opts?.bold ?? false,
      size:     (opts?.size ?? 13) * 2,  // half-points
      font:     'Times New Roman',
    })],
  })
}

// ─── Helper: dòng ký tên ─────────────────────────────────────────
function signRow(left: string, right: string): Table {
  const cell = (txt: string) => new TableCell({
    borders: {
      top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    verticalAlign: VerticalAlign.CENTER,
    width:    { size: 50, type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children:  [new TextRun({ text: txt, bold: true, size: 26, font: 'Times New Roman' })],
    })],
  })
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:          { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom:       { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left:         { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right:        { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [new TableRow({ children: [cell(left), cell(right)] })],
  })
}

// ─── Helper: bảng dữ liệu ────────────────────────────────────────
function dataTable(headers: string[], rows: (string | number)[][]): Table {
  const colCount = headers.length
  const colWidth = Math.floor(9638 / colCount) // twip, ~170mm tổng

  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        shading: { fill: '1E3A5F' },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children:  [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22, font: 'Times New Roman' })],
        })],
      })
    ),
  })

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          shading: ri % 2 === 0 ? undefined : { fill: 'F8FAFC' },
          verticalAlign: VerticalAlign.CENTER,
          width: { size: colWidth, type: WidthType.DXA },
          children: [new Paragraph({
            alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
            children: [new TextRun({
              text: String(cell ?? ''),
              bold: String(cell ?? '').toUpperCase() === String(cell ?? '') && ci === 0,
              size: 22,
              font: 'Times New Roman',
            })],
          })],
        })
      ),
    })
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows:  [headerRow, ...dataRows],
  })
}

// ─── Helper: tiêu đề phần ────────────────────────────────────────
function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading:   HeadingLevel.HEADING_2,
    spacing:   { before: 240, after: 120 },
    children:  [new TextRun({ text, bold: true, size: 28, font: 'Times New Roman', color: '1E3A5F' })],
  })
}

// ─── Route handler ────────────────────────────────────────────────
export async function GET() {
  const data = await layDuLieuBaoCao()
  const { kpi, phanBoTo, phanBoGioiTinh, phanBoDoTuoi, phanBoCuTru,
          phanAnhTheoThang, phanAnhTheoLoai, phanAnhTheoTT,
          bhytTheoTT, hoNgheoTheoLoai, nctTheoSK } = data

  const _now = new Date()
  const ngayTao = _now.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  })
  const namHienTai = parseInt(_now.toLocaleDateString('vi-VN', { year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).replace(/\D/g, ''))

  const doc = new Document({
    styles: {
      default: {
        document: {
          run:       { font: 'Times New Roman', size: 26 },
          paragraph: { spacing: { line: 360, lineRule: 'auto' } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertMillimetersToTwip(25),
            bottom: convertMillimetersToTwip(25),
            left:   convertMillimetersToTwip(30),
            right:  convertMillimetersToTwip(20),
          },
        },
      },
      children: [

        // ── Quốc hiệu & Tiêu ngữ ─────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
            bold: true, size: 28, font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { after: 120 },
          children: [new TextRun({
            text: 'Độc lập – Tự do – Hạnh phúc',
            bold: true, size: 26, font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { after: 240 },
          children: [new TextRun({
            text: '─────────────────────',
            size: 20, font: 'Times New Roman',
          })],
        }),

        // ── Đơn vị ───────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: 'KHU PHỐ 25 – PHƯỜNG LONG TRƯỜNG – TP.HCM',
            bold: true, size: 26, font: 'Times New Roman', color: '1E3A5F',
          })],
        }),
        emptyLine(),

        // ── Tiêu đề văn bản ──────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 200, after: 100 },
          children: [new TextRun({
            text: 'BÁO CÁO TỔNG HỢP',
            bold: true, size: 34, font: 'Times New Roman', allCaps: true,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: `Tình hình Dân cư, An sinh Xã hội và Phản ánh Hiện trường`,
            bold: true, size: 28, font: 'Times New Roman',
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { after: 100 },
          children: [new TextRun({
            text: `Khu phố 25 – Phường Long Trường – TP.HCM – Năm ${namHienTai}`,
            size: 26, font: 'Times New Roman', italics: true,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing:   { after: 360 },
          children: [new TextRun({
            text: `Long Trường, ngày ${ngayTao}`,
            size: 24, font: 'Times New Roman', italics: true,
          })],
        }),

        // ════════════════════════════════════════════════════
        //  PHẦN I — KPI TỔNG QUAN
        // ════════════════════════════════════════════════════
        sectionTitle('I. KẾT QUẢ CÁC CHỈ TIÊU CHÍNH'),

        dataTable(
          ['STT', 'CHỈ TIÊU', 'GIÁ TRỊ', 'ĐƠN VỊ'],
          [
            ['1', 'Tổng số hộ dân',                           kpi.tongHoDan,    'hộ'],
            ['2', 'Tổng nhân khẩu',                            kpi.tongNhanKhau, 'người'],
            ['3', 'Tổng phản ánh hiện trường',                 kpi.tongPhanAnh,  'vụ'],
            ['4', 'Tỷ lệ phản ánh đã xử lý',                  `${kpi.tyLeXuLyPA}%`, ''],
            ['5', 'Tổng thẻ Bảo hiểm Y tế',                   kpi.tongBHYT,     'thẻ'],
            ['6', 'Hộ nghèo/cận nghèo đang được hỗ trợ',      kpi.tongHoNgheo,  'hộ'],
            ['7', 'Người cao tuổi (còn sống)',                 kpi.tongNCT,      'người'],
            ['8', 'Tổng thông báo đã phát hành',              kpi.tongThongBao, 'bản'],
          ]
        ),

        emptyLine(),

        // ════════════════════════════════════════════════════
        //  PHẦN II — DÂN CƯ
        // ════════════════════════════════════════════════════
        sectionTitle('II. TÌNH HÌNH DÂN CƯ'),

        para('1. Phân bổ hộ dân theo Tổ / Khu vực', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['TỔ / KHU VỰC', 'SỐ HỘ', 'NHÂN KHẨU'],
          [
            ...phanBoTo.map(t => [t.ten, t.soHo, t.soNguoi]),
            ['TỔNG CỘNG',
              phanBoTo.reduce((s, t) => s + t.soHo, 0),
              phanBoTo.reduce((s, t) => s + t.soNguoi, 0),
            ],
          ]
        ),

        emptyLine(),
        para('2. Phân bổ giới tính nhân khẩu', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['GIỚI TÍNH', 'SỐ NGƯỜI', 'TỶ LỆ'],
          phanBoGioiTinh.map(g => {
            const total = phanBoGioiTinh.reduce((s, x) => s + x.value, 0)
            return [g.name, g.value, total > 0 ? `${Math.round(g.value / total * 100)}%` : '0%']
          })
        ),

        emptyLine(),
        para('3. Phân bổ theo nhóm độ tuổi', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['NHÓM TUỔI', 'SỐ NGƯỜI'],
          phanBoDoTuoi.map(d => [d.nhom, d.soNguoi])
        ),

        emptyLine(),
        para('4. Tình trạng cư trú hộ dân', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['TÌNH TRẠNG', 'SỐ HỘ', 'TỶ LỆ'],
          phanBoCuTru.map(c => {
            const total = phanBoCuTru.reduce((s, x) => s + x.value, 0)
            return [c.name, c.value, total > 0 ? `${Math.round(c.value / total * 100)}%` : '0%']
          })
        ),

        emptyLine(),

        // ════════════════════════════════════════════════════
        //  PHẦN III — PHẢN ÁNH
        // ════════════════════════════════════════════════════
        sectionTitle('III. TÌNH HÌNH PHẢN ÁNH HIỆN TRƯỜNG'),

        para('1. Phản ánh theo tháng (12 tháng gần nhất)', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['THÁNG', 'MỚI TIẾP NHẬN', 'ĐANG XỬ LÝ', 'ĐÃ HOÀN THÀNH'],
          [
            ...phanAnhTheoThang.map(t => [t.thang, t.moi, t.dangXuLy, t.daXuLy]),
            ['TỔNG',
              phanAnhTheoThang.reduce((s, t) => s + t.moi, 0),
              phanAnhTheoThang.reduce((s, t) => s + t.dangXuLy, 0),
              phanAnhTheoThang.reduce((s, t) => s + t.daXuLy, 0),
            ],
          ]
        ),

        emptyLine(),
        para('2. Phân loại phản ánh theo nội dung', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['LOẠI PHẢN ÁNH', 'SỐ LƯỢNG', 'TỶ LỆ'],
          phanAnhTheoLoai.map(l => {
            const total = phanAnhTheoLoai.reduce((s, x) => s + x.value, 0)
            return [l.name, l.value, total > 0 ? `${Math.round(l.value / total * 100)}%` : '0%']
          })
        ),

        emptyLine(),
        para('3. Trạng thái xử lý phản ánh', { bold: true, indent: true }),
        emptyLine(),

        dataTable(
          ['TRẠNG THÁI', 'SỐ LƯỢNG', 'TỶ LỆ'],
          phanAnhTheoTT.map(t => {
            const total = phanAnhTheoTT.reduce((s, x) => s + x.value, 0)
            return [t.name, t.value, total > 0 ? `${Math.round(t.value / total * 100)}%` : '0%']
          })
        ),

        emptyLine(),

        // ════════════════════════════════════════════════════
        //  PHẦN IV — AN SINH
        // ════════════════════════════════════════════════════
        sectionTitle('IV. AN SINH XÃ HỘI'),

        para('1. Bảo hiểm Y tế', { bold: true, indent: true }),
        emptyLine(),
        dataTable(
          ['TRẠNG THÁI BHYT', 'SỐ LƯỢNG', 'TỶ LỆ'],
          bhytTheoTT.map(b => {
            const total = bhytTheoTT.reduce((s, x) => s + x.value, 0)
            return [b.name, b.value, total > 0 ? `${Math.round(b.value / total * 100)}%` : '0%']
          })
        ),

        emptyLine(),
        para('2. Hộ nghèo và Cận nghèo', { bold: true, indent: true }),
        emptyLine(),
        dataTable(
          ['PHÂN LOẠI', 'SỐ HỘ'],
          hoNgheoTheoLoai.map(h => [h.name, h.value])
        ),

        emptyLine(),
        para('3. Sức khỏe Người cao tuổi', { bold: true, indent: true }),
        emptyLine(),
        dataTable(
          ['TÌNH TRẠNG SỨC KHỎE', 'SỐ NGƯỜI'],
          nctTheoSK.map(n => [n.name, n.value])
        ),

        emptyLine(),
        emptyLine(),

        // ════════════════════════════════════════════════════
        //  PHẦN V — KẾT LUẬN
        // ════════════════════════════════════════════════════
        sectionTitle('V. KẾT LUẬN VÀ KIẾN NGHỊ'),

        para(
          `Trên cơ sở tổng hợp dữ liệu từ Hệ thống KP25 Smart Community OS, Ban điều hành Khu phố 25 ` +
          `đã nắm bắt đầy đủ tình hình dân cư, an sinh xã hội và xử lý kịp thời các phản ánh của người dân ` +
          `trong khu vực. Tỷ lệ xử lý phản ánh đạt ${kpi.tyLeXuLyPA}%, thể hiện tinh thần trách nhiệm và ` +
          `hiệu quả trong công tác điều hành của Ban.`,
          { indent: true }
        ),
        emptyLine(),
        para(
          `Kính đề nghị các cấp lãnh đạo quan tâm, chỉ đạo để công tác số hóa và quản lý địa bàn ` +
          `ngày càng được nâng cao, phục vụ tốt hơn nhu cầu của nhân dân trong khu phố.`,
          { indent: true }
        ),

        emptyLine(),
        emptyLine(),

        // ════════════════════════════════════════════════════
        //  KÝ TÊN
        // ════════════════════════════════════════════════════
        signRow('NGƯỜI LẬP BÁO CÁO', 'TRƯỞNG KHU PHỐ 25'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: '(Ký tên, ghi rõ họ tên)',
            italics: true, size: 22, font: 'Times New Roman',
          })],
        }),
        emptyLine(),
        emptyLine(),
        emptyLine(),

        // ── Footer ───────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 480 },
          children:  [new TextRun({
            text: `KP25 Smart Community OS · Báo cáo tự động · ${ngayTao} · Phường Long Trường – TP.HCM`,
            size: 18, color: '94A3B8', font: 'Times New Roman',
          })],
        }),
      ],
    }],
  })

  const buf  = await Packer.toBuffer(doc)
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''Bao-cao-KP25-${date}.docx`,
      'Cache-Control': 'no-store',
    },
  })
}
