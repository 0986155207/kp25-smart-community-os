'use server'

import { createServiceClient } from '@/lib/supabase/server'

const PAGE_SIZE = 30

// ─── Types ────────────────────────────────────────────────────
export interface AuditLogEntry {
  id:           string
  hanh_dong:    string
  bang:         string | null
  ban_ghi_id:   string | null
  mo_ta:        string
  gia_tri_cu:   Record<string, unknown> | null
  gia_tri_moi:  Record<string, unknown> | null
  can_bo_email: string | null
  can_bo_ten:   string | null
  ip_address:   string | null
  created_at:   string
}

export interface AuditLogFilter {
  hanh_dong?:  string
  bang?:       string
  can_bo_email?: string
  tu_ngay?:    string   // ISO date string
  den_ngay?:   string
  q?:          string   // search in mo_ta
  trang?:      number
}

// ─── Lấy danh sách nhật ký ────────────────────────────────────
export async function layAuditLogs(filter: AuditLogFilter = {}): Promise<{
  data:  AuditLogEntry[]
  total: number
  trang: number
  tong_trang: number
}> {
  try {
    const svc   = createServiceClient()
    const trang = Math.max(1, filter.trang ?? 1)
    const from  = (trang - 1) * PAGE_SIZE
    const to    = from + PAGE_SIZE - 1

    let query = svc
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filter.hanh_dong)    query = query.eq('hanh_dong', filter.hanh_dong)
    if (filter.bang)         query = query.eq('bang', filter.bang)
    if (filter.can_bo_email) query = query.eq('can_bo_email', filter.can_bo_email)
    if (filter.tu_ngay)      query = query.gte('created_at', filter.tu_ngay)
    if (filter.den_ngay) {
      // Thêm 1 ngày để include cả ngày cuối
      const d = new Date(filter.den_ngay)
      d.setDate(d.getDate() + 1)
      query = query.lt('created_at', d.toISOString())
    }
    if (filter.q) query = query.ilike('mo_ta', `%${filter.q}%`)

    const { data, count, error } = await query

    if (error) throw error

    return {
      data:       (data ?? []) as AuditLogEntry[],
      total:      count ?? 0,
      trang,
      tong_trang: Math.ceil((count ?? 0) / PAGE_SIZE),
    }
  } catch (err) {
    console.error('[AuditLog] layAuditLogs:', err)
    return { data: [], total: 0, trang: 1, tong_trang: 1 }
  }
}

// ─── Danh sách cán bộ đã có trong log (cho filter) ───────────
export async function layDanhSachCanBoTrongLog(): Promise<
  Array<{ email: string; ten: string }>
> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('audit_logs')
      .select('can_bo_email, can_bo_ten')
      .not('can_bo_email', 'is', null)
      .order('can_bo_ten')

    if (!data) return []

    // Deduplicate
    const map = new Map<string, string>()
    for (const row of data) {
      if (row.can_bo_email && row.can_bo_ten) {
        map.set(row.can_bo_email, row.can_bo_ten)
      }
    }
    return Array.from(map.entries()).map(([email, ten]) => ({ email, ten }))
  } catch {
    return []
  }
}

// ─── Thống kê nhanh cho header ────────────────────────────────
export interface AuditStats {
  tongHomNay:   number
  tongTuan:     number
  xoaHomNay:   number
  dangNhapHomNay: number
}

export async function layAuditStats(): Promise<AuditStats> {
  try {
    const svc = createServiceClient()
    const now  = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [tongHomNay, tongTuan, xoaHomNay, dangNhapHomNay] = await Promise.all([
      svc.from('audit_logs').select('id', { count: 'exact', head: true })
         .gte('created_at', todayStart),
      svc.from('audit_logs').select('id', { count: 'exact', head: true })
         .gte('created_at', weekStart),
      svc.from('audit_logs').select('id', { count: 'exact', head: true })
         .eq('hanh_dong', 'XOA').gte('created_at', todayStart),
      svc.from('audit_logs').select('id', { count: 'exact', head: true })
         .eq('hanh_dong', 'DANG_NHAP').gte('created_at', todayStart),
    ])

    return {
      tongHomNay:     tongHomNay.count     ?? 0,
      tongTuan:       tongTuan.count       ?? 0,
      xoaHomNay:     xoaHomNay.count      ?? 0,
      dangNhapHomNay: dangNhapHomNay.count ?? 0,
    }
  } catch {
    return { tongHomNay: 0, tongTuan: 0, xoaHomNay: 0, dangNhapHomNay: 0 }
  }
}
