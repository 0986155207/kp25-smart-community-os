'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { layCanBoHienTai }      from '@/lib/auth'

// ─── Loại hành động ────────────────────────────────────────
export type HanhDong =
  | 'DANG_NHAP'
  | 'DANG_XUAT'
  | 'TAO'
  | 'CAP_NHAT'
  | 'XOA'
  | 'XUAT_KHAU'
  | 'XEM_CHI_TIET'
  | 'GUI_THONG_BAO'

// ─── Tên bảng dùng trong audit ──────────────────────────────
export type TenBang =
  | 'phan_anh'
  | 'ho_dan'
  | 'nhan_khau'
  | 'thong_bao'
  | 'su_kien'
  | 'can_bo'
  | 'bhyt'
  | 'ho_ngheo'
  | 'nguoi_cao_tuoi'
  | 'tai_lieu'
  | 'dang_ky_tam_tru'
  | 'dang_ky_tam_vang'
  | 'he_thong'

export interface AuditParams {
  hanh_dong:    HanhDong
  bang?:        TenBang
  ban_ghi_id?:  string
  mo_ta:        string   // Mô tả tiếng Việt rõ ràng: "Cập nhật PA #123 → Đang xử lý"
  gia_tri_cu?:  Record<string, unknown>
  gia_tri_moi?: Record<string, unknown>
  // Nếu không truyền thì tự lấy từ session
  can_bo_id?:   string
  can_bo_email?: string
  can_bo_ten?:  string
}

// ─── Ghi nhật ký hoạt động ────────────────────────────────
// Fire-and-forget: không throw, không block action chính
export async function ghiAuditLog(params: AuditParams): Promise<void> {
  try {
    const svc = createServiceClient()

    // Lấy thông tin cán bộ từ session (nếu chưa có)
    let canBoId    = params.can_bo_id
    let canBoEmail = params.can_bo_email
    let canBoTen   = params.can_bo_ten

    if (!canBoId) {
      const canBo = await layCanBoHienTai()
      if (canBo) {
        canBoId    = canBo.id
        canBoEmail = canBo.email
        canBoTen   = canBo.ho_ten
      }
    }

    await svc.from('audit_logs').insert({
      hanh_dong:    params.hanh_dong,
      bang:         params.bang         ?? null,
      ban_ghi_id:   params.ban_ghi_id   ?? null,
      mo_ta:        params.mo_ta,
      gia_tri_cu:   params.gia_tri_cu   ?? null,
      gia_tri_moi:  params.gia_tri_moi  ?? null,
      can_bo_id:    canBoId             ?? null,
      can_bo_email: canBoEmail          ?? null,
      can_bo_ten:   canBoTen            ?? null,
    })
  } catch (err) {
    // Audit log không được làm gián đoạn action chính
    console.error('[Audit] Lỗi ghi nhật ký:', err)
  }
}
