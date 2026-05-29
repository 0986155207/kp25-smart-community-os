'use server'

import { thongBaoPhanAnhMoi } from '@/lib/notifications/phan-anh'

/**
 * Server Action: Gửi thông báo phản ánh mới đến cán bộ & admin.
 * Gọi fire-and-forget từ client sau khi insert thành công.
 */
export async function guiThongBaoPhanAnhMoi(phanAnhId: string): Promise<void> {
  try {
    await thongBaoPhanAnhMoi(phanAnhId)
  } catch (err) {
    // Không throw để không ảnh hưởng UX người dùng
    console.error('[guiThongBaoPhanAnhMoi] Lỗi gửi thông báo:', err)
  }
}
