'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Cập nhật hồ sơ cá nhân ────────────────────────────────────
export async function capNhatHoSo(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) {
      return { success: false, message: 'Phiên đăng nhập đã hết hạn' }
    }

    const svc = createServiceClient()
    const { error } = await svc
      .from('can_bo')
      .update({
        ho_ten:        (formData.get('ho_ten')        as string)?.trim() || null,
        so_dien_thoai: (formData.get('so_dien_thoai') as string)?.trim() || null,
        ghi_chu:       (formData.get('ghi_chu')       as string)?.trim() || null,
      })
      .eq('email', user.email)

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/cai-dat')
    revalidatePath('/dashboard', 'layout')
    return { success: true, message: 'Cập nhật hồ sơ thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Đổi mật khẩu ──────────────────────────────────────────────
export async function doiMatKhau(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const matKhauCu  = formData.get('mat_khau_cu')  as string
    const matKhauMoi = formData.get('mat_khau_moi') as string
    const xacNhan    = formData.get('xac_nhan')     as string

    if (!matKhauCu || !matKhauMoi || !xacNhan) {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin' }
    }
    if (matKhauMoi !== xacNhan) {
      return { success: false, message: 'Mật khẩu mới và xác nhận không khớp' }
    }
    if (matKhauMoi.length < 8) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' }
    }

    // Xác thực mật khẩu cũ bằng cách thử đăng nhập lại
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) {
      return { success: false, message: 'Phiên đăng nhập đã hết hạn' }
    }

    // Kiểm tra mật khẩu cũ
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    user.email,
      password: matKhauCu,
    })
    if (signInErr) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' }
    }

    // Cập nhật mật khẩu mới
    const { error: updateErr } = await supabase.auth.updateUser({
      password: matKhauMoi,
    })
    if (updateErr) return { success: false, message: updateErr.message }

    return { success: true, message: 'Đổi mật khẩu thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}
