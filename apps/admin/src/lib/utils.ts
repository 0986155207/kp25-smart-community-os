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

export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// ============================================================
// Supabase trả về snake_case → map sang camelCase
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
    nguoiTaoId: row['nguoi_tao_id'] as string | undefined,
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
    diaChiPhanAnh: (row['dia_chi_phan_anh'] ?? '') as string,
    toaDoLat: row['toa_do_lat'] as number | undefined,
    toaDoLng: row['toa_do_lng'] as number | undefined,
    anhUrls: (row['anh_urls'] ?? []) as string[],
    videoUrls: (row['video_urls'] ?? []) as string[],
    nguoiGuiTen: (row['nguoi_gui_ten'] ?? '') as string,
    nguoiGuiSdt: (row['nguoi_gui_sdt'] ?? '') as string,
    canBoXuLyId: row['can_bo_xu_ly_id'] as string | undefined,
    thoiGianXuLy: row['thoi_gian_xu_ly'] as string | undefined,
    ketQuaXuLy: (row['ket_qua_xu_ly'] ?? '') as string,
    createdAt: (row['created_at'] ?? new Date().toISOString()) as string,
    updatedAt: (row['updated_at'] ?? new Date().toISOString()) as string,
  }
}

export function mapHoDan(row: SnakeRecord) {
  return {
    id: row['id'] as string,
    maHo: (row['ma_ho'] ?? '') as string,
    chuHo: (row['chu_ho'] ?? '') as string,
    diaChiDay: (row['dia_chi_day'] ?? '') as string,
    soNha: (row['so_nha'] ?? '') as string,
    duong: (row['duong'] ?? '') as string,
    toTruong: (row['to_truong'] ?? '') as string,
    soDienThoai: (row['so_dien_thoai'] ?? '') as string,
    email: (row['email'] ?? '') as string,
    trangThai: (row['trang_thai'] ?? 'THUONG_TRU') as string,
    soNhanKhau: (row['so_nhan_khau'] ?? 0) as number,
    ghiChu: (row['ghi_chu'] ?? '') as string,
    qrToken: (row['qr_token'] ?? null) as string | null,
    createdAt: (row['created_at'] ?? new Date().toISOString()) as string,
    updatedAt: (row['updated_at'] ?? new Date().toISOString()) as string,
  }
}

export function mapNhanKhau(row: SnakeRecord) {
  return {
    id: row['id'] as string,
    hoId: row['ho_id'] as string,
    hoTen: (row['ho_ten'] ?? '') as string,
    ngaySinh: row['ngay_sinh'] as string | undefined,
    gioiTinh: (row['gioi_tinh'] ?? 'NAM') as string,
    cccd: (row['cccd'] ?? '') as string,
    cmnd: (row['cmnd'] ?? '') as string,
    quanHe: (row['quan_he'] ?? '') as string,
    ngheNghiep: (row['nghe_nghiep'] ?? '') as string,
    trinhDoHocVan: (row['trinh_do_hoc_van'] ?? '') as string,
    soDienThoai: (row['so_dien_thoai'] ?? '') as string,
    trangThai: (row['trang_thai'] ?? 'THUONG_TRU') as string,
    ghiChu: (row['ghi_chu'] ?? '') as string,
    createdAt: (row['created_at'] ?? new Date().toISOString()) as string,
    daMat: (row['da_mat'] ?? false) as boolean,
    ngayMat: (row['ngay_mat'] ?? null) as string | null,
  }
}

export function tinhTuoi(ngaySinh: string | undefined | null): number | null {
  if (!ngaySinh) return null
  const birth = new Date(ngaySinh)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}
