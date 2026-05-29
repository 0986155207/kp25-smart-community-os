export const LOAI_HO_NGHEO: Record<string, { label: string; color: string }> = {
  NGHEO:     { label: 'Hộ nghèo',     color: 'red'   },
  CAN_NGHEO: { label: 'Hộ cận nghèo', color: 'amber' },
}

export const TRANG_THAI_HN: Record<string, { label: string; color: string }> = {
  DANG_HUONG:  { label: 'Đang hưởng',   color: 'red'     },
  THOAT_NGHEO: { label: 'Thoát nghèo',  color: 'emerald' },
  HET_HAN_XET: { label: 'Hết hạn xét',  color: 'slate'   },
}
