import type { Metadata } from 'next'
import { layDuLieuBaoCao } from '../actions'
import PrintTrigger from './PrintTrigger'

export const metadata: Metadata = { title: 'In báo cáo — KP25' }
export const revalidate = 0

export default async function InBaoCaoPage() {
  const data = await layDuLieuBaoCao()
  const { kpi, phanBoTo, phanBoGioiTinh, phanBoDoTuoi, phanBoCuTru,
          phanAnhTheoThang, phanAnhTheoLoai, phanAnhTheoTT,
          bhytTheoTT, hoNgheoTheoLoai, nctTheoSK } = data

  const ngay = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const nam = new Date().getFullYear()

  return (
    <>
      <PrintTrigger />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 25mm 20mm 25mm 30mm;
        }

        h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 8pt 0 4pt; }
        h2 { font-size: 14pt; font-weight: bold; text-align: center; margin: 6pt 0 4pt; }
        h3 { font-size: 13pt; font-weight: bold; margin: 10pt 0 4pt; color: #1E3A5F; border-left: 4pt solid #1E3A5F; padding-left: 8pt; }
        h4 { font-size: 12pt; font-weight: bold; margin: 8pt 0 3pt; padding-left: 12pt; }

        .quoc-hieu  { text-align: center; font-weight: bold; font-size: 13pt; text-transform: uppercase; margin-bottom: 2pt; }
        .tieu-ngu   { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 4pt; }
        .don-vi     { text-align: center; font-weight: bold; font-size: 13pt; color: #1E3A5F; margin-bottom: 8pt; }
        .noi-lap    { text-align: right; font-style: italic; font-size: 11pt; margin: 8pt 0; }
        .subtitle   { text-align: center; font-size: 13pt; margin: 3pt 0; }
        .italic-sub { text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 8pt; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 6pt 0 10pt;
          font-size: 11pt;
        }
        th {
          background: #1E3A5F;
          color: #fff;
          font-weight: bold;
          text-align: center;
          padding: 5pt 8pt;
          border: 1pt solid #1E3A5F;
          font-size: 11pt;
        }
        td {
          padding: 4pt 8pt;
          border: 1pt solid #CBD5E1;
          vertical-align: top;
        }
        tr:nth-child(even) td { background: #F8FAFC; }
        .total-row td { font-weight: bold; background: #EFF6FF !important; }
        .center  { text-align: center; }
        .right   { text-align: right; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6pt;
          margin: 8pt 0 12pt;
        }
        .kpi-card {
          border: 1pt solid #CBD5E1;
          border-radius: 4pt;
          padding: 8pt;
          text-align: center;
        }
        .kpi-val { font-size: 20pt; font-weight: bold; color: #1E3A5F; display: block; }
        .kpi-lbl { font-size: 10pt; color: #475569; display: block; margin-top: 2pt; }

        .sign-row {
          display: flex;
          justify-content: space-around;
          margin: 20pt 0 0;
          text-align: center;
        }
        .sign-col { width: 45%; }
        .sign-col p { font-weight: bold; margin-bottom: 2pt; }
        .sign-col small { font-style: italic; font-size: 10pt; }
        .sign-space { height: 50pt; }

        .divider {
          border: none;
          border-top: 1pt solid #CBD5E1;
          margin: 12pt 0;
        }

        .footer {
          text-align: center;
          font-size: 9pt;
          color: #94A3B8;
          border-top: 1pt solid #E2E8F0;
          padding-top: 6pt;
          margin-top: 20pt;
        }

        .no-print { display: none !important; }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body { background: #fff; }
          .page {
            width: 210mm;
            margin: 0;
            padding: 15mm 15mm 15mm 20mm;
          }
          .page-break { page-break-before: always; }
          .no-break    { page-break-inside: avoid; }
        }

        @media screen {
          body { background: #E2E8F0; }
          .page {
            box-shadow: 0 4px 24px rgba(0,0,0,.15);
            margin: 20px auto;
            border-radius: 4px;
          }
          .print-btn {
            display: block !important;
            position: fixed;
            top: 20px; right: 20px;
            background: #1E3A5F;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,.2);
            z-index: 999;
          }
        }
      `}</style>

      {/* Nút in — chỉ hiển thị khi xem trên màn hình */}
      <button className="print-btn" onClick={undefined} id="print-btn"
        style={{ display: 'none' }}>
        🖨️ In / Xuất PDF
      </button>

      <div className="page">

        {/* ── Quốc hiệu ─────────────────────────────────────── */}
        <div className="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div className="tieu-ngu">Độc lập – Tự do – Hạnh phúc</div>
        <div style={{ textAlign: 'center', marginBottom: '6pt' }}>──────────────────────────</div>
        <div className="don-vi">KHU PHỐ 25 – PHƯỜNG LONG TRƯỜNG – TP.HCM</div>

        <h1>BÁO CÁO TỔNG HỢP</h1>
        <h2>Tình hình Dân cư, An sinh Xã hội và Phản ánh Hiện trường</h2>
        <div className="subtitle">Khu phố 25 – Phường Long Trường – TP.HCM – Năm {nam}</div>
        <div className="noi-lap">Long Trường, ngày {ngay}</div>

        <hr className="divider" />

        {/* ── KPI ──────────────────────────────────────────── */}
        <h3>I. KẾT QUẢ CÁC CHỈ TIÊU CHÍNH</h3>

        <div className="kpi-grid">
          {[
            { label: 'Tổng hộ dân',       val: kpi.tongHoDan.toLocaleString('vi-VN'),    unit: 'hộ'     },
            { label: 'Tổng nhân khẩu',    val: kpi.tongNhanKhau.toLocaleString('vi-VN'),  unit: 'người'  },
            { label: 'Phản ánh',          val: kpi.tongPhanAnh.toLocaleString('vi-VN'),   unit: 'vụ'     },
            { label: 'Tỷ lệ xử lý',       val: `${kpi.tyLeXuLyPA}%`,                      unit: ''       },
            { label: 'Thẻ BHYT',          val: kpi.tongBHYT.toLocaleString('vi-VN'),      unit: 'thẻ'    },
            { label: 'Hộ nghèo/CNG',      val: kpi.tongHoNgheo.toLocaleString('vi-VN'),   unit: 'hộ'     },
            { label: 'Người cao tuổi',    val: kpi.tongNCT.toLocaleString('vi-VN'),       unit: 'người'  },
            { label: 'Thông báo',         val: kpi.tongThongBao.toLocaleString('vi-VN'),  unit: 'bản'    },
          ].map((k, i) => (
            <div key={i} className="kpi-card">
              <span className="kpi-val">{k.val}</span>
              <span className="kpi-lbl">{k.label}{k.unit ? ` (${k.unit})` : ''}</span>
            </div>
          ))}
        </div>

        {/* ── Dân cư ───────────────────────────────────────── */}
        <h3>II. TÌNH HÌNH DÂN CƯ</h3>

        <h4>1. Phân bổ hộ dân theo Tổ / Khu vực</h4>
        <table className="no-break">
          <thead>
            <tr><th>Tổ / Khu vực</th><th>Số hộ</th><th>Nhân khẩu</th></tr>
          </thead>
          <tbody>
            {phanBoTo.map((t, i) => (
              <tr key={i}><td>{t.ten}</td><td className="center">{t.soHo}</td><td className="center">{t.soNguoi}</td></tr>
            ))}
            <tr className="total-row">
              <td>TỔNG CỘNG</td>
              <td className="center">{phanBoTo.reduce((s, t) => s + t.soHo, 0)}</td>
              <td className="center">{phanBoTo.reduce((s, t) => s + t.soNguoi, 0)}</td>
            </tr>
          </tbody>
        </table>

        <h4>2. Phân bổ giới tính nhân khẩu</h4>
        <table className="no-break">
          <thead><tr><th>Giới tính</th><th>Số người</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanBoGioiTinh.map((g, i) => {
              const total = phanBoGioiTinh.reduce((s, x) => s + x.value, 0)
              return <tr key={i}><td>{g.name}</td><td className="center">{g.value}</td><td className="center">{total > 0 ? `${Math.round(g.value / total * 100)}%` : '0%'}</td></tr>
            })}
          </tbody>
        </table>

        <h4>3. Phân bổ theo nhóm độ tuổi</h4>
        <table className="no-break">
          <thead><tr><th>Nhóm tuổi</th><th>Số người</th></tr></thead>
          <tbody>
            {phanBoDoTuoi.map((d, i) => (
              <tr key={i}><td>{d.nhom}</td><td className="center">{d.soNguoi}</td></tr>
            ))}
          </tbody>
        </table>

        <h4>4. Tình trạng cư trú</h4>
        <table className="no-break">
          <thead><tr><th>Tình trạng</th><th>Số hộ</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanBoCuTru.map((c, i) => {
              const total = phanBoCuTru.reduce((s, x) => s + x.value, 0)
              return <tr key={i}><td>{c.name}</td><td className="center">{c.value}</td><td className="center">{total > 0 ? `${Math.round(c.value / total * 100)}%` : '0%'}</td></tr>
            })}
          </tbody>
        </table>

        {/* ── Phản ánh ─────────────────────────────────────── */}
        <div className="page-break" />
        <h3>III. TÌNH HÌNH PHẢN ÁNH HIỆN TRƯỜNG</h3>

        <h4>1. Phản ánh theo tháng (12 tháng gần nhất)</h4>
        <table>
          <thead><tr><th>Tháng</th><th>Mới tiếp nhận</th><th>Đang xử lý</th><th>Đã hoàn thành</th></tr></thead>
          <tbody>
            {phanAnhTheoThang.map((t, i) => (
              <tr key={i}><td className="center">{t.thang}</td><td className="center">{t.moi}</td><td className="center">{t.dangXuLy}</td><td className="center">{t.daXuLy}</td></tr>
            ))}
            <tr className="total-row">
              <td>TỔNG CỘNG</td>
              <td className="center">{phanAnhTheoThang.reduce((s, t) => s + t.moi, 0)}</td>
              <td className="center">{phanAnhTheoThang.reduce((s, t) => s + t.dangXuLy, 0)}</td>
              <td className="center">{phanAnhTheoThang.reduce((s, t) => s + t.daXuLy, 0)}</td>
            </tr>
          </tbody>
        </table>

        <h4>2. Phân loại phản ánh theo nội dung</h4>
        <table className="no-break">
          <thead><tr><th>Loại phản ánh</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanAnhTheoLoai.map((l, i) => {
              const total = phanAnhTheoLoai.reduce((s, x) => s + x.value, 0)
              return <tr key={i}><td>{l.name}</td><td className="center">{l.value}</td><td className="center">{total > 0 ? `${Math.round(l.value / total * 100)}%` : '0%'}</td></tr>
            })}
          </tbody>
        </table>

        <h4>3. Trạng thái xử lý</h4>
        <table className="no-break">
          <thead><tr><th>Trạng thái</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanAnhTheoTT.map((t, i) => {
              const total = phanAnhTheoTT.reduce((s, x) => s + x.value, 0)
              return <tr key={i}><td>{t.name}</td><td className="center">{t.value}</td><td className="center">{total > 0 ? `${Math.round(t.value / total * 100)}%` : '0%'}</td></tr>
            })}
          </tbody>
        </table>

        {/* ── An sinh ──────────────────────────────────────── */}
        <h3>IV. AN SINH XÃ HỘI</h3>

        <h4>1. Bảo hiểm Y tế</h4>
        <table className="no-break">
          <thead><tr><th>Trạng thái</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {bhytTheoTT.map((b, i) => {
              const total = bhytTheoTT.reduce((s, x) => s + x.value, 0)
              return <tr key={i}><td>{b.name}</td><td className="center">{b.value}</td><td className="center">{total > 0 ? `${Math.round(b.value / total * 100)}%` : '0%'}</td></tr>
            })}
            <tr className="total-row"><td>TỔNG</td><td className="center">{bhytTheoTT.reduce((s, b) => s + b.value, 0)}</td><td></td></tr>
          </tbody>
        </table>

        <h4>2. Hộ nghèo và Cận nghèo</h4>
        <table className="no-break">
          <thead><tr><th>Phân loại</th><th>Số hộ</th></tr></thead>
          <tbody>
            {hoNgheoTheoLoai.map((h, i) => (
              <tr key={i}><td>{h.name}</td><td className="center">{h.value}</td></tr>
            ))}
            <tr className="total-row"><td>TỔNG</td><td className="center">{hoNgheoTheoLoai.reduce((s, h) => s + h.value, 0)}</td></tr>
          </tbody>
        </table>

        <h4>3. Sức khỏe Người cao tuổi</h4>
        <table className="no-break">
          <thead><tr><th>Tình trạng sức khỏe</th><th>Số người</th></tr></thead>
          <tbody>
            {nctTheoSK.map((n, i) => (
              <tr key={i}><td>{n.name}</td><td className="center">{n.value}</td></tr>
            ))}
            <tr className="total-row"><td>TỔNG</td><td className="center">{nctTheoSK.reduce((s, n) => s + n.value, 0)}</td></tr>
          </tbody>
        </table>

        {/* ── Kết luận ─────────────────────────────────────── */}
        <h3>V. KẾT LUẬN</h3>
        <p style={{ textIndent: '1.5em', marginBottom: '6pt' }}>
          Trên cơ sở tổng hợp dữ liệu từ Hệ thống KP25 Smart Community OS, Ban điều hành Khu phố 25
          đã nắm bắt đầy đủ tình hình dân cư, an sinh xã hội và xử lý kịp thời các phản ánh của người
          dân trong khu vực. Tỷ lệ xử lý phản ánh đạt <strong>{kpi.tyLeXuLyPA}%</strong>, thể hiện
          tinh thần trách nhiệm và hiệu quả trong công tác điều hành.
        </p>
        <p style={{ textIndent: '1.5em' }}>
          Kính đề nghị các cấp lãnh đạo quan tâm, chỉ đạo để công tác số hóa và quản lý địa bàn
          ngày càng được nâng cao, phục vụ tốt hơn nhu cầu của nhân dân trong khu phố.
        </p>

        {/* ── Ký tên ───────────────────────────────────────── */}
        <div className="sign-row">
          <div className="sign-col">
            <p>NGƯỜI LẬP BÁO CÁO</p>
            <small>(Ký tên, ghi rõ họ tên)</small>
            <div className="sign-space" />
          </div>
          <div className="sign-col">
            <p>TRƯỞNG KHU PHỐ 25</p>
            <small>(Ký tên, đóng dấu)</small>
            <div className="sign-space" />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="footer">
          KP25 Smart Community OS · Báo cáo tự động · {ngay} · Khu phố 25 – Phường Long Trường – TP.HCM
        </div>
      </div>
    </>
  )
}
