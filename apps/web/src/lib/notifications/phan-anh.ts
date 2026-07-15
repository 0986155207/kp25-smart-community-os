import { KHU_PHO } from '@/lib/khu-pho'
// ─── Orchestration: Thông báo phản ánh mới đến cán bộ & admin ─
import { createServiceClient } from '@/lib/supabase/server'
import { guiEmail }            from './email'
import { guiSmsNhieu }         from './sms'

// ─── Label maps ───────────────────────────────────────────────
const LOAI_LABEL: Record<string, string> = {
  AN_NINH:    'An ninh',
  MOI_TRUONG: 'Moi truong',
  HA_TANG:    'Ha tang co so',
  AN_SINH:    'An sinh xa hoi',
  GIAO_THONG: 'Giao thong',
  KHAC:       'Khac',
}

const LOAI_LABEL_VI: Record<string, string> = {
  AN_NINH:    'An ninh',
  MOI_TRUONG: 'Môi trường',
  HA_TANG:    'Hạ tầng',
  AN_SINH:    'An sinh',
  GIAO_THONG: 'Giao thông',
  KHAC:       'Khác',
}

const MUC_DO_LABEL: Record<string, string> = {
  KHAN_CAP:   'KHAN CAP',
  CAO:        'CAO',
  TRUNG_BINH: 'TRUNG BINH',
  THAP:       'THAP',
}

const MUC_DO_LABEL_VI: Record<string, string> = {
  KHAN_CAP:   'KHẨN CẤP',
  CAO:        'CAO',
  TRUNG_BINH: 'TRUNG BÌNH',
  THAP:       'THẤP',
}

// ─── Routing cán bộ theo loại phản ánh ────────────────────────
function getVaiTroByLoai(loai: string): string[] {
  switch (loai) {
    case 'AN_NINH':
      return ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH']
    case 'AN_SINH':
      return ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT']
    default:
      return ['BI_THU', 'TRUONG_KHU_PHO']
  }
}

// ─── Màu theo mức độ ưu tiên (dùng trong email HTML) ──────────
function getMucDoColors(mucDo: string) {
  switch (mucDo) {
    case 'KHAN_CAP': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' }
    case 'CAO':      return { bg: '#ffedd5', border: '#f97316', text: '#9a3412' }
    case 'TRUNG_BINH': return { bg: '#fefce8', border: '#eab308', text: '#713f12' }
    default:         return { bg: '#f8fafc', border: '#94a3b8', text: '#475569' }
  }
}

// ─── Escape HTML an toàn ──────────────────────────────────────
function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ─── Row trong bảng thông tin email ───────────────────────────
function infoRow(label: string, value: string): string {
  return `
  <tr style="border-top:1px solid #f1f5f9;">
    <td style="padding:10px 16px;width:130px;font-size:12px;font-weight:600;
               color:#64748b;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:10px 16px;font-size:14px;color:#1e293b;">${value}</td>
  </tr>`
}

// ─── Tạo nội dung HTML email phản ánh mới ─────────────────────
interface PhanAnhRow {
  id: string
  tieu_de: string
  mo_ta: string
  loai: string
  muc_do: string
  dia_chi_phan_anh: string | null
  nguoi_gui_ten: string | null
  nguoi_gui_sdt: string | null
  created_at: string
}

interface CanBoRow {
  ho_ten: string
  email: string
  so_dien_thoai: string | null
  vai_tro: string
}

