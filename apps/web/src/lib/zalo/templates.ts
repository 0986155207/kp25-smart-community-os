import { KHU_PHO } from '@/lib/khu-pho'
// ─── Zalo Message Templates ───────────────────────────────────
// Format tin nhắn cho cả Zalo OA (API) và Zalo Group (clipboard copy)
// Tất cả văn bản dùng plain text, không Markdown, chuẩn hành chính Việt Nam.

// ─── Ký tự phân cách ─────────────────────────────────────────
const LINE = '─'.repeat(30)

// ─── Định dạng thời gian Việt Nam ────────────────────────────
function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('vi-VN', {
    timeZone:    'Asia/Ho_Chi_Minh',
    day:         '2-digit',
    month:       '2-digit',
    year:        'numeric',
    hour:        '2-digit',
    minute:      '2-digit',
  })
}

function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  })
}

// ─── Truncate nội dung cho Zalo Group (giới hạn dài) ─────────
function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}

// ─── 1. Thông báo chung ───────────────────────────────────────
export interface TemplateThongBao {
  tieuDe:   string
  noiDung:  string
  loai?:    string   // 'KHAN_CAP' | 'THONG_THUONG' | 'SU_KIEN'
  url?:     string   // Link tham khảo
}

/** Cho OA: bản đầy đủ */
export function formatThongBaoOA(data: TemplateThongBao): string {
  const icon =
    data.loai === 'KHAN_CAP' ? '🚨' :
    data.loai === 'SU_KIEN'  ? '📅' : '📢'

  return `${icon} THÔNG BÁO — KHU PHỐ 25
${LINE}
${data.tieuDe.toUpperCase()}
${LINE}

${data.noiDung}

${data.url ? `Xem thêm: ${data.url}\n` : ''}${LINE}
${KHU_PHO.ten} — Phường Long Trường — TP.HCM
Thời gian: ${formatDateTime()}`
}

/** Cho Group: bản rút gọn, dễ đọc trên điện thoại */
export function formatThongBaoGroup(data: TemplateThongBao): string {
  const icon =
    data.loai === 'KHAN_CAP' ? '🚨' :
    data.loai === 'SU_KIEN'  ? '📅' : '📢'

  return `${icon} ${data.tieuDe}

${truncate(data.noiDung, 400)}
${data.url ? `\nXem thêm: ${data.url}` : ''}

-- ${KHU_PHO.ma} Long Trường (${formatDate()})`
}

// ─── 2. Sự kiện ──────────────────────────────────────────────
export interface TemplateSuKien {
  tieuDe:   string
  moTa:     string
  thoiGian: string  // đã format sẵn
  diaDiem:  string
  url?:     string
}

export function formatSuKienOA(data: TemplateSuKien): string {
  return `📅 SỰ KIỆN — KHU PHỐ 25
${LINE}
${data.tieuDe.toUpperCase()}
${LINE}

Thời gian : ${data.thoiGian}
Địa điểm  : ${data.diaDiem}

${data.moTa}

${data.url ? `Chi tiết : ${data.url}\n` : ''}${LINE}
${KHU_PHO.ten} — Phường Long Trường — TP.HCM`
}

export function formatSuKienGroup(data: TemplateSuKien): string {
  return `📅 ${data.tieuDe}

Thoi gian: ${data.thoiGian}
Dia diem : ${data.diaDiem}

${truncate(data.moTa, 300)}
${data.url ? `\nXem chi tiet: ${data.url}` : ''}

-- ${KHU_PHO.ma} Long Truong`
}

// ─── 3. Phản ánh mới (thông báo đến group cán bộ) ─────────────
export interface TemplatePhanAnh {
  id:       string
  tieuDe:   string
  loai:     string
  mucDo:    string
  diaChi?:  string
  tomTat?:  string
  adminUrl: string
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH:    'An ninh',
  MOI_TRUONG: 'Môi trường',
  HA_TANG:    'Hạ tầng',
  AN_SINH:    'An sinh',
  GIAO_THONG: 'Giao thông',
  CHIEU_SANG: 'Chiếu sáng',
  KHAC:       'Khác',
}

const MUC_DO_LABEL: Record<string, string> = {
  KHAN_CAP:   'KHẨN CẤP',
  CAO:        'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP:       'Thấp',
}

export function formatPhanAnhOA(data: TemplatePhanAnh): string {
  const loaiVi  = LOAI_LABEL[data.loai]   ?? data.loai
  const mucDoVi = MUC_DO_LABEL[data.mucDo] ?? data.mucDo

  return `⚠️ PHẢN ÁNH MỚI — ${mucDoVi.toUpperCase()}
${LINE}
${data.tieuDe}
${LINE}

Loại    : ${loaiVi}
Mức độ  : ${mucDoVi}
${data.diaChi ? `Địa chỉ : ${data.diaChi}\n` : ''}
${data.tomTat ? `Tóm tắt AI: ${data.tomTat}\n` : ''}
Xử lý ngay: ${data.adminUrl}/dashboard/phan-anh/${data.id}

${LINE}
${KHU_PHO.ma} Smart Community OS — ${formatDateTime()}`
}

export function formatPhanAnhGroup(data: TemplatePhanAnh): string {
  const loaiVi  = LOAI_LABEL[data.loai]   ?? data.loai
  const mucDoVi = MUC_DO_LABEL[data.mucDo] ?? data.mucDo
  const prefix  = data.mucDo === 'KHAN_CAP' ? '🚨' : '⚠️'

  return `${prefix} Phan anh moi - ${mucDoVi}: ${data.tieuDe}

Loai: ${loaiVi}${data.diaChi ? `\nDia chi: ${truncate(data.diaChi, 60)}` : ''}
${data.tomTat ? `AI: ${truncate(data.tomTat, 100)}` : ''}

Xu ly: ${data.adminUrl}/dashboard/phan-anh/${data.id}
(${formatDate()})`
}

// ─── 4. Nhắc nhở tuyên truyền / thông tin định kỳ ─────────────
export interface TemplateTuyenTruyen {
  tieuDe:  string
  noidung: string
  hashtag?: string[]
}

export function formatTuyenTruyenGroup(data: TemplateTuyenTruyen): string {
  const tags = (data.hashtag ?? []).map(h => `#${h}`).join(' ')
  return `📣 ${data.tieuDe}

${truncate(data.noidung, 500)}
${tags ? `\n${tags}` : ''}

-- ${KHU_PHO.ma} Long Truong (${formatDate()})`
}

// ─── 5. Tin nhắn trả lời CS (hỗ trợ cá nhân) ─────────────────
export interface TemplateCSReply {
  hoTenNguoiDan?: string
  noidung:        string
  canBoKy?:       string
}

export function formatCSReply(data: TemplateCSReply): string {
  const kinh = data.hoTenNguoiDan
    ? `Kính gửi ${data.hoTenNguoiDan},\n\n`
    : ''
  const footer = data.canBoKy
    ? `\n\n${LINE}\nTrân trọng,\n${data.canBoKy}\nBan quản lý ${KHU_PHO.ten} — Long Trường`
    : `\n\n${LINE}\nBan quản lý ${KHU_PHO.ten} — Long Trường`

  return `${kinh}${data.noidung}${footer}`
}
