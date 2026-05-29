// ─── Types ────────────────────────────────────────────────────
export type TrangThaiTamTru  = 'DANG_TAM_TRU' | 'HET_HAN' | 'DA_ROI_DI'
export type TrangThaiTamVang = 'DANG_VANG' | 'DA_VE' | 'QUA_HAN'

// ─── Labels ────────────────────────────────────────────────────
export const LY_DO_TAM_TRU_LABEL: Record<string, string> = {
  LAM_VIEC:   'Làm việc',
  HOC_TAP:    'Học tập',
  NHAN_VIEC:  'Nhận việc làm',
  CHUA_BENH:  'Chữa bệnh',
  KINH_DOANH: 'Kinh doanh',
  KHAC:       'Khác',
}

export const LY_DO_TAM_VANG_LABEL: Record<string, string> = {
  LAM_VIEC:   'Làm việc',
  HOC_TAP:    'Học tập',
  CHUA_BENH:  'Chữa bệnh',
  KHU:        'Đi khỏi địa bàn',
  DU_LICH:    'Du lịch',
  THAM_THAN:  'Thăm thân nhân',
  KHAC:       'Khác',
}

export const TRANG_THAI_TAM_TRU_LABEL: Record<TrangThaiTamTru, string> = {
  DANG_TAM_TRU: 'Đang tạm trú',
  HET_HAN:      'Hết hạn',
  DA_ROI_DI:    'Đã rời đi',
}

export const TRANG_THAI_TAM_VANG_LABEL: Record<TrangThaiTamVang, string> = {
  DANG_VANG: 'Đang vắng',
  DA_VE:     'Đã về',
  QUA_HAN:   'Quá hạn',
}
