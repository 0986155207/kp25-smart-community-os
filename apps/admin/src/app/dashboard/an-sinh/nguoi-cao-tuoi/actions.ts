'use server'

import { createServiceClient } from '@/lib/supabase/server'
const createClient = () => createServiceClient()
import { revalidatePath } from 'next/cache'

export interface NguoiCaoTuoiRecord {
  id:                  string
  ho_dan_id:           string | null
  nhan_khau_id:        string | null
  ho_ten:              string
  ngay_sinh:           string
  gioi_tinh:           string | null
  so_cccd:             string | null
  dia_chi_day:         string | null
  tinh_trang_sk:       string
  benh_man_tinh:       string | null
  song_co_don:         boolean
  co_nguoi_cham_soc:   boolean
  ten_nguoi_cham_soc:  string | null
  sdt_nguoi_cham_soc:  string | null
  co_luong_huu:        boolean
  muc_luong_huu:       number | null
  co_bhyt:             boolean
  ma_the_bhyt:         string | null
  nhan_tro_cap_xh:     boolean
  muc_tro_cap_xh:      number | null
  quyet_dinh_tro_cap:  string | null
  la_liet_si:          boolean
  la_nguoi_co_cong:    boolean
  la_dtts:             boolean
  da_mat:              boolean
  ngay_mat:            string | null
  nguyen_nhan_mat:     string | null
  ghi_chu:             string | null
  ngay_cap_nhat_sk:    string | null
  tuoi?:               number
}

function tinhTuoi(ngaySinh: string): number {
  const diff = Date.now() - new Date(ngaySinh).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

// ── Lấy danh sách ────────────────────────────────────────────
export async function layDanhSachNCT(filter?: string, search?: string): Promise<NguoiCaoTuoiRecord[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('nguoi_cao_tuoi')
      .select('*')
      .is('deleted_at', null)
      .order('ngay_sinh', { ascending: true })

    // Mặc định chỉ hiện người còn sống (nếu có field da_mat)
    if (filter !== 'da_mat') {
      query = query.or('da_mat.is.null,da_mat.eq.false')
    } else {
      query = query.eq('da_mat', true)
    }

    if (filter === 'co_don')        query = query.eq('song_co_don', true)
    else if (filter === 'tro_cap')  query = query.eq('nhan_tro_cap_xh', true)
    else if (filter === 'can_cham_soc') query = query.in('tinh_trang_sk', ['CAN_CHAM_SOC', 'YEU'])
    else if (filter === 'tu_80')    query = query.lte('ngay_sinh',
      new Date(new Date().getFullYear() - 80, 0, 1).toISOString().split('T')[0])

    if (search) query = query.ilike('ho_ten', `%${search}%`)

    const { data } = await query.limit(200)
    return (data ?? []).map(r => ({
      ...r,
      da_mat:          r.da_mat          ?? false,
      ngay_mat:        r.ngay_mat        ?? null,
      nguyen_nhan_mat: r.nguyen_nhan_mat ?? null,
      la_dtts:         r.la_dtts         ?? false,
      tuoi: r.ngay_sinh ? tinhTuoi(r.ngay_sinh) : undefined,
    }))
  } catch { return [] }
}

// ── Lấy chi tiết 1 NCT ───────────────────────────────────────
export async function layChiTietNCT(id: string): Promise<NguoiCaoTuoiRecord | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('nguoi_cao_tuoi')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    if (error || !data) return null
    return {
      ...data,
      da_mat:          data.da_mat          ?? false,
      ngay_mat:        data.ngay_mat        ?? null,
      nguyen_nhan_mat: data.nguyen_nhan_mat ?? null,
      la_dtts:         data.la_dtts         ?? false,
      tuoi: data.ngay_sinh ? tinhTuoi(data.ngay_sinh) : undefined,
    }
  } catch { return null }
}

