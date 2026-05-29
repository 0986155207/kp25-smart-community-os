'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CanBo } from '@/lib/auth-config'

const svc = () => createServiceClient()

// ── Helper: lấy auth user ID bằng email qua RPC (đáng tin cậy hơn listUsers) ──
async function timAuthUserId(email: string): Promise<string | null> {
  try {
    const { data, error } = await svc()
      .rpc('get_auth_user_id_by_email', { p_email: email.toLowerCase().trim() })
    if (error || !data) return null
    return data as string
  } catch { return null }
}

// ── Helper: lấy full auth user object (dùng khi cần) ──
async function timAuthUser(email: string) {
  const uid = await timAuthUserId(email)
  if (!uid) return null
  try {
    const { data } = await svc().auth.admin.getUserById(uid)
    return data?.user ?? null
  } catch { return null }
}

// ── Lấy tất cả cán bộ ────────────────────────────────────────
export async function layDanhSachCanBo(): Promise<CanBo[]> {
  try {
    const { data } = await svc()
      .from('can_bo')
      .select('*')
      .order('created_at', { ascending: true })
    return (data ?? []) as CanBo[]
  } catch { return [] }
}

// ── Cập nhật thông tin cán bộ (bao gồm email) ────────────────
export async function capNhatCanBo(
  id: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase    = svc()
    const emailMoi    = (formData.get('email')        as string)?.trim().toLowerCase()
    const hoTen       = formData.get('ho_ten')        as string
    const vaiTro      = formData.get('vai_tro')       as string
    const chucVu      = formData.get('chuc_vu')       as string || null
    const soDienThoai = formData.get('so_dien_thoai') as string || null
    const ghiChu      = formData.get('ghi_chu')       as string || null
    const hoatDong    = formData.get('hoat_dong') === 'true'

    // Lấy email cũ trước
    const { data: canBo } = await supabase
      .from('can_bo').select('email').eq('id', id).single()
    const emailCu = canBo?.email?.toLowerCase().trim()

    // Cập nhật can_bo
    const { error } = await supabase
      .from('can_bo')
      .update({
        ho_ten: hoTen, vai_tro: vaiTro, chuc_vu: chucVu,
        so_dien_thoai: soDienThoai, ghi_chu: ghiChu,
        hoat_dong: hoatDong, email: emailMoi,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { success: false, message: error.message }

    // Nếu email thay đổi → cập nhật auth.users
    if (emailMoi && emailCu && emailMoi !== emailCu) {
      const authUser = await timAuthUser(emailCu)
      if (authUser) {
        const { error: authErr } = await supabase.auth.admin.updateUserById(
          authUser.id, { email: emailMoi }
        )
        if (authErr) {
          return { success: false, message: `Cập nhật thông tin OK nhưng lỗi đổi email auth: ${authErr.message}` }
        }
      }
    }

    revalidatePath('/dashboard/phan-quyen')
    return { success: true, message: 'Cập nhật thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Thêm mới cán bộ + tạo tài khoản auth ─────────────────────
export async function themMoiCanBo(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase    = svc()
    const email       = (formData.get('email')        as string)?.trim().toLowerCase()
    const hoTen       = formData.get('ho_ten')        as string
    const vaiTro      = formData.get('vai_tro')       as string
    const chucVu      = formData.get('chuc_vu')       as string || null
    const soDienThoai = formData.get('so_dien_thoai') as string || null
    const matKhau     = formData.get('mat_khau')      as string

    if (!email || !hoTen || !vaiTro || !matKhau) {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
    }
    if (matKhau.length < 8) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
    }

    // Kiểm tra email đã tồn tại trong can_bo
    const { data: existing } = await supabase
      .from('can_bo').select('id').eq('email', email).maybeSingle()
    if (existing) return { success: false, message: 'Email này đã được đăng ký cho cán bộ khác' }

    // Tạo auth.users trước
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password:      matKhau,
      email_confirm: true,
    })
    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        return { success: false, message: 'Email đã có tài khoản trong hệ thống' }
      }
      return { success: false, message: `Lỗi tạo tài khoản: ${authErr.message}` }
    }

    // Insert can_bo
    const { error: cbErr } = await supabase.from('can_bo').insert({
      email, ho_ten: hoTen, vai_tro: vaiTro,
      chuc_vu: chucVu, so_dien_thoai: soDienThoai, hoat_dong: true,
    })
    if (cbErr) {
      if (authData?.user?.id) await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, message: `Lỗi tạo hồ sơ cán bộ: ${cbErr.message}` }
    }

    revalidatePath('/dashboard/phan-quyen')
    return { success: true, message: `Đã thêm cán bộ ${hoTen} thành công!\nEmail: ${email}\nMật khẩu: ${matKhau}` }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Tạo tài khoản auth cho cán bộ chưa có ────────────────────
export async function taoTaiKhoanCanBo(
  canBoId:    string,
  email:      string,
  matKhauTam: string = 'KP25@2026!'
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = svc()

    // Kiểm tra đã tồn tại chưa trước khi tạo
    const existing = await timAuthUser(email)
    if (existing) {
      return { success: false, message: 'Email đã có tài khoản. Dùng "Đặt lại mật khẩu" nếu cần.' }
    }

    const { error: authErr } = await supabase.auth.admin.createUser({
      email,
      password:      matKhauTam,
      email_confirm: true,
    })
    if (authErr) return { success: false, message: authErr.message }

    void canBoId
    revalidatePath('/dashboard/phan-quyen')
    return {
      success: true,
      message: `Tài khoản tạo thành công!\nEmail: ${email}\nMật khẩu tạm: ${matKhauTam}`,
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Đặt lại mật khẩu ─────────────────────────────────────────
export async function datLaiMatKhau(
  email:      string,
  matKhauMoi: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (matKhauMoi.length < 6) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }

    const uid = await timAuthUserId(email)
    if (!uid) {
      return { success: false, message: 'Tài khoản chưa được tạo. Nhấn "+ Tạo tài khoản" trước.' }
    }

    const { error } = await svc().auth.admin.updateUserById(uid, { password: matKhauMoi })
    if (error) return { success: false, message: error.message }

    return { success: true, message: `Đặt lại mật khẩu thành công cho ${email}` }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Xoá cán bộ (soft: tạm ngưng / hard: xoá hoàn toàn) ──────
export async function xoaCanBo(
  id:          string,
  email:       string,
  xoaHoanToan: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = svc()

    if (xoaHoanToan) {
      const uid = await timAuthUserId(email)
      if (uid) await supabase.auth.admin.deleteUser(uid)

      const { error } = await supabase.from('can_bo').delete().eq('id', id)
      if (error) return { success: false, message: error.message }
    } else {
      const { error } = await supabase
        .from('can_bo')
        .update({ hoat_dong: false, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/phan-quyen')
    return {
      success: true,
      message: xoaHoanToan ? 'Đã xoá cán bộ và tài khoản' : 'Đã tạm ngưng tài khoản',
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Kiểm tra tài khoản auth đã tồn tại chưa ──────────────────
export async function kiemTraTaiKhoan(email: string): Promise<boolean> {
  try {
    const uid = await timAuthUserId(email)
    return !!uid
  } catch { return false }
}
