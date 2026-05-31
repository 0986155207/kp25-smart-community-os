// Định nghĩa trường hồ sơ — KHÔNG 'use server' để export được giá trị
// (file 'use server' chỉ được export async function)

export const TRUONG_HO_SO = [
  { key: 'ho_ten',              label: 'Họ tên',              nhom: 'Cơ bản',    batBuoc: true },
  { key: 'ngay_sinh',          label: 'Ngày sinh',           nhom: 'Cơ bản',    batBuoc: true },
  { key: 'gioi_tinh',          label: 'Giới tính',           nhom: 'Cơ bản',    batBuoc: true },
  { key: 'cccd',               label: 'Số CCCD',             nhom: 'Định danh', batBuoc: true },
  { key: 'cccd_ngay_cap',      label: 'Ngày cấp CCCD',       nhom: 'Định danh', batBuoc: false },
  { key: 'cccd_noi_cap',       label: 'Nơi cấp CCCD',        nhom: 'Định danh', batBuoc: false },
  { key: 'quan_he',            label: 'Quan hệ chủ hộ',      nhom: 'Cơ bản',    batBuoc: true },
  { key: 'noi_sinh',           label: 'Nơi sinh',            nhom: 'Nhân thân', batBuoc: false },
  { key: 'nguyen_quan',        label: 'Nguyên quán',         nhom: 'Nhân thân', batBuoc: false },
  { key: 'dan_toc',            label: 'Dân tộc',             nhom: 'Nhân thân', batBuoc: false },
  { key: 'ton_giao',           label: 'Tôn giáo',            nhom: 'Nhân thân', batBuoc: false },
  { key: 'tinh_trang_hon_nhan',label: 'Tình trạng hôn nhân', nhom: 'Nhân thân', batBuoc: false },
  { key: 'nghe_nghiep',        label: 'Nghề nghiệp',         nhom: 'Nghề nghiệp', batBuoc: false },
  { key: 'so_dien_thoai',      label: 'Số điện thoại',       nhom: 'Liên hệ',   batBuoc: false },
] as const

export type TruongKey = typeof TRUONG_HO_SO[number]['key']

// Tính độ hoàn thiện cho 1 bản ghi
export function tinhHoanThien(nk: Record<string, unknown>): {
  phanTram: number
  thieu: string[]
} {
  const thieu: string[] = []
  for (const t of TRUONG_HO_SO) {
    const v = nk[t.key]
    if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
      thieu.push(t.key)
    }
  }
  const daDien = TRUONG_HO_SO.length - thieu.length
  return {
    phanTram: Math.round((daDien / TRUONG_HO_SO.length) * 100),
    thieu,
  }
}
