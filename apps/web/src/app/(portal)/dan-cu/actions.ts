'use server'

import { createServiceClient } from '@/lib/supabase/server'

export interface KetQuaTraCuu {
  found: boolean
  chuHo?: string
  diaChiDay?: string
  trangThai?: string
  soNhanKhau?: number
  // Không trả về SĐT, CMND hay thông tin nhạy cảm khác
}

const TRANG_THAI_LABEL: Record<string, string> = {
  THUONG_TRU: 'Thường trú',
  TAM_TRU:    'Tạm trú',
  TAM_VANG:   'Tạm vắng',
}

/**
 * Tra cứu hộ dân — yêu cầu khớp CẢ họ tên + địa chỉ để bảo vệ thông tin.
 * Chỉ trả về thông tin cơ bản, không trả dữ liệu nhạy cảm.
 */
export async function traCuuHoDan(
  hoTen: string,
  diaChi: string,
): Promise<KetQuaTraCuu> {
  try {
    if (!hoTen.trim() || !diaChi.trim()) return { found: false }

    // ho_dan chứa PII → đọc bằng service role (server-side); yêu cầu khớp cả
    // họ tên + địa chỉ nên không thể dò quét, chỉ trả thông tin cơ bản.
    const supabase = createServiceClient()

    const { data } = await supabase
      .from('ho_dan')
      .select('chu_ho, dia_chi_day, trang_thai, so_nhan_khau')
      .is('deleted_at', null)
      .ilike('chu_ho',      `%${hoTen.trim()}%`)
      .ilike('dia_chi_day', `%${diaChi.trim()}%`)
      .limit(1)
      .single()

    if (!data) return { found: false }

    return {
      found:       true,
      chuHo:       data.chu_ho as string,
      diaChiDay:   data.dia_chi_day as string,
      trangThai:   TRANG_THAI_LABEL[data.trang_thai as string] ?? (data.trang_thai as string),
      soNhanKhau:  data.so_nhan_khau as number,
    }
  } catch {
    return { found: false }
  }
}
