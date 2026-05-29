'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface TaiLieu {
  id:          string
  tieu_de:     string
  mo_ta:       string | null
  loai:        string
  so_hieu:     string | null
  nam_ban_hanh:number | null
  nguon:       string | null
  file_url:    string | null
  file_name:   string | null
  file_size:   number | null
  loai_file:   string | null
  la_cong_khai:boolean
  luot_tai:    number
  tags:        string[]
  created_by:  string | null
  created_at:  string
  updated_at:  string
  deleted_at:  string | null
}

// ── Lấy danh sách ─────────────────────────────────────────────
export async function layDanhSachTaiLieu(loai?: string, tuKhoa?: string): Promise<TaiLieu[]> {
  try {
    const supabase = await createClient()
    let q = supabase
      .from('tai_lieu')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200)

    if (loai && loai !== 'TATCA') q = q.eq('loai', loai)
    if (tuKhoa?.trim()) q = q.ilike('tieu_de', `%${tuKhoa.trim()}%`)

    const { data } = await q
    return (data ?? []) as TaiLieu[]
  } catch { return [] }
}

// ── Lấy chi tiết ──────────────────────────────────────────────
export async function layTaiLieuChiTiet(id: string): Promise<TaiLieu | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tai_lieu')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    return data as TaiLieu | null
  } catch { return null }
}

// ── Thống kê ──────────────────────────────────────────────────
export async function layThongKeTaiLieu(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tai_lieu')
      .select('loai')
      .is('deleted_at', null)

    const rows = data ?? []
    const stats: Record<string, number> = { TATCA: rows.length }
    for (const row of rows) {
      stats[row.loai] = (stats[row.loai] ?? 0) + 1
    }
    return stats
  } catch { return { TATCA: 0 } }
}

// ── Thêm tài liệu ─────────────────────────────────────────────
export async function themTaiLieu(
  formData: FormData
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const svc = createServiceClient()

    const tieu_de = (formData.get('tieu_de') as string)?.trim()
    if (!tieu_de) return { success: false, message: 'Tiêu đề không được trống' }

    const namStr = formData.get('nam_ban_hanh') as string
    const tagsStr = (formData.get('tags') as string)?.trim()

    const { data, error } = await svc
      .from('tai_lieu')
      .insert({
        tieu_de,
        mo_ta:        (formData.get('mo_ta')    as string)?.trim() || null,
        loai:         (formData.get('loai')      as string) || 'KHAC',
        so_hieu:      (formData.get('so_hieu')   as string)?.trim() || null,
        nam_ban_hanh: namStr ? parseInt(namStr) : null,
        nguon:        (formData.get('nguon')     as string)?.trim() || null,
        file_url:     (formData.get('file_url')  as string)?.trim() || null,
        file_name:    (formData.get('file_name') as string)?.trim() || null,
        la_cong_khai: formData.get('la_cong_khai') !== 'false',
        tags:         tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
        created_by:   user?.email ?? null,
      })
      .select('id')
      .single()

    if (error) return { success: false, message: error.message }
    revalidatePath('/dashboard/tai-lieu')
    return { success: true, message: 'Thêm tài liệu thành công', id: data.id }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Cập nhật tài liệu ─────────────────────────────────────────
export async function capNhatTaiLieu(
  id: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const namStr = formData.get('nam_ban_hanh') as string
    const tagsStr = (formData.get('tags') as string)?.trim()

    const svc = createServiceClient()
    const { error } = await svc
      .from('tai_lieu')
      .update({
        tieu_de:      (formData.get('tieu_de')   as string)?.trim(),
        mo_ta:        (formData.get('mo_ta')      as string)?.trim() || null,
        loai:         (formData.get('loai')       as string) || 'KHAC',
        so_hieu:      (formData.get('so_hieu')    as string)?.trim() || null,
        nam_ban_hanh: namStr ? parseInt(namStr) : null,
        nguon:        (formData.get('nguon')      as string)?.trim() || null,
        file_url:     (formData.get('file_url')   as string)?.trim() || null,
        file_name:    (formData.get('file_name')  as string)?.trim() || null,
        la_cong_khai: formData.get('la_cong_khai') !== 'false',
        tags:         tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      .eq('id', id)

    if (error) return { success: false, message: error.message }
    revalidatePath('/dashboard/tai-lieu')
    revalidatePath(`/dashboard/tai-lieu/${id}`)
    return { success: true, message: 'Cập nhật thành công' }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Xoá mềm ───────────────────────────────────────────────────
export async function xoaTaiLieu(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const svc = createServiceClient()
    const { error } = await svc
      .from('tai_lieu')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, message: error.message }
    revalidatePath('/dashboard/tai-lieu')
    redirect('/dashboard/tai-lieu')
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ── Tăng lượt tải ─────────────────────────────────────────────
export async function tangLuotTai(id: string): Promise<void> {
  try {
    const svc = createServiceClient()
    // Dùng select + update để tăng luot_tai (tránh dùng RPC chưa tồn tại)
    const { data } = await svc
      .from('tai_lieu')
      .select('luot_tai')
      .eq('id', id)
      .single()
    if (data) {
      await svc
        .from('tai_lieu')
        .update({ luot_tai: ((data as { luot_tai: number }).luot_tai ?? 0) + 1 })
        .eq('id', id)
    }
  } catch { /* ignore */ }
}
