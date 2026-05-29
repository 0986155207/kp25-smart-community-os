/**
 * GET /api/ho-dan?q=<search>
 * Trả về danh sách hộ dân (id, ma_ho, chu_ho, dia_chi_day) để dùng trong combobox
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  try {
    const supabase = createServiceClient()

    let query = supabase
      .from('ho_dan')
      .select('id, ma_ho, chu_ho, dia_chi_day')
      .is('deleted_at', null)
      .order('chu_ho', { ascending: true })
      .limit(50)

    if (q) {
      // Tìm theo tên chủ hộ hoặc địa chỉ
      query = query.or(`chu_ho.ilike.%${q}%,dia_chi_day.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('[/api/ho-dan] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[/api/ho-dan] Unexpected error:', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
