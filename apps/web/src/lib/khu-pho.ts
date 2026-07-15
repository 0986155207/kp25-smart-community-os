// ============================================================
// Cấu hình khu phố cho deployment hiện tại (đa khu phố / multi-tenant)
//
// Mỗi bản triển khai (Vercel project) đặt các biến NEXT_PUBLIC_KP_* để
// xác định khu phố của mình. Mặc định = Khu phố 25 (không phá vỡ bản hiện tại).
//
// Vì là NEXT_PUBLIC_*, các giá trị này được inline lúc build → dùng được ở
// cả Server lẫn Client Components mà không cần truy vấn DB.
// ============================================================

export const KHU_PHO = {
  /** UUID đơn vị trong bảng don_vi — dùng để LỌC dữ liệu theo khu phố */
  id:        process.env.NEXT_PUBLIC_KP_ID         ?? '00000000-0000-4000-8000-000000000025',
  slug:      process.env.NEXT_PUBLIC_KP_SLUG       ?? 'kp25',
  ma:        process.env.NEXT_PUBLIC_KP_MA         ?? 'KP25',
  /** Tên ngắn hiển thị: "Khu phố 25" */
  ten:       process.env.NEXT_PUBLIC_KP_TEN        ?? 'Khu phố 25',
  /** Tên đầy đủ: "Khu phố 25, Phường Long Trường, TP. Hồ Chí Minh" */
  tenDayDu:  process.env.NEXT_PUBLIC_KP_TEN_DAY_DU ?? 'Khu phố 25, Phường Long Trường, TP. Hồ Chí Minh',
  phuong:    process.env.NEXT_PUBLIC_KP_PHUONG     ?? 'Phường Long Trường',
  tinhThanh: process.env.NEXT_PUBLIC_KP_TINH        ?? 'TP. Hồ Chí Minh',
  /** Màu chủ đạo (mã hex) — dùng cho vài điểm nhấn thương hiệu */
  mau:       process.env.NEXT_PUBLIC_KP_MAU        ?? '#8B1A1A',
  /** Nhãn viết tắt trên logo, vd "KP" + "25" */
  logoChu:   process.env.NEXT_PUBLIC_KP_LOGO_CHU   ?? 'KP',
  logoSo:    process.env.NEXT_PUBLIC_KP_LOGO_SO    ?? '25',
  /** URL ảnh logo riêng (tùy chọn). Bỏ trống → dùng logo chữ ở trên. */
  logoUrl:   process.env.NEXT_PUBLIC_KP_LOGO_URL   ?? '',
} as const

/** "KP25 Smart Community" — tên thương hiệu portal */
export const TEN_THUONG_HIEU = `${KHU_PHO.ma} Smart Community`
