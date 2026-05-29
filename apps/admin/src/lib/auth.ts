'use server'

// Trong file 'use server', CHỈ được export async functions (Server Actions)
// Types và constants phải import từ auth-config.ts

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { CanBo } from './auth-config'

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