function taoHtmlEmailPhanAnhMoi(pa: PhanAnhRow, canBoList: CanBoRow[]): string {
  const adminUrl  = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
  const detailUrl = `${adminUrl}/dashboard/phan-anh/${pa.id}`
  const colors    = getMucDoColors(pa.muc_do)
  const loaiVi    = LOAI_LABEL_VI[pa.loai]    ?? pa.loai
  const mucDoVi   = MUC_DO_LABEL_VI[pa.muc_do] ?? pa.muc_do
  const thoiGian  = new Date(pa.created_at).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
  const nguoiGui = [pa.nguoi_gui_ten, pa.nguoi_gui_sdt].filter(Boolean).join(' — ') || 'Ẩn danh'
  const canBoNames = canBoList.map(cb => esc(cb.ho_ten)).join(', ')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Phản ánh mới – ${KHU_PHO.ma}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;
         box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- ── Header ───────────────────────────────────── -->
  <tr>
    <td style="background:linear-gradient(135deg,#1E3A5F 0%,#2d5986 100%);
               padding:32px 24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
        <tr>
          <td style="background:#8B1A1A;padding:7px 20px;border-radius:10px;">
            <span style="color:#fff;font-weight:900;font-size:22px;letter-spacing:4px;">KP 25</span>
          </td>
        </tr>
      </table>
      <p style="color:#fff;margin:0;font-size:18px;font-weight:700;line-height:1.4;">
        ${KHU_PHO.ten} – Phường Long Trường
      </p>
      <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">
        Hệ thống thông báo tự động · TP.HCM
      </p>
    </td>
  </tr>

  <!-- ── Alert bar ──────────────────────────────────── -->
  <tr>
    <td style="background:${colors.bg};border-left:5px solid ${colors.border};
               padding:14px 24px;">
      <p style="margin:0;font-weight:700;color:${colors.text};font-size:15px;">
        ⚠️&nbsp; PHẢN ÁNH MỚI — MỨC ĐỘ: ${esc(mucDoVi)}
        &emsp;|&emsp; LOẠI: ${esc(loaiVi.toUpperCase())}
      </p>
    </td>
  </tr>

  <!-- ── Nội dung chính ─────────────────────────────── -->
  <tr>
    <td style="padding:28px 24px 8px;">
      <h2 style="margin:0 0 20px;font-size:19px;color:#0f172a;line-height:1.45;
                 border-bottom:2px solid #f1f5f9;padding-bottom:16px;">
        ${esc(pa.tieu_de)}
      </h2>

      <!-- Bảng thông tin -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
               overflow:hidden;margin-bottom:20px;">
        ${infoRow('📍 Địa chỉ',      esc(pa.dia_chi_phan_anh ?? 'Không rõ'))}
        ${infoRow('👤 Người phản ánh', esc(nguoiGui))}
        ${infoRow('⏰ Thời gian',     thoiGian)}
        ${infoRow('🏷️ Loại',          esc(loaiVi))}
      </table>

      <!-- Mô tả chi tiết -->
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;
                  padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;
                  text-transform:uppercase;letter-spacing:1px;">Mô tả chi tiết</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">
          ${esc(pa.mo_ta)}
        </p>
      </div>

      <!-- Nút CTA -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:#1E3A5F;border-radius:10px;">
            <a href="${detailUrl}"
               style="display:inline-block;padding:13px 36px;color:#fff;
                      font-weight:700;font-size:15px;text-decoration:none;
                      border-radius:10px;">
              Xem chi tiết &amp; xử lý →
            </a>
          </td>
        </tr>
      </table>

      <!-- Danh sách nhận thông báo -->
      ${canBoNames ? `<p style="font-size:12px;color:#94a3b8;text-align:center;
          margin:0 0 8px;">Đã thông báo đến: ${canBoNames}</p>` : ''}
    </td>
  </tr>

  <!-- ── Footer ─────────────────────────────────────── -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;
               padding:18px 24px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;">
        <strong style="color:#64748b;">${KHU_PHO.ma} Smart Community OS</strong><br>
        ${KHU_PHO.ten}, Phường Long Trường, TP.HCM<br>
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

// ─── Hàm chính: gửi thông báo phản ánh mới ───────────────────
export async function thongBaoPhanAnhMoi(phanAnhId: string): Promise<void> {
  const svc = createServiceClient()

  // 1. Lấy thông tin phản ánh
  const { data: pa, error: paErr } = await svc
    .from('phan_anh')
    .select('id, tieu_de, mo_ta, loai, muc_do, dia_chi_phan_anh, nguoi_gui_ten, nguoi_gui_sdt, created_at')
    .eq('id', phanAnhId)
    .single()

  if (paErr || !pa) {
    console.error('[thongBaoPhanAnhMoi] Không lấy được phản ánh:', paErr?.message)
    return
  }

  // 2. Lấy cán bộ phụ trách theo loại phản ánh
  const vaiTroCan = getVaiTroByLoai(pa.loai)
  const { data: canBos } = await svc
    .from('can_bo')
    .select('ho_ten, email, so_dien_thoai, vai_tro')
    .in('vai_tro', vaiTroCan)
    .eq('hoat_dong', true)

  const danhSachCanBo = (canBos ?? []) as CanBoRow[]

  // 3. Tổng hợp email & SĐT người nhận
  const adminEmail = process.env.NOTIFICATION_ADMIN_EMAIL ?? ''
  const extraEmails = adminEmail.split(',').map(e => e.trim()).filter(e => e.includes('@'))

  const emailList = [
    ...new Set([
      ...extraEmails,
      ...danhSachCanBo.map(cb => cb.email).filter(Boolean),
    ])
  ]

  const sdtList = danhSachCanBo
    .map(cb => cb.so_dien_thoai)
    .filter((s): s is string => Boolean(s))

  // 4. Gửi email
  if (emailList.length > 0) {
    await guiEmail({
      to:      emailList,
      subject: `[${KHU_PHO.ma}] Phan anh moi: ${pa.tieu_de}`,
      html:    taoHtmlEmailPhanAnhMoi(pa as PhanAnhRow, danhSachCanBo),
    })
  }

  // 5. Gửi SMS đến cán bộ có SĐT
  if (sdtList.length > 0) {
    const loai   = LOAI_LABEL[pa.loai]    ?? pa.loai
    const mucDo  = MUC_DO_LABEL[pa.muc_do] ?? pa.muc_do
    const ten    = pa.nguoi_gui_ten ?? 'An danh'
    const sdt    = pa.nguoi_gui_sdt ? ` - ${pa.nguoi_gui_sdt}` : ''
    const diaChi = (pa.dia_chi_phan_anh ?? 'Khong ro').slice(0, 40)
    const tieuDe = pa.tieu_de.slice(0, 40)

    const smsTxt = `[${KHU_PHO.ma}] ${mucDo}: ${tieuDe}. Loai: ${loai}. Dia chi: ${diaChi}. Nguoi gui: ${ten}${sdt}`.slice(0, 155)
    await guiSmsNhieu(sdtList, smsTxt)
  }

  console.log(`[thongBaoPhanAnhMoi] Đã gửi → email: ${emailList.length}, SMS: ${sdtList.length}`)
}
