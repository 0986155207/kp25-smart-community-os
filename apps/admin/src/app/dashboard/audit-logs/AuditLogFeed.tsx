'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, User } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { AuditLogEntry } from './actions'

// ─── Config hiển thị theo hành động ──────────────────────────
const HANH_DONG_CFG: Record<string, {
  label: string
  color: string
  bg: string
  dot: string
}> = {
  TAO:            { label: 'Tạo mới',       color: 'text-emerald-700', bg: 'bg-emerald-100',  dot: 'bg-emerald-500'  },
  CAP_NHAT:       { label: 'Cập nhật',      color: 'text-blue-700',    bg: 'bg-blue-100',     dot: 'bg-blue-500'     },
  XOA:            { label: 'Xóa',           color: 'text-red-700',     bg: 'bg-red-100',      dot: 'bg-red-500'      },
  DANG_NHAP:      { label: 'Đăng nhập',     color: 'text-violet-700',  bg: 'bg-violet-100',   dot: 'bg-violet-500'   },
  DANG_XUAT:      { label: 'Đăng xuất',     color: 'text-slate-600',   bg: 'bg-slate-100',    dot: 'bg-slate-400'    },
  GUI_THONG_BAO:  { label: 'Gửi thông báo', color: 'text-amber-700',   bg: 'bg-amber-100',    dot: 'bg-amber-500'    },
  XUAT_KHAU:      { label: 'Xuất khẩu',     color: 'text-cyan-700',    bg: 'bg-cyan-100',     dot: 'bg-cyan-500'     },
  XEM_CHI_TIET:   { label: 'Xem chi tiết',  color: 'text-slate-500',   bg: 'bg-slate-50',     dot: 'bg-slate-300'    },
}

const BANG_LABEL: Record<string, string> = {
  phan_anh:         'Phản ánh',
  ho_dan:           'Hộ dân',
  nhan_khau:        'Nhân khẩu',
  thong_bao:        'Thông báo',
  su_kien:          'Sự kiện',
  can_bo:           'Cán bộ',
  bhyt:             'BHYT',
  ho_ngheo:         'Hộ nghèo',
  nguoi_cao_tuoi:   'Người cao tuổi',
  tai_lieu:         'Tài liệu',
  dang_ky_tam_tru:  'Đăng ký tạm trú',
  dang_ky_tam_vang: 'Đăng ký tạm vắng',
  he_thong:         'Hệ thống',
}

// ─── Avatar chữ cái đầu ──────────────────────────────────────
function AvatarCanBo({ ten }: { ten: string | null }) {
  if (!ten) return (
    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
      <User size={14} className="text-slate-400" />
    </div>
  )
  const chu = ten.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{chu}</span>
    </div>
  )
}

// ─── JSON Diff viewer ────────────────────────────────────────
function JsonDiff({
  cu, moi,
}: {
  cu:  Record<string, unknown> | null
  moi: Record<string, unknown> | null
}) {
  if (!cu && !moi) return null

  const allKeys = Array.from(new Set([
    ...Object.keys(cu  ?? {}),
    ...Object.keys(moi ?? {}),
  ])).filter(k => !['updated_at', 'created_at', 'deleted_at'].includes(k))

  const changed = allKeys.filter(k => {
    const v1 = JSON.stringify(cu?.[k])
    const v2 = JSON.stringify(moi?.[k])
    return v1 !== v2
  })

  if (changed.length === 0) {
    return <p className="text-xs text-slate-400 italic">Không có thay đổi dữ liệu</p>
  }

  return (
    <div className="space-y-1">
      {changed.map(k => (
        <div key={k} className="grid grid-cols-[120px_1fr_1fr] gap-2 text-xs">
          <span className="text-slate-500 font-mono truncate">{k}</span>
          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono truncate">
            {cu?.[k] !== undefined ? String(cu[k]) : '—'}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono truncate">
            {moi?.[k] !== undefined ? String(moi[k]) : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Log Item ────────────────────────────────────────────────
function LogItem({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false)
  const cfg = HANH_DONG_CFG[entry.hanh_dong] ?? HANH_DONG_CFG['CAP_NHAT']!
  const hasDetail = !!(entry.gia_tri_cu || entry.gia_tri_moi)

  return (
    <div className="flex gap-3 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-white', cfg.dot)} />
        <div className="w-px flex-1 bg-slate-100 mt-1.5" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm
                        hover:border-slate-200 transition-colors">
          {/* Header row */}
          <div className="flex items-start gap-2 flex-wrap">
            <AvatarCanBo ten={entry.can_bo_ten} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-900 truncate">
                  {entry.can_bo_ten ?? 'Hệ thống'}
                </span>
                <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
                {entry.bang && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full
                                   bg-slate-100 text-slate-600">
                    {BANG_LABEL[entry.bang] ?? entry.bang}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 mt-1 leading-snug">{entry.mo_ta}</p>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-400">{formatRelativeTime(entry.created_at)}</span>
                {entry.ban_ghi_id && (
                  <span className="text-xs text-slate-400 font-mono">#{entry.ban_ghi_id.slice(0, 8)}</span>
                )}
                {entry.ip_address && (
                  <span className="text-xs text-slate-300">{entry.ip_address}</span>
                )}
              </div>
            </div>

            {/* Expand button */}
            {hasDetail && (
              <button
                onClick={() => setOpen(v => !v)}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-50
                           hover:text-slate-600 transition-colors shrink-0"
                title={open ? 'Thu gọn' : 'Xem thay đổi'}
              >
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Diff expand */}
          {open && hasDetail && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-[120px_1fr_1fr] gap-2 text-[11px] font-bold
                               text-slate-400 uppercase tracking-wide mb-2">
                <span>Trường</span>
                <span>Trước</span>
                <span>Sau</span>
              </div>
              <JsonDiff cu={entry.gia_tri_cu} moi={entry.gia_tri_moi} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main feed ────────────────────────────────────────────────
export default function AuditLogFeed({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <User size={22} className="text-slate-300" />
        </div>
        <p className="text-slate-400 font-medium">Chưa có nhật ký hoạt động</p>
        <p className="text-slate-300 text-sm mt-1">Các thao tác của cán bộ sẽ được ghi lại tại đây</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {entries.map((entry) => (
        <LogItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
