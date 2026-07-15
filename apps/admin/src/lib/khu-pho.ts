// ============================================================
// Cấu hình khu phố cho deployment admin hiện tại (đa khu phố)
//
// Mỗi bản triển khai đặt NEXT_PUBLIC_KP_* để xác định khu phố.
// Mặc định = Khu phố 25. Dùng được ở cả Server lẫn Client Components.
// ============================================================

export const KHU_PHO = {
  id:        process.env.NEXT_PUBLIC_KP_ID         ?? '00000000-0000-4000-8000-000000000025',
  slug:      process.env.NEXT_PUBLIC_KP_SLUG       ?? 'kp25',
  ma:        process.env.NEXT_PUBLIC_KP_MA         ?? 'KP25',
  ten:       process.env.NEXT_PUBLIC_KP_TEN        ?? 'Khu phố 25',
  tenDayDu:  process.env.NEXT_PUBLIC_KP_TEN_DAY_DU ?? 'Khu phố 25, Phường Long Trường, TP. Hồ Chí Minh',
  phuong:    process.env.NEXT_PUBLIC_KP_PHUONG     ?? 'Phường Long Trường',
  tinhThanh: process.env.NEXT_PUBLIC_KP_TINH       ?? 'TP. Hồ Chí Minh',
  mau:       process.env.NEXT_PUBLIC_KP_MAU        ?? '#8B1A1A',
  logoChu:   process.env.NEXT_PUBLIC_KP_LOGO_CHU   ?? 'KP',
  logoSo:    process.env.NEXT_PUBLIC_KP_LOGO_SO    ?? '25',
  /** URL ảnh logo riêng (tùy chọn). Bỏ trống → dùng logo chữ ở trên. */
  logoUrl:   process.env.NEXT_PUBLIC_KP_LOGO_URL   ?? '',
} as const
