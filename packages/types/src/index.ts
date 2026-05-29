// ============================================
// KP25 SMART COMMUNITY OS — Shared Types
// ============================================

// --- ENUMS ---

export enum VaiTro {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PHUONG = 'ADMIN_PHUONG',
  BI_THU = 'BI_THU',
  TRUONG_KHU_PHO = 'TRUONG_KHU_PHO',
  CONG_AN = 'CONG_AN',
  DOAN_THE = 'DOAN_THE',
  CAN_BO = 'CAN_BO',
  NGUOI_DAN = 'NGUOI_DAN',
}

export enum TrangThaiPhanAnh {
  MOI = 'MOI',
  DANG_XU_LY = 'DANG_XU_LY',
  CHO_PHAN_HOI = 'CHO_PHAN_HOI',
  DA_XU_LY = 'DA_XU_LY',
  DONG = 'DONG',
}

export enum LoaiPhanAnh {
  AN_NINH = 'AN_NINH',
  MOI_TRUONG = 'MOI_TRUONG',
  HA_TANG = 'HA_TANG',
  AN_SINH = 'AN_SINH',
  GIAO_THONG = 'GIAO_THONG',
  KHAC = 'KHAC',
}

export enum MucDoUuTien {
  KHAN_CAP = 'KHAN_CAP',
  CAO = 'CAO',
  TRUNG_BINH = 'TRUNG_BINH',
  THAP = 'THAP',
}

export enum GioiTinh {
  NAM = 'NAM',
  NU = 'NU',
  KHAC = 'KHAC',
}

export enum TrangThaiHo {
  THUONG_TRU = 'THUONG_TRU',
  TAM_TRU = 'TAM_TRU',
  TAM_VANG = 'TAM_VANG',
}

// --- RESPONSE ---

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  timestamp: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  timestamp: string
}

// --- AUTH ---

export interface NguoiDung {
  id: string
  email?: string
  soDienThoai?: string
  hoTen: string
  vaiTro: VaiTro
  avatarUrl?: string
  hoId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  nguoiDung: NguoiDung
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// --- HỘ DÂN ---

export interface HoDan {
  id: string
  maHo: string
  chuHo: string
  diaChiDay: string
  soNha: string
  duong: string
  toTruong?: string
  soDienThoai?: string
  email?: string
  trangThai: TrangThaiHo
  soNhanKhau: number
  ghiChu?: string
  toaDoLat?: number
  toaDoLng?: number
  qrCode?: string
  createdAt: string
  updatedAt: string
  nhanKhauList?: NhanKhau[]
}

export interface NhanKhau {
  id: string
  hoId: string
  hoTen: string
  ngaySinh: string
  gioiTinh: GioiTinh
  cccd?: string
  quanHe: string
  ngheNghiep?: string
  trinhDoHocVan?: string
  soDienThoai?: string
  trangThai: string
  ghiChu?: string
  createdAt: string
  updatedAt: string
}

// --- PHẢN ÁNH ---

export interface PhanAnh {
  id: string
  tieuDe: string
  moTa: string
  loai: LoaiPhanAnh
  mucDo: MucDoUuTien
  trangThai: TrangThaiPhanAnh
  diaChiPhanAnh: string
  toaDoLat?: number
  toaDoLng?: number
  anhUrls: string[]
  videoUrls: string[]
  nguoiGuiId?: string
  nguoiGuiTen?: string
  nguoiGuiSdt?: string
  canBoXuLyId?: string
  thoiGianXuLy?: string
  ketQuaXuLy?: string
  aiDanhGia?: string
  createdAt: string
  updatedAt: string
}

// --- THÔNG BÁO ---

export interface ThongBao {
  id: string
  tieuDe: string
  noiDung: string
  loai: string
  anhUrl?: string
  fileDinhKemUrls: string[]
  nguoiTaoId: string
  daGuiPush: boolean
  daGuiZalo: boolean
  daGuiSms: boolean
  luotXem: number
  ghimLen: boolean
  createdAt: string
  updatedAt: string
}

// --- AI CHAT ---

export interface ChatSession {
  id: string
  nguoiDungId?: string
  tieuDe: string
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  sessionId: string
  vaiTro: 'user' | 'assistant'
  noiDung: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// --- DASHBOARD ---

export interface DashboardStats {
  tongHoDan: number
  tongNhanKhau: number
  phanAnhMoi: number
  phanAnhDangXuLy: number
  phanAnhDaXuLy: number
  thongBaoHomNay: number
  nguoiDungHoatDong: number
}

// --- QR ---

export interface QrHoDan {
  hoId: string
  maHo: string
  chuHo: string
  diaChi: string
  token: string
  expiresAt?: string
}
