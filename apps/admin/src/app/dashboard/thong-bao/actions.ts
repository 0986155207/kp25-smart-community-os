'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ghiAuditLog } from '@/lib/audit'

// ─── Tạo thông báo mới ────────────────────────────────────────
export async function taoThongBao(formData: {
  tieuDe: string
  noiDung: string
  loai: string
  anhUrl?: string
  ghimLen: boolean
  ngayHetHan?: string
}): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('thong_bao')
      .insert({
        tieu_de: formData.tieuDe.trim(),
        noi_dung: formData.noiDung.trim(),
        loai: formData.loai,
        anh_url: formData.anhUrl || null,
        ghim_len: formData.ghimLen,
        ngay_het_han: formData.ngayHetHan || null,
        luot_xem: 0,
        da_gui_push: false,
        da_gui_zalo: false,
        da_gui_sms: false,
      })
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/dashboard/thong-bao')
    revalidatePath('/')
    ghiAuditLog({ hanh_dong: 'TAO', bang: 'thong_bao', ban_ghi_id: data.id, mo_ta: `Tạo thông báo: "${formData.tieuDe.slice(0, 60)}"` }).catch(() => {})
    return { success: true, message: 'Đã tạo thông báo thành công', id: data.id }
  } catch (err) {
    console.error('taoThongBao error:', err)
    return { success: false, message: 'Không thể tạo thông báo. Vui lòng thử lại.' }
  }
}

// ─── Cập nhật thông báo ───────────────────────────────────────
export async function capNhatThongBao(
  id: string,
  formData: {
    tieuDe: string
    noiDung: string
    loai: string
    anhUrl?: string
    ghimLen: boolean
    ngayHetHan?: string
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('thong_bao')
      .update({
        tieu_de: formData.tieuDe.trim(),
        noi_dung: formData.noiDung.trim(),
        loai: formData.loai,
        anh_url: formData.anhUrl || null,
        ghim_len: formData.ghimLen,
        ngay_het_han: formData.ngayHetHan || null,
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/thong-bao')
    revalidatePath(`/dashboard/thong-bao/${id}`)
    revalidatePath('/')
    return { success: true, message: 'Cập nhật thông báo thành công' }
  } catch (err) {
    console.error('capNhatThongBao error:', err)
    return { success: false, message: 'Không thể cập nhật. Vui lòng thử lại.' }
  }
}

// ─── Ghim / bỏ ghim ───────────────────────────────────────────
export async function toggleGhim(
  id: string,
  ghimLen: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('thong_bao')
      .update({ ghim_len: ghimLen })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/thong-bao')
    revalidatePath('/')
    return {
      success: true,
      message: ghimLen ? 'Đã ghim thông báo' : 'Đã bỏ ghim thông báo',
    }
  } catch (err) {
    console.error('toggleGhim error:', err)
    return { success: false, message: 'Không thể thực hiện. Vui lòng thử lại.' }
  }
}

// ─── Xoá mềm ──────────────────────────────────────────────────
export async function xoaThongBao(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('thong_bao')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/thong-bao')
    revalidatePath('/')
    return { success: true, message: 'Đã xoá thông báo' }
  } catch (err) {
    console.error('xoaThongBao error:', err)
    return { success: false, message: 'Không thể xoá. Vui lòng thử lại.' }
  }
}

// ─── Xoá + redirect (dùng trong form action) ─────────────────
export async function xoaThongBaoVaRedirect(id: string) {
  await xoaThongBao(id)
  redirect('/dashboard/thong-bao')
}

// ─── Đánh dấu đã gửi push notification ───────────────────────
export async function danhDauDaGuiPush(
  id: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    await supabase
      .from('thong_bao')
      .update({ da_gui_push: true })
      .eq('id', id)
    revalidatePath(`/dashboard/thong-bao/${id}`)
    revalidatePath('/dashboard/thong-bao')
    return { success: true }
  } catch {
    return { success: false }
  }
}
