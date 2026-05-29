import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: vi })
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi })
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ============================================================
// Supabase trả về snake_case, cần map sang camelCase
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SnakeRecord = Record<string, any>

export function mapThongBao(row: SnakeRecord) {
  return {
    id: row['id'] as string,
    tieuDe: (row['tieu_de'] ?? '') as string,
    noiDung: (row['noi_dung'] ?? '') as string,
    loai: (row['loai'] ?? 'THONG_BAO_CHUNG') as string,
    anhUrl: row['anh_url'] as string | undefined,
    fileDinhKemUrls: (row['file_dinh_kem_urls'] ?? []) as string[],
    nguoiTaoId: row['nguoi_tao_id'] as string,
    daGuiPush: (row['da_gui_push'] ?? false) as boolean,
    daGuiZalo: (row['da_gui_zalo'] ?? false) as boolean,
    daGuiSms: (row['da_gui_sms'] ?? false) as boolean,
    luotXem: (row['luot_xem'] ?? 0) as number,
    ghimLen: (row['ghim_len'] ?? false) as boolean,
    ngayHetHan: row['ngay_het_han'] as string | undefined,
    createdAt: (row['created_at'] ?? new Date().toISOString()) as string,
    updatedAt: (row['updated_at'] ?? new Date().toISOString()) as string,
  }
}

export function mapPhanAnh(row: SnakeRecord) {
  return {
    id: row['id'] as string,
    tieuDe: (row['tieu_de'] ?? '') as string,
    moTa: (row['mo_ta'] ?? '') as string,
    loai: (row['loai'] ?? 'KHAC') as string,
    mucDo: (row['muc_do'] ?? 'TRUNG_BINH') as string,
    trangThai: (row['trang_thai'] ?? 'MOI') as string,
    diaChiPhanAnh: row['dia_chi_phan_anh'] as string | undefined,
    toaDoLat: row['toa_do_lat'] as number | undefined,
    toaDoLng: row['toa_do_lng'] as number | undefined,
    anhUrls: (row['anh_urls'] ?? []) as string[],
    videoUrls: (row['video_urls'] ?? []) as string[],
    nguoiGuiId: row['nguoi_gui_id'] as string | undefined,
    nguoiGuiTen: row['nguoi_gui_ten'] as string | undefined,
    nguoiGuiSdt: row['nguoi_gui_sdt'] as string | undefined,
    canBoXuLyId: row['can_bo_xu_ly_id'] as string | undefined,
    thoiGianXuLy: row['thoi_gian_xu_ly'] as string | undefined,
    ketQuaXuLy: row['ket_qua_xu_ly'] as string | undefined,
    aiDanhGia: row['ai_danh_gia'] as string | undefined,
    createdAt: (row['created_at'] ?? new Date().toISOString()) as string,
    updatedAt: (row['updated_at'] ?? new Date().toISOString()) as string,
  }
}

export function buildApiResponse<T>(data: T, message = 'Thành công') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function buildApiError(message: string, errors?: Record<string, string[]>) {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  }
}
