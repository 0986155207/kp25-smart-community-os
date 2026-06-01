'use client'

import { Printer, QrCode, FileText, Download, ExternalLink, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const WEB_URL  = 'https://smart-kp25-web.vercel.app'
const FORM_URL = `${WEB_URL}/dang-ky/ho-moi`
const QR_IMG   = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=16&data=${encodeURIComponent(FORM_URL)}`

export default function PhieuKeKhaiClient() {
  async function taiQR() {
    try {
      const res = await fetch(QR_IMG)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'QR-ke-khai-ho-dan-KP25.png'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Không tải được QR') }
  }

  function inBo() {
    const w = window.open('', '_blank', 'width=820,height=1000')
    if (!w) { toast.error('Trình duyệt chặn cửa sổ in. Vui lòng cho phép pop-up.'); return }
    w.document.write(PRINT_HTML)
    w.document.close()
  }

  return (
    <div className="space-y-5">
      {/* Hướng dẫn */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Quy trình thu thập dữ liệu tận hộ:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>In bộ tài liệu (Thư ngỏ + QR + Phiếu kê khai giấy)</li>
            <li>Cán bộ/tổ trưởng phát trực tiếp cho từng hộ</li>
            <li>Hộ kê khai: quét QR điền online (nhanh) hoặc điền phiếu giấy</li>
            <li>Dữ liệu online vào hàng chờ → cán bộ duyệt (tự phát hiện trùng) → lưu chính thức</li>
            <li>Phiếu giấy: nhập qua "Nhập từ Excel" hoặc gõ vào hệ thống</li>
          </ol>
        </div>
      </div>

      {/* Preview kit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-xl p-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
            <FileText size={22} className="text-[#8B1A1A]" />
          </div>
          <p className="font-bold text-slate-800 text-sm">Trang 1 — Thư ngỏ + QR</p>
          <p className="text-xs text-slate-500 mt-1">Thư mời kê khai + mã QR điền online</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <FileText size={22} className="text-blue-600" />
          </div>
          <p className="font-bold text-slate-800 text-sm">Trang 2-3 — Phiếu kê khai</p>
          <p className="text-xs text-slate-500 mt-1">Đầy đủ trường hộ + nhân khẩu để viết tay</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
            <QrCode size={22} className="text-emerald-600" />
          </div>
          <p className="font-bold text-slate-800 text-sm">Mã QR kê khai online</p>
          <p className="text-xs text-slate-500 mt-1">Dùng chung — quét điền tại điện thoại</p>
        </div>
      </div>

      {/* QR preview + actions */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={QR_IMG} alt="QR kê khai" className="w-40 h-40 rounded-xl border border-slate-200 bg-white p-2" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-slate-800">Mã QR kê khai hộ dân</p>
          <p className="text-xs text-slate-500 mt-1 break-all">{FORM_URL}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <button onClick={inBo} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-colors">
              <Printer size={15} /> In bộ tài liệu
            </button>
            <button onClick={taiQR} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              <Download size={15} /> Tải QR
            </button>
            <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              <ExternalLink size={15} /> Xem form
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── HTML in A4 ──────────────────────────────────────────────
const PRINT_HTML = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/>
<title>Phiếu kê khai hộ dân — Khu phố 25</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Times New Roman', serif; color:#000; font-size:13px; line-height:1.5; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .center { text-align:center; }
  .right { text-align:right; }
  .bold { font-weight:bold; }
  .qd { font-size:13px; }
  .qd .quocngu { font-weight:bold; text-transform:uppercase; font-size:13px; }
  .qd .tieude { font-weight:bold; font-size:13px; }
  hr.dim { width:140px; border:none; border-top:1px solid #000; margin:2px auto 10px; }
  h1 { text-align:center; font-size:17px; font-weight:bold; text-transform:uppercase; margin:16px 0 4px; }
  .sub { text-align:center; font-style:italic; font-size:12px; margin-bottom:14px; }
  p { margin:6px 0; text-align:justify; }
  .qrbox { text-align:center; margin:18px 0; }
  .qrbox img { width:200px; height:200px; border:1px solid #ccc; padding:6px; }
  .qrbox .url { font-size:11px; color:#333; margin-top:6px; word-break:break-all; }
  .qrbox .note { font-size:12px; margin-top:4px; }
  .sign { display:flex; justify-content:flex-end; margin-top:24px; }
  .sign .box { text-align:center; width:240px; }
  .sign .role { font-weight:bold; }
  .sign .hint { font-style:italic; font-size:11px; }
  .sign .space { height:60px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th, td { border:1px solid #000; padding:4px 5px; font-size:11px; vertical-align:top; }
  th { background:#f0f0f0; text-align:center; font-weight:bold; }
  .field { margin:7px 0; }
  .field .lbl { font-weight:bold; }
  .line { display:inline-block; border-bottom:1px dotted #000; min-width:60px; }
  .checkbox { display:inline-block; width:12px; height:12px; border:1px solid #000; margin:0 3px; vertical-align:middle; }
  .small { font-size:11px; color:#333; font-style:italic; }
</style></head><body>

<!-- TRANG 1: THƯ NGỎ + QR -->
<div class="page">
  <table style="border:none; width:100%; margin-bottom:8px;">
    <tr style="border:none;">
      <td style="border:none; width:45%; text-align:center; vertical-align:top;">
        <div class="bold" style="text-transform:uppercase;">Ban quản lý Khu phố 25</div>
        <div>Phường Long Trường</div>
        <hr class="dim" style="width:120px;"/>
      </td>
      <td style="border:none; width:55%; text-align:center; vertical-align:top;">
        <div class="quocngu">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
        <div class="tieude">Độc lập - Tự do - Hạnh phúc</div>
        <hr class="dim"/>
      </td>
    </tr>
  </table>

  <h1>Thư ngỏ</h1>
  <div class="sub">V/v cập nhật, hoàn thiện dữ liệu dân cư số Khu phố 25</div>

  <p><b>Kính gửi:</b> Quý hộ gia đình đang cư trú tại Khu phố 25, Phường Long Trường, TP. Hồ Chí Minh.</p>

  <p>Nhằm xây dựng hệ thống dữ liệu dân cư số chính xác, phục vụ tốt hơn công tác an sinh xã hội, thông báo khẩn cấp và các dịch vụ hành chính cho bà con, Ban quản lý Khu phố 25 trân trọng kính mời quý hộ gia đình phối hợp <b>kê khai, cập nhật thông tin hộ và các thành viên</b>.</p>

  <p style="background:#f5f5f5; border:1px solid #999; padding:7px 10px;"><b>Phiếu này dành cho TẤT CẢ các hộ gia đình:</b> dù quý hộ <b>đã có thông tin trong hệ thống</b> (kê khai để bổ sung, cập nhật phần còn thiếu) hay là <b>hộ mới chuyển đến</b> chưa có hồ sơ. Cán bộ sẽ tự động đối chiếu và gộp dữ liệu, <b>không tạo trùng lặp</b>.</p>

  <p><b>Quý hộ có thể kê khai theo một trong hai cách:</b></p>
  <p style="margin-left:14px;">
    <b>Cách 1 (khuyến khích):</b> Dùng điện thoại quét mã QR bên dưới để điền trực tuyến — nhanh chóng, chỉ mất khoảng 3-5 phút.<br/>
    <b>Cách 2:</b> Điền vào Phiếu kê khai giấy đính kèm và gửi lại cho cán bộ/tổ trưởng khu phố.
  </p>

  <div class="qrbox">
    <img src="${QR_IMG}" alt="QR kê khai"/>
    <div class="note"><b>Quét mã QR để kê khai trực tuyến</b></div>
    <div class="url">${FORM_URL}</div>
  </div>

  <p>Thông tin của quý hộ được <b>bảo mật tuyệt đối</b> theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, chỉ phục vụ công tác quản lý của khu phố và chính quyền địa phương.</p>

  <p>Rất mong nhận được sự hợp tác của quý hộ gia đình. Mọi thắc mắc xin liên hệ Trưởng khu phố: <b>0773 735 317</b>.</p>

  <p class="right" style="font-style:italic; margin-top:14px;">Khu phố 25, ngày ...... tháng ...... năm 20......</p>

  <div class="sign">
    <div class="box">
      <div class="role">TM. BAN QUẢN LÝ KHU PHỐ 25</div>
      <div class="hint">(Ký, ghi rõ họ tên)</div>
      <div class="space"></div>
    </div>
  </div>
</div>

<!-- TRANG 2: PHIẾU KÊ KHAI -->
<div class="page">
  <h1 style="margin-top:0;">Phiếu kê khai thông tin hộ dân</h1>
  <div class="sub">Khu phố 25 - Phường Long Trường - TP. Hồ Chí Minh</div>

  <div style="border:1px solid #000; padding:8px; margin-bottom:10px;">
    <div class="bold" style="margin-bottom:4px;">A. THÔNG TIN HỘ</div>
    <div class="field"><span class="lbl">1. Họ tên chủ hộ:</span> <span class="line" style="min-width:300px;"></span></div>
    <div class="field"><span class="lbl">2. Số nhà:</span> <span class="line" style="min-width:90px;"></span>
      &nbsp;&nbsp;<span class="lbl">Đường/Hẻm:</span> <span class="line" style="min-width:140px;"></span>
      &nbsp;&nbsp;<span class="lbl">Tổ/Khu vực:</span> <span class="line" style="min-width:90px;"></span></div>
    <div class="field"><span class="lbl">3. Địa chỉ đầy đủ:</span> <span class="line" style="min-width:380px;"></span></div>
    <div class="field"><span class="lbl">4. Số điện thoại chủ hộ:</span> <span class="line" style="min-width:160px;"></span></div>
    <div class="field"><span class="lbl">5. Hình thức cư trú:</span>
      <span class="checkbox"></span> Thường trú &nbsp;&nbsp;
      <span class="checkbox"></span> Tạm trú</div>
    <div class="field"><span class="lbl">6. Số sổ hộ khẩu / Mã định danh cư trú:</span> <span class="line" style="min-width:200px;"></span></div>
  </div>

  <div class="bold" style="margin:8px 0 4px;">B. DANH SÁCH THÀNH VIÊN TRONG HỘ</div>
  <table>
    <thead>
      <tr>
        <th style="width:22px;">TT</th>
        <th>Họ và tên</th>
        <th style="width:62px;">Ngày sinh</th>
        <th style="width:38px;">Giới tính</th>
        <th style="width:90px;">Số CCCD</th>
        <th style="width:70px;">Quan hệ chủ hộ</th>
        <th>Nghề nghiệp</th>
        <th style="width:50px;">Dân tộc</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 8 }).map((_, i) => `<tr>
        <td class="center">${i + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p class="small">Ghi chú: Khai đầy đủ tất cả thành viên đang sinh sống trong hộ. Nếu cần thêm dòng, ghi tiếp ra mặt sau.</p>

  <div class="bold" style="margin:10px 0 4px;">C. THÔNG TIN BỔ SUNG (nếu có)</div>
  <div class="field small">Nguyên quán, tôn giáo, tình trạng hôn nhân, ngày cấp CCCD, nơi làm việc... có thể kê khai chi tiết khi điền online qua mã QR.</div>
  <div class="field"><span class="lbl">Ghi chú thêm:</span> <span class="line" style="min-width:420px;"></span></div>

  <table style="border:none; margin-top:20px;">
    <tr style="border:none;">
      <td style="border:none; width:50%; text-align:center;">
        <div class="small">Cán bộ/Tổ trưởng tiếp nhận</div>
        <div class="hint" style="font-style:italic;">(Ký, ghi rõ họ tên)</div>
      </td>
      <td style="border:none; width:50%; text-align:center;">
        <div class="small">Chủ hộ kê khai</div>
        <div class="hint" style="font-style:italic;">(Ký, ghi rõ họ tên)</div>
      </td>
    </tr>
  </table>
</div>

<script>window.onload=()=>{setTimeout(()=>{window.print()},300)}<\/script>
</body></html>`
