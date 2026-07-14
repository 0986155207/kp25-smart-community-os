'use server'

// Trong file 'use server', CHỈ được export async functions (Server Actions)
// Types và constants phải import từ auth-config.ts

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { CanBo } from './auth-config'

// Ánh xạ vai trò can_bo → enum vai_tro của profiles (RLS dùng cột này).
// AN_NINH / PHU_TRACH_NCT không có trong enum → coi là CAN_BO.
const MAP_VAI_TRO_PROFILE: Record<string, string> = {
  BI_THU:         'BI_THU',
  TRUONG_KHU_PHO: 'TRUONG_KHU_PHO',
  CONG_AN:        'CONG_AN',
  AN_NINH:        'CAN_BO',
  PHU_TRACH_NCT:  'CAN_BO',
}

// ─── Lấy thông tin cán bộ hiện tại ───────────────────────────

export async function layCanBoHienTai(): Promise<CanBo | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) return null

    const svc = createServiceClient()
    const { data, error } = await svc
      .from('can_bo')
      .select('*')
      .eq('email', user.email)
      .eq('hoat_dong', true)
      .single()

    if (error || !data) return null

    // Đồng bộ profiles để RLS nhận diện đúng vai trò + khu phố của cán bộ.
    // Nhờ vậy các truy vấn admin (cookie client) hoạt động dưới RLS đã siết,
    // và tự động cách ly dữ liệu theo khu phố (co_quyen_don_vi).
    try {
      const canBo = data as CanBo & { don_vi_id?: string | null }
      // UPSERT: tạo profiles nếu chưa có (tài khoản tạo trước khi có trigger),
      // cập nhật vai_tro + don_vi_id nếu đã có.
      await svc.from('profiles')
        .upsert({
          id:        user.id,
          ho_ten:    canBo.ho_ten,
          vai_tro:   MAP_VAI_TRO_PROFILE[canBo.vai_tro] ?? 'CAN_BO',
          don_vi_id: canBo.don_vi_id ?? '00000000-0000-4000-8000-000000000025',
        }, { onConflict: 'id' })
    } catch {
      // Không chặn đăng nhập nếu đồng bộ lỗi
    }

    return data as CanBo
  } catch {
    return null
  }
}

// ─── Đăng nhập ────────────────────────────────────────────────

export async function dangNhap(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email      = (formData.get('email')    as string)?.trim().toLowerCase()
  const password   = (formData.get('password') as string)
  const redirectTo = (formData.get('redirect') as string) || '/dashboard'

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email hoặc mật khẩu không đúng' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Tài khoản chưa được xác thực. Liên hệ quản trị viên.' }
    }
    return { error: 'Đăng nhập thất bại. Vui lòng thử lại.' }
  }

  redirect(redirectTo)
}

// ─── Đăng xuất ────────────────────────────────────────────────

export async function dangXuat() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
