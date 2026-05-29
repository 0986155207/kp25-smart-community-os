/**
 * GET /api/setup/check-tables
 * Kiểm tra các bảng An sinh đã tồn tại chưa
 */
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  const checks = await Promise.all([
    supabase.from('bhyt').select('id').limit(1),
    supabase.from('ho_ngheo').select('id').limit(1),
    supabase.from('nguoi_cao_tuoi').select('id').limit(1),
  ])

  const tables = {
    bhyt:           checks[0].error?.code !== 'PGRST205' && checks[0].error?.code !== '42P01',
    ho_ngheo:       checks[1].error?.code !== 'PGRST205' && checks[1].error?.code !== '42P01',
    nguoi_cao_tuoi: checks[2].error?.code !== 'PGRST205' && checks[2].error?.code !== '42P01',
  }

  // Nếu bảng tồn tại, lấy số lượng bản ghi
  const counts = {
    bhyt:           tables.bhyt           ? (await supabase.from('bhyt').select('id', { count: 'exact', head: true }).is('deleted_at', null)).count ?? 0 : 0,
    ho_ngheo:       tables.ho_ngheo       ? (await supabase.from('ho_ngheo').select('id', { count: 'exact', head: true }).is('deleted_at', null)).count ?? 0 : 0,
    nguoi_cao_tuoi: tables.nguoi_cao_tuoi ? (await supabase.from('nguoi_cao_tuoi').select('id', { count: 'exact', head: true }).is('deleted_at', null)).count ?? 0 : 0,
  }

  const allReady = Object.values(tables).every(Boolean)

  return NextResponse.json({ allReady, tables, counts })
}
