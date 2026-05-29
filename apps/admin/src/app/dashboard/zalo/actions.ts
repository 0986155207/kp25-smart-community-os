'use server'

import { revalidatePath }         from 'next/cache'
import { createClient }           from '@/lib/supabase/server'
import { layCanBoHienTai }        from '@/lib/auth'

// ─── Tạo broadcast mới ───────────────────────────────────────
export interface TaoBroadcastInput {
  tieuDe:       string
  noiDung:      string
  noiDungNhom?: string   // phiên bản Group rút gọn
  loai:         'TEXT' | 'THONG_BAO' | 'SU_KIEN' | 'PHAN_ANH'
  kenh:         string[] // ['OA'] | ['GROUP'] | ['OA','GROUP']
  scheduledAt?: string   // ISO string, null = gửi ngay
}

export async function taoBroadcast(input: TaoBroadcastInput) {
  const canBo = await layCanBoHienTai()
  if (!canBo) throw new Error('Chưa đăng nhập')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('zalo_broadcasts')
    .insert({
      tieu_de:       input.tieuDe,
      noi_dung:      input.noiDung,
      noi_dung_nhom: input.noiDungNhom ?? null,
      loai:          input.loai,
      kenh:          input.kenh,
      trang_thai:    input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      scheduled_at:  input.scheduledAt ?? null,
      created_by:    canBo.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/zalo')
  return data
}

// ─── Gửi broadcast (trigger API) ─────────────────────────────
export async function guiBroadcast(broadcastId: string) {
  const canBo = await layCanBoHienTai()
  if (!canBo) throw new Error('Chưa đăng nhập')

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

  // Lấy session token để gọi API
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Chưa đăng nhập')

  const res = await fetch(`${baseUrl}/api/zalo/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Cookie':        `sb-access-token=${session.access_token}`,
    },
    body: JSON.stringify({ broadcastId }),
  })

  const result = await res.json() as { ok: boolean; error?: string }
  if (!result.ok) throw new Error(result.error ?? 'Gửi thất bại')

  revalidatePath('/dashboard/zalo')
  return result
}

// ─── Đánh dấu Group message đã copy (trang_thai = COPIED) ────
export async function danhDauDaCopy(broadcastId: string) {
  const _canBo = await layCanBoHienTai()
  if (!_canBo) throw new Error('Chưa đăng nhập')
  const supabase = await createClient()

  const { error } = await supabase
    .from('zalo_broadcasts')
    .update({
      trang_thai: 'COPIED',
      copied_at:  new Date().toISOString(),
    })
    .eq('id', broadcastId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/zalo')
}

// ─── Xoá broadcast (soft delete) ─────────────────────────────
export async function xoaBroadcast(broadcastId: string) {
  const _canBo = await layCanBoHienTai()
  if (!_canBo) throw new Error('Chưa đăng nhập')
  const supabase = await createClient()

  const { error } = await supabase
    .from('zalo_broadcasts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', broadcastId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/zalo')
}

// ─── Lấy thống kê OA config (trạng thái OA) ──────────────────
export async function layOAConfig() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('zalo_oa_config')
    .select('*')
    .single()
  return data
}

// ─── Đếm followers đang active ───────────────────────────────
export async function demFollowers(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('zalo_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('following', true)
  return count ?? 0
}

// ─── Lấy danh sách messages inbound chưa trả lời ─────────────
export async function layTinNhanChuaTraLoi() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('zalo_messages')
    .select('*')
    .eq('direction', 'INBOUND')
    .eq('trang_thai', 'RECEIVED')
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

// ─── Gửi tin nhắn CS trả lời (qua web API route) ─────────────
export async function traLoiTinNhan({
  userId,
  text,
  messageId,
}: {
  userId: string
  text: string
  messageId: string
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Chưa đăng nhập')

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/zalo/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-access-token=${session.access_token}`,
    },
    body: JSON.stringify({ userId, text, messageId }),
  })

  const result = await res.json() as { ok: boolean; error?: string }
  if (!result.ok) throw new Error(result.error ?? 'Gửi thất bại')

  revalidatePath('/dashboard/zalo')
  return result
}
