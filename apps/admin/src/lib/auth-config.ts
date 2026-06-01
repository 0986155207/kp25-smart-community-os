// ─── Types & Constants cho Auth/RBAC ──────────────────────────
// File này KHÔNG có 'use server' → dùng được ở cả Server và Client Components

export type VaiTro =
  | 'BI_THU'
  | 'TRUONG_KHU_PHO'
  | 'CONG_AN'
  | 'AN_NINH'
  | 'PHU_TRACH_NCT'

export interface CanBo {
  id:            string
  email:         string
  ho_ten:        string
  vai_tro:       VaiTro
  chuc_vu:       string | null
  so_dien_thoai: string | null
  ghi_chu:       string | null
  hoat_dong:     boolean
  created_at:    string
}

// ── Nhãn hiển thị ─────────────────────────────────────────────

export const VAI_TRO_LABEL: Record<VaiTro, string> = {
  BI_THU:         'Bí thư chi bộ',
  TRUONG_KHU_PHO: 'Trưởng khu phố',
  CONG_AN:        'Công an khu vực',
  AN_NINH:        'An ninh khu phố',
  PHU_TRACH_NCT:  'Phụ trách NCT',
}

export const VAI_TRO_COLOR: Record<VaiTro, string> = {
  BI_THU:         'bg-red-100 text-red-800',
  TRUONG_KHU_PHO: 'bg-blue-100 text-blue-800',
  CONG_AN:        'bg-slate-100 text-slate-800',
  AN_NINH:        'bg-amber-100 text-amber-800',
  PHU_TRACH_NCT:  'bg-emerald-100 text-emerald-800',
}

// ── Quyền truy cập theo path ───────────────────────────────────

export const QUYEN_TRUY_CAP: Record<string, VaiTro[]> = {
  '/dashboard':             ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/bao-cao':     ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/ai':          ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/ai/phan-tich':['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/tai-lieu':    ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/huong-dan':   ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
  '/dashboard/phan-anh':    ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH'],
  '/dashboard/dan-cu':      ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/su-kien-nhanh': ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/ho-so-thieu':   ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/quet-cccd':     ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/phieu-ke-khai': ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/duyet-cap-nhat':['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/dan-cu/chien-dich-tu-khai': ['BI_THU', 'TRUONG_KHU_PHO'],
  '/dashboard/dan-cu/duyet-ho-moi':   ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
  '/dashboard/thong-bao':   ['BI_THU', 'TRUONG_KHU_PHO'],
  '/dashboard/ban-do':      ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH'],
  '/dashboard/an-sinh':                ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT'],
  '/dashboard/an-sinh/bhyt':           ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT'],
  '/dashboard/an-sinh/ho-ngheo':       ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT'],
  '/dashboard/an-sinh/nguoi-cao-tuoi': ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT'],
  '/dashboard/cai-dat':     ['BI_THU', 'TRUONG_KHU_PHO'],
  '/dashboard/phan-quyen':  ['BI_THU'],
  '/dashboard/setup':       ['BI_THU'],
}

// ── Kiểm tra quyền ────────────────────────────────────────────

export function coQuyen(vaiTro: VaiTro | undefined, path: string): boolean {
  if (!vaiTro) return false
  const allowed = QUYEN_TRUY_CAP[path]
  if (!allowed) return vaiTro === 'BI_THU'
  return allowed.includes(vaiTro)
}