// ── Cập nhật toàn bộ hồ sơ NCT ───────────────────────────────
export async function capNhatNCT(id: string, formData: FormData) {
  const supabase = createClient()
  const daMat = formData.get('da_mat') === 'true'

  const { error } = await supabase
    .from('nguoi_cao_tuoi')
    .update({
      // Tình trạng sống
      da_mat:              daMat,
      ngay_mat:            daMat ? (formData.get('ngay_mat') as string || null) : null,
      nguyen_nhan_mat:     daMat ? (formData.get('nguyen_nhan_mat') as string || null) : null,
      // Thông tin cơ bản
      dia_chi_day:         formData.get('dia_chi_day') as string || null,
      so_cccd:             formData.get('so_cccd') as string || null,
      // Sức khỏe
      tinh_trang_sk:       formData.get('tinh_trang_sk') as string || 'ON_DINH',
      benh_man_tinh:       formData.get('benh_man_tinh') as string || null,
      ngay_cap_nhat_sk:    new Date().toISOString().split('T')[0],
      // Lương hưu
      co_luong_huu:        formData.get('co_luong_huu') === 'true',
      muc_luong_huu:       parseFloat(formData.get('muc_luong_huu') as string) || null,
      // BHYT
      co_bhyt:             formData.get('co_bhyt') === 'true',
      ma_the_bhyt:         formData.get('ma_the_bhyt') as string || null,
      // Trợ cấp xã hội
      nhan_tro_cap_xh:     formData.get('nhan_tro_cap_xh') === 'true',
      muc_tro_cap_xh:      parseFloat(formData.get('muc_tro_cap_xh') as string) || null,
      quyet_dinh_tro_cap:  formData.get('quyet_dinh_tro_cap') as string || null,
      // Người chăm sóc
      song_co_don:         formData.get('song_co_don') === 'true',
      co_nguoi_cham_soc:   formData.get('co_nguoi_cham_soc') === 'true',
      ten_nguoi_cham_soc:  formData.get('ten_nguoi_cham_soc') as string || null,
      sdt_nguoi_cham_soc:  formData.get('sdt_nguoi_cham_soc') as string || null,
      // Đặc điểm
      la_liet_si:          formData.get('la_liet_si')     === 'true',
      la_nguoi_co_cong:    formData.get('la_nguoi_co_cong') === 'true',
      la_dtts:             formData.get('la_dtts')        === 'true',
      // Ghi chú
      ghi_chu:             formData.get('ghi_chu') as string || null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  // ── Đồng bộ trạng thái "Đã mất" sang bảng nhân khẩu ────────
  const nhanKhauId = (formData.get('nhan_khau_id') as string)?.trim() || null
  if (nhanKhauId) {
    await supabase.from('nhan_khau').update({
      da_mat:     daMat,
      ngay_mat:   daMat ? (formData.get('ngay_mat') as string || null) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', nhanKhauId)
  }

  revalidatePath('/dashboard/an-sinh/nguoi-cao-tuoi')
  revalidatePath(`/dashboard/an-sinh/nguoi-cao-tuoi/${id}`)
  revalidatePath('/dashboard/an-sinh')
  revalidatePath('/dashboard/dan-cu')
  return { success: true }
}

// ── Thêm mới ─────────────────────────────────────────────────
export async function themNCT(formData: FormData) {
  const supabase = createClient()
  const { error } = await supabase.from('nguoi_cao_tuoi').insert({
    ho_ten:               formData.get('ho_ten') as string,
    ngay_sinh:            formData.get('ngay_sinh') as string,
    gioi_tinh:            formData.get('gioi_tinh') as string || null,
    so_cccd:              formData.get('so_cccd') as string || null,
    dia_chi_day:          formData.get('dia_chi_day') as string || null,
    tinh_trang_sk:        formData.get('tinh_trang_sk') as string || 'ON_DINH',
    benh_man_tinh:        formData.get('benh_man_tinh') as string || null,
    song_co_don:          formData.get('song_co_don') === 'true',
    co_nguoi_cham_soc:    formData.get('co_nguoi_cham_soc') === 'true',
    ten_nguoi_cham_soc:   formData.get('ten_nguoi_cham_soc') as string || null,
    sdt_nguoi_cham_soc:   formData.get('sdt_nguoi_cham_soc') as string || null,
    co_luong_huu:         formData.get('co_luong_huu') === 'true',
    muc_luong_huu:        parseFloat(formData.get('muc_luong_huu') as string) || null,
    co_bhyt:              formData.get('co_bhyt') === 'true',
    ma_the_bhyt:          formData.get('ma_the_bhyt') as string || null,
    nhan_tro_cap_xh:      formData.get('nhan_tro_cap_xh') === 'true',
    muc_tro_cap_xh:       parseFloat(formData.get('muc_tro_cap_xh') as string) || null,
    quyet_dinh_tro_cap:   formData.get('quyet_dinh_tro_cap') as string || null,
    la_liet_si:           formData.get('la_liet_si')      === 'true',
    la_nguoi_co_cong:     formData.get('la_nguoi_co_cong') === 'true',
    la_dtts:              formData.get('la_dtts')         === 'true',
    da_mat:               false,
    ghi_chu:              formData.get('ghi_chu') as string || null,
    ngay_cap_nhat_sk:     new Date().toISOString().split('T')[0],
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/an-sinh/nguoi-cao-tuoi')
  revalidatePath('/dashboard/an-sinh')
  return { success: true }
}

// ── Cập nhật nhanh sức khỏe ──────────────────────────────────
export async function capNhatSucKhoeNCT(id: string, sk: string) {
  const supabase = createClient()
  await supabase.from('nguoi_cao_tuoi').update({
    tinh_trang_sk:    sk,
    ngay_cap_nhat_sk: new Date().toISOString().split('T')[0],
  }).eq('id', id)
  revalidatePath('/dashboard/an-sinh/nguoi-cao-tuoi')
  revalidatePath('/dashboard/an-sinh')
}
