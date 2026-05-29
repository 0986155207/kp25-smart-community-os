'use server'

import { createServiceClient } from '@/lib/supabase/server'
const createClient = () => createServiceClient()
import { revalidatePath } from 'next/cache'

export interface BhytRecord {
  id:            string
  ho_dan_id:     string | null
  ho_ten:        string
  ngay_sinh:     string | null
  gioi_tinh:     string | null
  so_cccd:       string | null
  ma_the_bhyt:   string | null
  doi_tuong:     string
  noi_dang_ky_kcb: string | null
  phan_tram_huong: number
  han_the_tu:    string | null
  han_the_den:   string | null
  trang_thai:    string
  co_quan_dong:  string | null
  muc_dong_thang: number | null
  ghi_chu:       string | null
  // join
  chu_ho?:       string | null
}


export async function layDanhSachBHYT(filter?: string, search?: string): Promise<BhytRecord[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('bhyt')
      .select('*, ho_dan(chu_ho)')
      .is('deleted_at', null)
      .order('han_the_den', { ascending: true })

    if (filter === 'sap_het_han') query = query.eq('trang_thai', 'SAP_HET_HAN')
    else if (filter === 'het_han') query = query.eq('trang_thai', 'HET_HAN')
    else if (filter === 'chua_co') query = query.eq('trang_thai', 'CHUA_CO')
    else if (filter === 'con_han') query = query.eq('trang_thai', 'CON_HAN')

    if (search) query = query.ilike('ho_ten', `%${search}%`)

    const { data } = await query.limit(200)
    return (data ?? []).map(r => ({
      ...r,
      chu_ho: (r.ho_dan as { chu_ho?: string } | null)?.chu_ho ?? null,
    }))
  } catch { return [] }
}

export async function themBHYT(formData: FormData) {
  const supabase = createClient()
  const payload = {
    ho_ten:          formData.get('ho_ten') as string,
    ngay_sinh:       formData.get('ngay_sinh') as string || null,
    gioi_tinh:       formData.get('gioi_tinh') as string || null,
    so_cccd:         formData.get('so_cccd') as string || null,
    ma_the_bhyt:     formData.get('ma_the_bhyt') as string || null,
    doi_tuong:       formData.get('doi_tuong') as string,
    noi_dang_ky_kcb: formData.get('noi_dang_ky_kcb') as string || null,
    phan_tram_huong: parseInt(formData.get('phan_tram_huong') as string) || 80,
    han_the_tu:      formData.get('han_the_tu') as string || null,
    han_the_den:     formData.get('han_the_den') as string || null,
    trang_thai:      formData.get('trang_thai') as string || 'CON_HAN',
    co_quan_dong:    formData.get('co_quan_dong') as string || null,
    ghi_chu:         formData.get('ghi_chu') as string || null,
  }
  const { error } = await supabase.from('bhyt').insert(payload)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/an-sinh/bhyt')
  revalidatePath('/dashboard/an-sinh')
  return { success: true }
}

export async function capNhatTrangThaiBHYT(id: string, trangThai: string) {
  const supabase = createClient()
  const { error } = await supabase.from('bhyt').update({ trang_thai: trangThai }).eq('id', id)
  if (error) return { success: false }
  revalidatePath('/dashboard/an-sinh/bhyt')
  revalidatePath('/dashboard/an-sinh')
  return { success: true }
}

export async function xoaBHYT(id: string) {
  const supabase = createClient()
  await supabase.from('bhyt').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/dashboard/an-sinh/bhyt')
  revalidatePath('/dashboard/an-sinh')
}
