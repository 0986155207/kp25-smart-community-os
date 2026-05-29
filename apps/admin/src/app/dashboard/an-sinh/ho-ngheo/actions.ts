'use server'

import { createServiceClient } from '@/lib/supabase/server'
const createClient = () => createServiceClient()
import { revalidatePath } from 'next/cache'

export interface HoNgheoRecord {
  id:                string
  ho_dan_id:         string | null
  loai:              string
  trang_thai:        string
  nam_xet_duyet:     number
  quyet_dinh_so:     string | null
  ngay_quyet_dinh:   string | null
  ngay_het_han:      string | null
  thu_nhap_bq:       number | null
  so_thanh_vien:     number | null
  ly_do_ngheo:       string | null
  ho_tro_bhyt:       boolean
  ho_tro_giao_duc:   boolean
  ho_tro_nha_o:      boolean
  so_tien_ho_tro:    number | null
  ngay_thoat_ngheo:  string | null
  ly_do_thoat_ngheo: string | null
  ghi_chu:           string | null
  // join
  chu_ho?:           string | null
  dia_chi_day?:      string | null
}


export async function layDanhSachHoNgheo(
  loai?: string, nam?: number, search?: string,
): Promise<HoNgheoRecord[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('ho_ngheo')
      .select('*, ho_dan(chu_ho, dia_chi_day)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (loai)   query = query.eq('loai', loai)
    if (nam)    query = query.eq('nam_xet_duyet', nam)
    if (search) query = query.ilike('ho_dan.chu_ho', `%${search}%`)

    const { data } = await query.limit(200)
    return (data ?? []).map(r => ({
      ...r,
      chu_ho:     (r.ho_dan as { chu_ho?: string; dia_chi_day?: string } | null)?.chu_ho ?? null,
      dia_chi_day:(r.ho_dan as { chu_ho?: string; dia_chi_day?: string } | null)?.dia_chi_day ?? null,
    }))
  } catch { return [] }
}

export async function themHoNgheo(formData: FormData) {
  const supabase = createClient()
  const hoDanId = (formData.get('ho_dan_id') as string) || null
  const { error } = await supabase.from('ho_ngheo').insert({
    ho_dan_id:         hoDanId,
    loai:              formData.get('loai') as string,
    trang_thai:        'DANG_HUONG',
    nam_xet_duyet:     parseInt(formData.get('nam_xet_duyet') as string),
    quyet_dinh_so:     formData.get('quyet_dinh_so') as string || null,
    ngay_quyet_dinh:   formData.get('ngay_quyet_dinh') as string || null,
    ngay_het_han:      formData.get('ngay_het_han') as string || null,
    thu_nhap_bq:       parseFloat(formData.get('thu_nhap_bq') as string) || null,
    so_thanh_vien:     parseInt(formData.get('so_thanh_vien') as string) || null,
    ly_do_ngheo:       formData.get('ly_do_ngheo') as string || null,
    thieu_y_te:        formData.get('thieu_y_te')      === 'true',
    thieu_gd:          formData.get('thieu_gd')        === 'true',
    thieu_nha_o:       formData.get('thieu_nha_o')     === 'true',
    thieu_nc_vs:       formData.get('thieu_nc_vs')     === 'true',
    thieu_thong_tin:   formData.get('thieu_thong_tin') === 'true',
    ho_tro_bhyt:       formData.get('ho_tro_bhyt')     === 'true',
    ho_tro_giao_duc:   formData.get('ho_tro_giao_duc') === 'true',
    ho_tro_nha_o:      formData.get('ho_tro_nha_o')    === 'true',
    so_tien_ho_tro:    parseFloat(formData.get('so_tien_ho_tro') as string) || null,
    ghi_chu:           formData.get('ghi_chu') as string || null,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/an-sinh/ho-ngheo')
  revalidatePath('/dashboard/an-sinh')
  return { success: true }
}

export async function capNhatTrangThaiHoNgheo(id: string, trangThai: string, ngayThoatNgheo?: string) {
  const supabase = createClient()
  await supabase.from('ho_ngheo').update({
    trang_thai:        trangThai,
    ngay_thoat_ngheo:  ngayThoatNgheo ?? null,
  }).eq('id', id)
  revalidatePath('/dashboard/an-sinh/ho-ngheo')
  revalidatePath('/dashboard/an-sinh')
}
