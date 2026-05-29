import {
  Flag, Music2, Dumbbell, Heart, Users, ShieldCheck,
  Stethoscope, GraduationCap, HelpCircle, type LucideIcon,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
export type LoaiSuKien =
  | 'CHINH_TRI' | 'VAN_HOA' | 'THE_THAO' | 'TU_THIEN'
  | 'HOP_MAT' | 'AN_NINH' | 'SUCK_KHOE' | 'GIAO_DUC' | 'KHAC'

export type TrangThaiSuKien =
  | 'NHAP' | 'SAP_DIEN_RA' | 'DANG_DIEN_RA' | 'DA_KET_THUC' | 'HUY'

export interface SuKien {
  id:               string
  tieu_de:          string
  mo_ta:            string | null
  noi_dung_day_du:  string | null
  loai:             LoaiSuKien
  trang_thai:       TrangThaiSuKien
  ngay_bat_dau:     string
  ngay_ket_thuc:    string | null
  dia_diem:         string
  dia_chi_cu_the:   string | null
  anh_bia_url:      string | null
  so_luong_du_kien: number | null
  so_luong_thuc_te: number | null
  can_dang_ky:      boolean
  han_dang_ky:      string | null
  don_vi_to_chuc:   string | null
  nguoi_phu_trach:  string | null
  sdt_lien_he:      string | null
  noi_bat:          boolean
  ghi_chu:          string | null
  created_at:       string
  updated_at:       string
}

// ─── Loại sự kiện ─────────────────────────────────────────────
export const LOAI_SK_CFG: Record<LoaiSuKien, {
  label:     string
  color:     string   // text color
  bg:        string   // background
  badge:     string   // badge css
  Icon:      LucideIcon
}> = {
  CHINH_TRI:  { label: 'Chính trị',  color: 'text-red-700',    bg: 'bg-red-50',     badge: 'bg-red-100 text-red-700',     Icon: Flag         },
  VAN_HOA:    { label: 'Văn hóa',    color: 'text-purple-700', bg: 'bg-purple-50',  badge: 'bg-purple-100 text-purple-700', Icon: Music2       },
  THE_THAO:   { label: 'Thể thao',   color: 'text-green-700',  bg: 'bg-green-50',   badge: 'bg-green-100 text-green-700',  Icon: Dumbbell     },
  TU_THIEN:   { label: 'Từ thiện',   color: 'text-pink-700',   bg: 'bg-pink-50',    badge: 'bg-pink-100 text-pink-700',    Icon: Heart        },
  HOP_MAT:    { label: 'Họp mặt',    color: 'text-blue-700',   bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    Icon: Users        },
  AN_NINH:    { label: 'An ninh',    color: 'text-orange-700', bg: 'bg-orange-50',  badge: 'bg-orange-100 text-orange-700', Icon: ShieldCheck  },
  SUCK_KHOE:  { label: 'Sức khỏe',  color: 'text-teal-700',   bg: 'bg-teal-50',    badge: 'bg-teal-100 text-teal-700',    Icon: Stethoscope  },
  GIAO_DUC:   { label: 'Giáo dục',  color: 'text-indigo-700', bg: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-700', Icon: GraduationCap },
  KHAC:       { label: 'Khác',       color: 'text-slate-600',  bg: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-600',  Icon: HelpCircle   },
}

// ─── Trạng thái ───────────────────────────────────────────────
export const TRANG_THAI_SK_CFG: Record<TrangThaiSuKien, {
  label:  string
  color:  string
  dot:    string
}> = {
  NHAP:          { label: 'Bản nháp',      color: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-400'   },
  SAP_DIEN_RA:   { label: 'Sắp diễn ra',   color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'    },
  DANG_DIEN_RA:  { label: 'Đang diễn ra',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  DA_KET_THUC:   { label: 'Đã kết thúc',   color: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-400'   },
  HUY:           { label: 'Đã huỷ',        color: 'bg-red-100 text-red-600',       dot: 'bg-red-400'     },
}
