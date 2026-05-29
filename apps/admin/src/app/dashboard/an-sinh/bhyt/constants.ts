export const DOI_TUONG_LABEL: Record<string, string> = {
  NGUOI_LAO_DONG_DOANH_NGHIEP: 'NLĐ doanh nghiệp',
  CAN_BO_CONG_CHUC:             'CBCC / Viên chức',
  HOC_SINH_SINH_VIEN:           'Học sinh / Sinh viên',
  HO_GIA_DINH:                  'Hộ gia đình',
  HO_NGHEO:                     'Hộ nghèo',
  CAN_NGHEO:                    'Cận nghèo',
  NGUOI_CAO_TUOI_80:            'Người cao tuổi ≥80',
  BHTN:                         'Đang hưởng BHTN',
  TRE_EM_DUOI_6:                'Trẻ em < 6 tuổi',
  NGUOI_CO_CONG:                'Người có công',
  DTTS_VUNG_KHO:                'DTTS vùng khó',
  TU_NGUYEN:                    'Tự nguyện',
}

export const TRANG_THAI_BHYT: Record<string, { label: string; color: string }> = {
  CON_HAN:      { label: 'Còn hiệu lực', color: 'emerald' },
  SAP_HET_HAN:  { label: 'Sắp hết hạn',  color: 'amber'   },
  HET_HAN:      { label: 'Hết hạn',       color: 'red'     },
  CHUA_CO:      { label: 'Chưa có thẻ',   color: 'slate'   },
}
