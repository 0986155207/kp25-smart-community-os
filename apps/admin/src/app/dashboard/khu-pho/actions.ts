'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ghiAuditLog } from '@/lib/audit'

// ════════════════════════════════════════════════════════════
//  KIỂU DỮ LIỆU
// ════════════════════════════════════════════════════════════

export interface DonViItem {
  id: string
  ma: string
  ten: string
  ten_day_du: string | null
  loai: string
  phuong: string
  slug: string | null
  dia_chi: string | null
  truong_kp_ten: string | null
  truong_kp_sdt: string | null
  bi_thu_ten: string | null
  bi_thu_sdt: string | null
  mau_chu_dao: string | null
  logo_url: string | null
  thu_tu: number
  is_active: boolean
  ghi_chu: string | null
  created_at: string
  // Thống kê (đếm động)
  so_ho: number
  so_nhan_khau: number
  so_can_bo: number
}

export interface DuLieuDonVi {
  ma: string
  ten: string
  ten_day_du?: string
  loai?: string
  phuong?: string
  slug?: string
  dia_chi?: string
  truong_kp_ten?: string
  truong_kp_sdt?: string
  bi_thu_ten?: string
  bi_thu_sdt?: string
  mau_chu_dao?: string
  logo_url?: string
  thu_tu?: number
  is_active?: boolean
  ghi_chu?: string
}

export interface KetQua {
  thanhCong: boolean
  thongBao: string
  id?: string
}

// Chuẩn hóa mã màu hex — sai định dạng thì dùng màu mặc định
function chuanHoaMau(v?: string): string {
  const m = (v ?? '').trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(m) ? m : '#8B1A1A'
}

// ════════════════════════════════════════════════════════════
//  DANH SÁCH ĐƠN VỊ (kèm thống kê)
// ════════════════════════════════════════════════════════════
// Đếm an toàn — không bao giờ ném lỗi (tránh 503 cả trang)
async function demAnToan(
  svc: ReturnType<typeof createServiceClient>,
  bang: string,
  donViId: string,
  loaiBoXoa: boolean,
): Promise<number> {
  try {
    let q = svc.from(bang).select('id', { count: 'exact', head: true }).eq('don_vi_id', donViId)
    if (loaiBoXoa) q = q.is('deleted_at', null)
    const { count, error } = await q
    if (error) {
      console.error(`[KhuPho] Lỗi đếm ${bang}:`, error.message)
      return 0
    }
    return count ?? 0
  } catch (err) {
    console.error(`[KhuPho] Ngoại lệ đếm ${bang}:`, err)
    return 0
  }
}

export async function layDanhSachDonVi(): Promise<DonViItem[]> {
  try {
    const svc = createServiceClient()

    const { data: dsDonVi, error } = await svc
      .from('don_vi')
      .select('*')
      .is('deleted_at', null)
      .order('thu_tu', { ascending: true })

    if (error || !dsDonVi) {
      console.error('[KhuPho] Lỗi lấy danh sách:', error?.message)
      return []
    }

    // Đếm hộ / nhân khẩu / cán bộ theo từng đơn vị (tuần tự từng đơn vị,
    // song song 3 bảng) — mỗi phép đếm chống lỗi riêng, không làm sập trang.
    const ket: DonViItem[] = []
    for (const dv of dsDonVi) {
      const [so_ho, so_nhan_khau, so_can_bo] = await Promise.all([
        demAnToan(svc, 'ho_dan', dv.id, true),
        demAnToan(svc, 'nhan_khau', dv.id, true),
        demAnToan(svc, 'can_bo', dv.id, false),
      ])

      ket.push({
        id: dv.id,
        ma: dv.ma,
        ten: dv.ten,
        ten_day_du: dv.ten_day_du,
        loai: dv.loai,
        phuong: dv.phuong,
        slug: dv.slug,
        dia_chi: dv.dia_chi,
        truong_kp_ten: dv.truong_kp_ten,
        truong_kp_sdt: dv.truong_kp_sdt,
        bi_thu_ten: dv.bi_thu_ten,
        bi_thu_sdt: dv.bi_thu_sdt,
        mau_chu_dao: dv.mau_chu_dao,
        logo_url: dv.logo_url,
        thu_tu: dv.thu_tu,
        is_active: dv.is_active,
        ghi_chu: dv.ghi_chu,
        created_at: dv.created_at,
        so_ho,
        so_nhan_khau,
        so_can_bo,
      })
    }

    return ket
  } catch (err) {
    console.error('[KhuPho] Ngoại lệ layDanhSachDonVi:', err)
    return []
  }
}

