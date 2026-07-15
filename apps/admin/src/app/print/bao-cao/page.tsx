import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { layDuLieuBaoCao } from '@/app/dashboard/bao-cao/actions'
import PrintTrigger from './PrintTrigger'

export const metadata: Metadata = { title: `Báo cáo ${KHU_PHO.ma} — Bản in` }
export const revalidate = 0

export default async function InBaoCaoPage() {
  const data = await layDuLieuBaoCao()
  const { kpi, phanBoTo, phanBoGioiTinh, phanBoDoTuoi, phanBoCuTru,
          phanAnhTheoThang, phanAnhTheoLoai, phanAnhTheoTT,
          bhytTheoTT, hoNgheoTheoLoai, nctTheoSK } = data

  const now = new Date()
  const ngay = now.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  })
  const nam = parseInt(now.toLocaleDateString('vi-VN', { year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).replace(/\D/g, ''))

  return (
    <>
      <PrintTrigger />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.65;
          color: #111;
          background: #f0f0f0;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 20mm 20mm 28mm;
          background: #fff;
          margin: 0 auto;
        }
        /* --- Typography --- */
        .quoc-hieu  { text-align:center; font-weight:bold; font-size:12pt; text-transform:uppercase; }
        .tieu-ngu   { text-align:center; font-weight:bold; font-size:11pt; margin:2pt 0 3pt; }
        .don-vi     { text-align:center; font-weight:bold; font-size:12pt; color:#1E3A5F; margin:6pt 0 4pt; }
        .tieu-de    { text-align:center; font-weight:bold; font-size:15pt; text-transform:uppercase; margin:8pt 0 3pt; letter-spacing:.5pt; }
        .phu-de     { text-align:center; font-weight:bold; font-size:12pt; margin:0 0 3pt; }
        .italic-sub { text-align:center; font-style:italic; font-size:10.5pt; margin-bottom:6pt; }
        .noi-lap    { text-align:right; font-style:italic; font-size:11pt; margin:6pt 0 10pt; }
        p           { margin-bottom: 6pt; text-indent: 1.5em; }
        /* --- Section headings --- */
        .sec { font-weight:bold; font-size:13pt; color:#1E3A5F; margin:14pt 0 5pt;
               border-left:4pt solid #1E3A5F; padding-left:8pt; page-break-after:avoid; }
        .sub { font-weight:bold; font-size:11.5pt; margin:8pt 0 4pt; padding-left:12pt; }
        /* --- Tables --- */
        table { width:100%; border-collapse:collapse; margin:4pt 0 10pt; font-size:10.5pt; }
        th { background:#1E3A5F; color:#fff; font-weight:bold; text-align:center;
             padding:4pt 7pt; border:1pt solid #1E3A5F; }
        td { padding:3pt 7pt; border:1pt solid #C8D4E0; vertical-align:middle; }
        tr:nth-child(even) td { background:#f7fafd; }
        .tot { font-weight:bold; background:#e8f0fb !important; }
        .c  { text-align:center; }
        /* --- KPI grid --- */
        .kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:5pt; margin:8pt 0 12pt; }
        .kpi-c { border:1pt solid #CBD5E1; border-radius:4pt; padding:6pt 4pt; text-align:center; }
        .kv { font-size:16pt; font-weight:bold; color:#1E3A5F; display:block; }
        .kl { font-size:9pt; color:#555; display:block; margin-top:1pt; }
        /* --- Signature --- */
        .sign { display:flex; justify-content:space-around; margin:18pt 0 0; }
        .sc { width:44%; text-align:center; }
        .sc strong { font-size:11pt; display:block; margin-bottom:2pt; }
        .sc em { font-size:9.5pt; }
        .sh { height:44pt; }
        /* --- Divider --- */
        hr { border:none; border-top:1pt solid #D1D5DB; margin:10pt 0; }
        /* --- Footer --- */
        .ft { text-align:center; font-size:8.5pt; color:#999; border-top:1pt solid #E5E7EB;
              padding-top:5pt; margin-top:16pt; }
        /* --- Print button (screen only) --- */
        #print-btn {
          display:none; position:fixed; top:16px; right:16px; z-index:9999;
          background:#1E3A5F; color:#fff; border:none; border-radius:8px;
          padding:10px 20px; font-size:13px; cursor:pointer;
          box-shadow:0 4px 14px rgba(0,0,0,.25);
          align-items:center; gap:8px; font-family:sans-serif;
        }
        #print-btn:hover { background:#162d4a; }
        /* --- Print media --- */
        @media print {
          @page { size:A4; margin:0; }
          html, body { background:#fff; }
          .page { margin:0; padding:15mm 15mm 15mm 22mm; box-shadow:none; }
          .pb { page-break-before:always; }
          .nb { page-break-inside:avoid; }
          #print-btn { display:none !important; }
        }
        @media screen {
          .page { box-shadow:0 4px 24px rgba(0,0,0,.15); margin:20px auto 40px; border-radius:3px; }
        }
      `}</style>

      <button id="print-btn">🖨️ In / Xuất PDF</button>

      <div className="page">

        {/* ── Quốc hiệu ── */}
        <div className="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div className="tieu-ngu">Độc lập – Tự do – Hạnh phúc</div>
        <div style={{ textAlign: 'center', color: '#555', marginBottom: '4pt' }}>——————————</div>
        <div className="don-vi">KHU PHỐ 25 – PHƯỜNG LONG TRƯỜNG – TP.HCM</div>

        <div className="tieu-de">BÁO CÁO TỔNG HỢP</div>
        <div className="phu-de">Tình hình Dân cư, An sinh Xã hội và Phản ánh Hiện trường</div>
        <div className="italic-sub">{KHU_PHO.ten} – Phường Long Trường – TP.HCM – Năm {nam}</div>
        <div className="noi-lap">Long Trường, ngày {ngay}</div>
        <hr />

        {/* ── I. KPI ── */}
        <div className="sec">I. KẾT QUẢ CÁC CHỈ TIÊU CHÍNH</div>
        <div className="kpi nb">
          {([
            ['Tổng hộ dân',       kpi.tongHoDan.toLocaleString('vi-VN'),    'hộ'],
            ['Tổng nhân khẩu',    kpi.tongNhanKhau.toLocaleString('vi-VN'),  'người'],
            ['Phản ánh',          kpi.tongPhanAnh.toLocaleString('vi-VN'),   'vụ'],
            ['Tỷ lệ xử lý',       `${kpi.tyLeXuLyPA}%`,                      ''],
            ['Thẻ BHYT',          kpi.tongBHYT.toLocaleString('vi-VN'),      'thẻ'],
            ['Hộ nghèo/CNG',      kpi.tongHoNgheo.toLocaleString('vi-VN'),   'hộ'],
            ['Người cao tuổi',    kpi.tongNCT.toLocaleString('vi-VN'),       'người'],
            ['Thông báo',         kpi.tongThongBao.toLocaleString('vi-VN'),  'bản'],
          ] as [string, string, string][]).map(([lbl, val, unit], i) => (
            <div key={i} className="kpi-c">
              <span className="kv">{val}</span>
              <span className="kl">{lbl}{unit ? ` (${unit})` : ''}</span>
            </div>
          ))}
        </div>

        {/* ── II. Dân cư ── */}
        <div className="sec">II. TÌNH HÌNH DÂN CƯ</div>

        <div className="sub">1. Phân bổ hộ dân theo Tổ / Khu vực</div>
        <table className="nb">
          <thead><tr><th>Tổ / Khu vực</th><th>Số hộ</th><th>Nhân khẩu</th></tr></thead>
          <tbody>
            {phanBoTo.map((t, i) => <tr key={i}><td>{t.ten}</td><td className="c">{t.soHo}</td><td className="c">{t.soNguoi}</td></tr>)}
            <tr className="tot"><td>TỔNG CỘNG</td><td className="c">{phanBoTo.reduce((s,t)=>s+t.soHo,0)}</td><td className="c">{phanBoTo.reduce((s,t)=>s+t.soNguoi,0)}</td></tr>
          </tbody>
        </table>

        <div className="sub">2. Giới tính nhân khẩu</div>
        <table className="nb" style={{width:'60%'}}>
          <thead><tr><th>Giới tính</th><th>Số người</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanBoGioiTinh.map((g, i) => {
              const tot = phanBoGioiTinh.reduce((s,x)=>s+x.value,0)
              return <tr key={i}><td>{g.name}</td><td className="c">{g.value}</td><td className="c">{tot>0?`${Math.round(g.value/tot*100)}%`:'0%'}</td></tr>
            })}
          </tbody>
        </table>

        <div className="sub">3. Phân bổ theo nhóm độ tuổi</div>
        <table className="nb" style={{width:'55%'}}>
          <thead><tr><th>Nhóm tuổi</th><th>Số người</th></tr></thead>
          <tbody>{phanBoDoTuoi.map((d,i)=><tr key={i}><td>{d.nhom}</td><td className="c">{d.soNguoi}</td></tr>)}</tbody>
        </table>

        <div className="sub">4. Tình trạng cư trú</div>
        <table className="nb" style={{width:'60%'}}>
          <thead><tr><th>Tình trạng</th><th>Số hộ</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanBoCuTru.map((c,i)=>{
              const tot=phanBoCuTru.reduce((s,x)=>s+x.value,0)
              return <tr key={i}><td>{c.name}</td><td className="c">{c.value}</td><td className="c">{tot>0?`${Math.round(c.value/tot*100)}%`:'0%'}</td></tr>
            })}
          </tbody>
        </table>

        {/* ── III. Phản ánh ── */}
        <div className="sec pb">III. TÌNH HÌNH PHẢN ÁNH HIỆN TRƯỜNG</div>

        <div className="sub">1. Phản ánh theo tháng (12 tháng gần nhất)</div>
        <table>
          <thead><tr><th>Tháng</th><th>Mới tiếp nhận</th><th>Đang xử lý</th><th>Đã hoàn thành</th></tr></thead>
          <tbody>
            {phanAnhTheoThang.map((t,i)=><tr key={i}><td className="c">{t.thang}</td><td className="c">{t.moi}</td><td className="c">{t.dangXuLy}</td><td className="c">{t.daXuLy}</td></tr>)}
            <tr className="tot">
              <td>TỔNG CỘNG</td>
              <td className="c">{phanAnhTheoThang.reduce((s,t)=>s+t.moi,0)}</td>
              <td className="c">{phanAnhTheoThang.reduce((s,t)=>s+t.dangXuLy,0)}</td>
              <td className="c">{phanAnhTheoThang.reduce((s,t)=>s+t.daXuLy,0)}</td>
            </tr>
          </tbody>
        </table>

        <div className="sub">2. Phân loại theo nội dung</div>
        <table className="nb" style={{width:'70%'}}>
          <thead><tr><th>Loại phản ánh</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanAnhTheoLoai.map((l,i)=>{
              const tot=phanAnhTheoLoai.reduce((s,x)=>s+x.value,0)
              return <tr key={i}><td>{l.name}</td><td className="c">{l.value}</td><td className="c">{tot>0?`${Math.round(l.value/tot*100)}%`:'0%'}</td></tr>
            })}
          </tbody>
        </table>

        <div className="sub">3. Trạng thái xử lý</div>
        <table className="nb" style={{width:'65%'}}>
          <thead><tr><th>Trạng thái</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {phanAnhTheoTT.map((t,i)=>{
              const tot=phanAnhTheoTT.reduce((s,x)=>s+x.value,0)
              return <tr key={i}><td>{t.name}</td><td className="c">{t.value}</td><td className="c">{tot>0?`${Math.round(t.value/tot*100)}%`:'0%'}</td></tr>
            })}
          </tbody>
        </table>

        {/* ── IV. An sinh ── */}
        <div className="sec">IV. AN SINH XÃ HỘI</div>

        <div className="sub">1. Bảo hiểm Y tế</div>
        <table className="nb" style={{width:'65%'}}>
          <thead><tr><th>Trạng thái</th><th>Số lượng</th><th>Tỷ lệ</th></tr></thead>
          <tbody>
            {bhytTheoTT.map((b,i)=>{
              const tot=bhytTheoTT.reduce((s,x)=>s+x.value,0)
              return <tr key={i}><td>{b.name}</td><td className="c">{b.value}</td><td className="c">{tot>0?`${Math.round(b.value/tot*100)}%`:'0%'}</td></tr>
            })}
            <tr className="tot"><td>TỔNG</td><td className="c">{bhytTheoTT.reduce((s,b)=>s+b.value,0)}</td><td></td></tr>
          </tbody>
        </table>

        <div className="sub">2. Hộ nghèo và Cận nghèo</div>
        <table className="nb" style={{width:'55%'}}>
          <thead><tr><th>Phân loại</th><th>Số hộ</th></tr></thead>
          <tbody>
            {hoNgheoTheoLoai.map((h,i)=><tr key={i}><td>{h.name}</td><td className="c">{h.value}</td></tr>)}
            <tr className="tot"><td>TỔNG</td><td className="c">{hoNgheoTheoLoai.reduce((s,h)=>s+h.value,0)}</td></tr>
          </tbody>
        </table>

        <div className="sub">3. Sức khỏe Người cao tuổi</div>
        <table className="nb" style={{width:'60%'}}>
          <thead><tr><th>Tình trạng sức khỏe</th><th>Số người</th></tr></thead>
          <tbody>
            {nctTheoSK.map((n,i)=><tr key={i}><td>{n.name}</td><td className="c">{n.value}</td></tr>)}
            <tr className="tot"><td>TỔNG</td><td className="c">{nctTheoSK.reduce((s,n)=>s+n.value,0)}</td></tr>
          </tbody>
        </table>

        {/* ── V. Kết luận ── */}
        <div className="sec">V. KẾT LUẬN</div>
        <p>
          Trên cơ sở tổng hợp dữ liệu từ Hệ thống {KHU_PHO.ma} Smart Community OS, Ban điều hành {KHU_PHO.ten}
          đã nắm bắt đầy đủ tình hình dân cư, an sinh xã hội và xử lý kịp thời các phản ánh của người
          dân trong khu vực. Tỷ lệ xử lý phản ánh đạt <strong>{kpi.tyLeXuLyPA}%</strong>, thể hiện
          tinh thần trách nhiệm cao và hiệu quả trong công tác điều hành của Ban.
        </p>
        <p>
          Kính đề nghị các cấp lãnh đạo quan tâm, chỉ đạo để công tác số hóa và quản lý địa bàn
          ngày càng được nâng cao, phục vụ tốt hơn nhu cầu của nhân dân trong khu phố.
        </p>

        {/* ── Ký tên ── */}
        <div className="sign">
          <div className="sc">
            <strong>NGƯỜI LẬP BÁO CÁO</strong>
            <em>(Ký tên, ghi rõ họ tên)</em>
            <div className="sh" />
          </div>
          <div className="sc">
            <strong>TRƯỞNG KHU PHỐ 25</strong>
            <em>(Ký tên, đóng dấu)</em>
            <div className="sh" />
          </div>
        </div>

        <div className="ft">
          {KHU_PHO.ma} Smart Community OS · Báo cáo tự động · {ngay} · {KHU_PHO.ten} – Phường Long Trường – TP.HCM
        </div>
      </div>
    </>
  )
}
