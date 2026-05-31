'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'

export async function themNhanKhauTuOCR(input: {
  hoId:               string
  quanHe:             string
  ho_ten:             string | null
  cccd:               string | null
  ngay_sinh:          string | null
  gioi_tinh:          string | null
  quoc_tich:          string | null
  dan_toc:            string | null
  nguyen_quan:        string | null
  noi_sinh:           string | null
  dia_chi_thuong_tru: string | null
  cccd_ngay_cap:      string | null
  cccd_noi_cap:       string | null
}): Promise<{ success: boolean; message: string }> {
  try {
    if (!input.hoId)         return { success: false, message: 'Vui lòng chọn hộ dân' }
    if (!input.ho_ten?.trim()) return { success: false, message: 'Thiếu họ tên' }

    // Validation
    if (input.cccd && !/^\d{9,12}$/.test(input.cccd)) {
      return { success: false, message: 'Số CCCD không hợp lệ (9-12 chữ số)' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('nhan_khau')
      .insert({
        ho_id:        input.hoId,
        ho_ten:       input.ho_ten.trim(),
        ngay_sinh:    input.ngay_sinh || null,
        gioi_tinh:    input.gioi_tinh === 'NU' ? 'NU' : input.gioi_tinh === 'KHAC' ? 'KHAC' : 'NAM',
        cccd:         input.cccd || null,
        quan_he:      input.quanHe || 'Thành viên khác',
        trang_thai:   'THUONG_TRU',
        quoc_tich:    input.quoc_tich || 'Việt Nam',
        dan_toc:      input.dan_toc || 'Kinh',
        nguyen_quan:  input.nguyen_quan || null,
        noi_sinh:     input.noi_sinh || null,
        dia_chi_thuong_tru: input.dia_chi_thuong_tru || null,
        cccd_ngay_cap: input.cccd_ngay_cap || null,
        cccd_noi_cap:  input.cccd_noi_cap || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[themNhanKhauTuOCR]', JSON.stringify(error))
      if (error.code === '23505') return { success: false, message: 'Số CCCD đã tồn tại trong hệ thống' }
      return { success: false, message: `Lỗi: ${error.message}` }
    }

    // Tăng số nhân khẩu
    const { data: ho } = await supabase.from('ho_dan').select('so_nhan_khau').eq('id', input.hoId).single()
    await supabase.from('ho_dan').update({
      so_nhan_khau: ((ho?.so_nhan_khau as number) ?? 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', input.hoId)

    ghiAuditLog({
      hanh_dong: 'TAO', bang: 'nhan_khau', ban_ghi_id: data.id,
      mo_ta: `Thêm nhân khẩu từ quét CCCD: ${input.ho_ten}`,
    }).catch(() => {})

    revalidatePath('/dashboard/dan-cu')
    revalidatePath(`/dashboard/dan-cu/${input.hoId}`)
    revalidatePath('/dashboard/dan-cu/ho-so-thieu')
    return { success: true, message: `Đã thêm ${input.ho_ten} vào hộ thành công` }
  } catch (err) {
    console.error('[themNhanKhauTuOCR]', err)
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}