// ════════════════════════════════════════════════════════════
//  TẠO ĐƠN VỊ MỚI
// ════════════════════════════════════════════════════════════
export async function taoDonVi(duLieu: DuLieuDonVi): Promise<KetQua> {
  const svc = createServiceClient()

  const ma = duLieu.ma?.trim().toUpperCase()
  const ten = duLieu.ten?.trim()
  if (!ma || !ten) {
    return { thanhCong: false, thongBao: 'Vui lòng nhập mã và tên khu phố.' }
  }

  // Kiểm tra trùng mã
  const { data: trung } = await svc
    .from('don_vi').select('id').eq('ma', ma).is('deleted_at', null).maybeSingle()
  if (trung) {
    return { thanhCong: false, thongBao: `Mã "${ma}" đã tồn tại. Vui lòng dùng mã khác.` }
  }

  const slug = (duLieu.slug?.trim() || ma).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data, error } = await svc
    .from('don_vi')
    .insert({
      ma,
      ten,
      ten_day_du:    duLieu.ten_day_du?.trim() || `${ten}, ${duLieu.phuong?.trim() || 'Phường Long Trường'}, TP. Hồ Chí Minh`,
      loai:          duLieu.loai || 'KHU_PHO',
      phuong:        duLieu.phuong?.trim() || 'Phường Long Trường',
      slug,
      dia_chi:       duLieu.dia_chi?.trim() || null,
      truong_kp_ten: duLieu.truong_kp_ten?.trim() || null,
      truong_kp_sdt: duLieu.truong_kp_sdt?.trim() || null,
      bi_thu_ten:    duLieu.bi_thu_ten?.trim() || null,
      bi_thu_sdt:    duLieu.bi_thu_sdt?.trim() || null,
      mau_chu_dao:   chuanHoaMau(duLieu.mau_chu_dao),
      logo_url:      duLieu.logo_url?.trim() || null,
      thu_tu:        duLieu.thu_tu ?? 0,
      is_active:     duLieu.is_active ?? true,
      ghi_chu:       duLieu.ghi_chu?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[KhuPho] Lỗi tạo:', error?.message)
    return { thanhCong: false, thongBao: 'Không thể tạo khu phố. ' + (error?.message ?? '') }
  }

  await ghiAuditLog({
    hanh_dong: 'TAO',
    bang: 'he_thong',
    ban_ghi_id: data.id,
    mo_ta: `Tạo khu phố mới: ${ten} (${ma})`,
  })

  revalidatePath('/dashboard/khu-pho')
  return { thanhCong: true, thongBao: `Đã tạo khu phố "${ten}".`, id: data.id }
}

// ════════════════════════════════════════════════════════════
//  CẬP NHẬT ĐƠN VỊ
// ════════════════════════════════════════════════════════════
export async function capNhatDonVi(id: string, duLieu: DuLieuDonVi): Promise<KetQua> {
  const svc = createServiceClient()

  const ten = duLieu.ten?.trim()
  if (!ten) {
    return { thanhCong: false, thongBao: 'Tên khu phố không được để trống.' }
  }

  const { error } = await svc
    .from('don_vi')
    .update({
      ten,
      ten_day_du:    duLieu.ten_day_du?.trim() || null,
      loai:          duLieu.loai || 'KHU_PHO',
      phuong:        duLieu.phuong?.trim() || 'Phường Long Trường',
      slug:          duLieu.slug?.trim() || null,
      dia_chi:       duLieu.dia_chi?.trim() || null,
      truong_kp_ten: duLieu.truong_kp_ten?.trim() || null,
      truong_kp_sdt: duLieu.truong_kp_sdt?.trim() || null,
      bi_thu_ten:    duLieu.bi_thu_ten?.trim() || null,
      bi_thu_sdt:    duLieu.bi_thu_sdt?.trim() || null,
      mau_chu_dao:   chuanHoaMau(duLieu.mau_chu_dao),
      logo_url:      duLieu.logo_url?.trim() || null,
      thu_tu:        duLieu.thu_tu ?? 0,
      is_active:     duLieu.is_active ?? true,
      ghi_chu:       duLieu.ghi_chu?.trim() || null,
    })
    .eq('id', id)

  if (error) {
    console.error('[KhuPho] Lỗi cập nhật:', error.message)
    return { thanhCong: false, thongBao: 'Không thể cập nhật. ' + error.message }
  }

  await ghiAuditLog({
    hanh_dong: 'CAP_NHAT',
    bang: 'he_thong',
    ban_ghi_id: id,
    mo_ta: `Cập nhật khu phố: ${ten}`,
  })

  revalidatePath('/dashboard/khu-pho')
  return { thanhCong: true, thongBao: `Đã cập nhật "${ten}".` }
}

// ════════════════════════════════════════════════════════════
//  XÓA (mềm) ĐƠN VỊ — chặn nếu còn dữ liệu
// ════════════════════════════════════════════════════════════
export async function xoaDonVi(id: string): Promise<KetQua> {
  const svc = createServiceClient()

  // Không cho xóa KP25 (đơn vị mặc định)
  const KP25 = '00000000-0000-4000-8000-000000000025'
  if (id === KP25) {
    return { thanhCong: false, thongBao: 'Không thể xóa Khu phố 25 (đơn vị mặc định của hệ thống).' }
  }

  // Chặn xóa nếu còn hộ dân thuộc khu phố
  const { count } = await svc
    .from('ho_dan').select('id', { count: 'exact', head: true })
    .eq('don_vi_id', id).is('deleted_at', null)

  if ((count ?? 0) > 0) {
    return {
      thanhCong: false,
      thongBao: `Khu phố còn ${count} hộ dân. Vui lòng chuyển/xử lý dữ liệu trước khi xóa.`,
    }
  }

  const { error } = await svc
    .from('don_vi')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)

  if (error) {
    return { thanhCong: false, thongBao: 'Không thể xóa. ' + error.message }
  }

  await ghiAuditLog({
    hanh_dong: 'XOA',
    bang: 'he_thong',
    ban_ghi_id: id,
    mo_ta: `Xóa khu phố #${id}`,
  })

  revalidatePath('/dashboard/khu-pho')
  return { thanhCong: true, thongBao: 'Đã xóa khu phố.' }
}
