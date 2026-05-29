'use server'

import { createServiceClient } from '@/lib/supabase/server'

// ── Giao diện lịch sử ─────────────────────────────────────────
export interface LichSuPush {
  id:             string
  tieu_de:        string
  noi_dung:       string
  url_dich:       string | null
  so_thiet_bi:    number
  so_thanh_cong:  number
  so_loi:         number
  nguoi_gui:      string
  created_at:     string
}

export interface ThongKePush {
  tong_thiet_bi:  number
  thiet_bi_hoat_dong: number
  so_lan_gui:     number
}

// ── Lấy lịch sử gửi push ─────────────────────────────────────
export async function layLichSuPush(limit = 20): Promise<LichSuPush[]> {
  const svc = createServiceClient()
  const { data } = await svc
    .from('push_lich_su')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as LichSuPush[]
}

// ── Thống kê ─────────────────────────────────────────────────
export async function layThongKePush(): Promise<ThongKePush> {
  const svc = createServiceClient()

  const [allSubs, activeSubs, history] = await Promise.all([
    svc.from('push_subscriptions').select('id', { count: 'exact', head: true }),
    svc.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('active', true),
    svc.from('push_lich_su').select('id', { count: 'exact', head: true }),
  ])

  return {
    tong_thiet_bi:       allSubs.count    ?? 0,
    thiet_bi_hoat_dong:  activeSubs.count ?? 0,
    so_lan_gui:          history.count    ?? 0,
  }
}
