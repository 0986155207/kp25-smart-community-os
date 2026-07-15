import { KHU_PHO } from '@/lib/khu-pho'
// ─── Orchestration: Thông báo kết quả xử lý đến người dân & admin ──
import { createServiceClient } from '@/lib/supabase/server'
import { guiEmail }            from './email'
import { guiSms }              from './sms'

// ─── Escape HTML ──────────────────────────────────────────────
function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const TRANG_THAI_LABEL: Record<string, string> = {
  DA_XU_LY: 'ĐÃ XỬ LÝ XONG',
  DONG:      'ĐÃ ĐÓNG',
}

// ─── HTML email kết quả cho admin ─────────────────────────────
function taoHtmlKetQua(opts: {
  tieuDe:     string
  trangThai:  string
  ketQua:     string
  nguoiGui:   string
  phanAnhId:  string
}): string {
  const adminUrl  = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
  const detailUrl = `${adminUrl}/dashboard/phan-anh/${opts.phanAnhId}`
  const label     = TRANG_THAI_LABEL[opts.trangThai] ?? opts.trangThai
  const thoiGian  = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;
         box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1E3A5F 0%,#2d5986 100%);
               padding:28px 24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
        <tr>
          <td style="background:#8B1A1A;padding:6px 18px;border-radius:8px;">
            <span style="color:#fff;font-weight:900;font-size:20px;letter-spacing:3px;">KP 25</span>
          </td>
        </tr>
      </table>
      <p style="color:#fff;margin:0;font-size:17px;font-weight:700;">${KHU_PHO.ten} – Phường Long Trường</p>
    </td>
  </tr>

  <!-- Status bar -->
  <tr>
    <td style="background:#dcfce7;border-left:5px solid #22c55e;padding:14px 24px;">
      <p style="margin:0;font-weight:700;color:#15803d;font-size:15px;">
        ✅&nbsp; PHẢN ÁNH ĐÃ ĐƯỢC ${esc(label)}
      </p>
    </td>
  </tr>

  <!-- Content -->
  <tr>
    <td style="padding:24px;">
      <h2 style="margin:0 0 16px;font-size:17px;color:#0f172a;">${esc(opts.tieuDe)}</h2>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
               overflow:hidden;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 16px;width:130px;font-size:12px;font-weight:600;color:#64748b;">👤 Người phản ánh</td>
          <td style="padding:10px 16px;font-size:14px;color:#1e293b;">${esc(opts.nguoiGui)}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9;">
          <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;">⏰ Thời gian xử lý</td>
          <td style="padding:10px 16px;font-size:14px;color:#1e293b;">${thoiGian}</td>
        </tr>
      </table>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                  padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#15803d;
                  text-transform:uppercase;letter-spacing:1px;">Kết quả xử lý</p>
        <p style="margin:0;font-size:14px;color:#14532d;line-height:1.7;">${esc(opts.ketQua || 'Không có ghi chú')}</p>
      </div>

      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background:#1E3A5F;border-radius:8px;">
            <a href="${detailUrl}"
               style="display:inline-block;padding:11px 28px;color:#fff;
                      font-weight:700;font-size:14px;text-decoration:none;">
              Xem chi tiết →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        ${KHU_PHO.ma} Smart Community OS · ${KHU_PHO.ten}, Phường Long Trường, TP.HCM<br>
        Email tự động — Vui lòng không phản hồi email này
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── Hàm chính: gửi thông báo kết quả xử lý ─────────────────
export async function thongBaoKetQuaXuLy(
  phanAnhId:  string,
  trangThai:  string,
  ketQuaXuLy: string
): Promise<void> {
  if (!['DA_XU_LY', 'DONG'].includes(trangThai)) return

  const svc = createServiceClient()

  // Lấy thông tin phản ánh
  const { data: pa, error } = await svc
    .from('phan_anh')
    .select('id, tieu_de, nguoi_gui_ten, nguoi_gui_sdt')
    .eq('id', phanAnhId)
    .single()

  if (error || !pa) {
    console.error('[thongBaoKetQuaXuLy] Không lấy được phản ánh:', error?.message)
    return
  }

  const tieuDe30   = (pa.tieu_de ?? '').slice(0, 30)
  const ketQua50   = ketQuaXuLy.slice(0, 50)
  const nguoiGui   = [pa.nguoi_gui_ten, pa.nguoi_gui_sdt].filter(Boolean).join(' — ') || 'Không rõ'

  // ── 1. Gửi SMS đến người dân ─────────────────────────────────
  if (pa.nguoi_gui_sdt) {
    const smsTxt = `[${KHU_PHO.ma}] Phan anh "${tieuDe30}..." cua ban da duoc xu ly. ${ketQua50}... Cam on ban da phan anh den Khu Pho 25!`.slice(0, 155)
    await guiSms(pa.nguoi_gui_sdt, smsTxt)
  }

  // ── 2. Gửi email tóm tắt đến admin ───────────────────────────
  const adminEmail = process.env.NOTIFICATION_ADMIN_EMAIL ?? ''
  const extraEmails = adminEmail.split(',').map(e => e.trim()).filter(e => e.includes('@'))

  if (extraEmails.length > 0) {
    const label = TRANG_THAI_LABEL[trangThai] ?? trangThai
    await guiEmail({
      to:      extraEmails,
      subject: `[${KHU_PHO.ma}] ${label}: ${pa.tieu_de}`,
      html:    taoHtmlKetQua({
        tieuDe:    pa.tieu_de,
        trangThai,
        ketQua:    ketQuaXuLy,
        nguoiGui,
        phanAnhId: pa.id,
      }),
    })
  }

  console.log(`[thongBaoKetQuaXuLy] ${trangThai} — SMS: ${pa.nguoi_gui_sdt ?? 'không có'}, email: ${extraEmails.length}`)
}
