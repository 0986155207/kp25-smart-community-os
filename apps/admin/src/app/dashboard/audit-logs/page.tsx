import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, Activity, Trash2, LogIn,
  ChevronLeft, ChevronRight, Search,
  Filter, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  layAuditLogs,
  layAuditStats,
  layDanhSachCanBoTrongLog,
} from './actions'
import AuditLogFeed from './AuditLogFeed'

export const metadata: Metadata = { title: 'Nhật ký hoạt động' }
export const revalidate = 0

// ─── Các lựa chọn filter ─────────────────────────────────────
const HANH_DONG_OPTIONS = [
  { value: '',              label: 'Tất cả hành động' },
  { value: 'TAO',           label: '➕ Tạo mới' },
  { value: 'CAP_NHAT',      label: '✏️ Cập nhật' },
  { value: 'XOA',           label: '🗑️ Xóa' },
  { value: 'DANG_NHAP',     label: '🔑 Đăng nhập' },
  { value: 'DANG_XUAT',     label: '🚪 Đăng xuất' },
  { value: 'GUI_THONG_BAO', label: '📢 Gửi thông báo' },
  { value: 'XUAT_KHAU',     label: '📥 Xuất dữ liệu' },
]

const BANG_OPTIONS = [
  { value: '',                label: 'Tất cả bảng' },
  { value: 'phan_anh',        label: 'Phản ánh' },
  { value: 'ho_dan',          label: 'Hộ dân' },
  { value: 'thong_bao',       label: 'Thông báo' },
  { value: 'su_kien',         label: 'Sự kiện' },
  { value: 'can_bo',          label: 'Cán bộ' },
  { value: 'bhyt',            label: 'BHYT' },
  { value: 'ho_ngheo',        label: 'Hộ nghèo' },
  { value: 'nguoi_cao_tuoi',  label: 'Người cao tuổi' },
  { value: 'tai_lieu',        label: 'Tài liệu' },
]

// ─── Stat card nhỏ ───────────────────────────────────────────
function StatChip({
  icon: Icon, value, label, color,
}: {
  icon: React.ElementType
  value: number
  label: string
  color: string
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 shadow-sm px-3 py-2">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}>
        <Icon size={14} className="text-white" />
      </div>
      <div>
        <div className="font-bold text-slate-900 text-sm tabular-nums">{value.toLocaleString('vi-VN')}</div>
        <div className="text-[10px] text-slate-400">{label}</div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{
    hanh_dong?: string
    bang?: string
    can_bo?: string
    tu_ngay?: string
    den_ngay?: string
    q?: string
    trang?: string
  }>
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const trang  = parseInt(params.trang ?? '1', 10)

  const [{ data, total, tong_trang }, stats, danhSachCanBo] = await Promise.all([
    layAuditLogs({
      hanh_dong:   params.hanh_dong  || undefined,
      bang:        params.bang       || undefined,
      can_bo_email: params.can_bo   || undefined,
      tu_ngay:     params.tu_ngay    || undefined,
      den_ngay:    params.den_ngay   || undefined,
      q:           params.q          || undefined,
      trang,
    }),
    layAuditStats(),
    layDanhSachCanBoTrongLog(),
  ])

  // Build URL cho filter/pagination
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = {
      hanh_dong: params.hanh_dong,
      bang:      params.bang,
      can_bo:    params.can_bo,
      tu_ngay:   params.tu_ngay,
      den_ngay:  params.den_ngay,
      q:         params.q,
      trang:     String(trang),
      ...overrides,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/dashboard/audit-logs?${p.toString()}`
  }

  const hasFilter = !!(params.hanh_dong || params.bang || params.can_bo ||
                       params.tu_ngay || params.den_ngay || params.q)

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-[#1E3A5F]" />
            <h1 className="text-2xl font-bold text-slate-900">Nhật ký hoạt động</h1>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Toàn bộ thao tác của cán bộ trong hệ thống — minh bạch, truy vết đầy đủ
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap items-center gap-2">
          <StatChip icon={Activity} value={stats.tongHomNay}    label="Hôm nay"     color="bg-[#1E3A5F]" />
          <StatChip icon={Activity} value={stats.tongTuan}      label="7 ngày"       color="bg-slate-500"  />
          <StatChip icon={LogIn}    value={stats.dangNhapHomNay} label="Đăng nhập"   color="bg-violet-500" />
          <StatChip icon={Trash2}   value={stats.xoaHomNay}     label="Xóa hôm nay" color="bg-red-500"    />
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <form method="GET" action="/dashboard/audit-logs"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">Lọc nhật ký</span>
          {hasFilter && (
            <Link
              href="/dashboard/audit-logs"
              className="ml-auto text-xs text-[#8B1A1A] hover:underline font-medium"
            >
              Xóa bộ lọc
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Tìm kiếm */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Tìm trong mô tả..."
              className="input pl-9 py-2 text-sm min-h-0 h-9"
            />
          </div>

          {/* Hành động */}
          <select name="hanh_dong" defaultValue={params.hanh_dong ?? ''}
                  className="input py-2 text-sm min-h-0 h-9">
            {HANH_DONG_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Bảng dữ liệu */}
          <select name="bang" defaultValue={params.bang ?? ''}
                  className="input py-2 text-sm min-h-0 h-9">
            {BANG_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Cán bộ */}
          <select name="can_bo" defaultValue={params.can_bo ?? ''}
                  className="input py-2 text-sm min-h-0 h-9">
            <option value="">Tất cả cán bộ</option>
            {danhSachCanBo.map(cb => (
              <option key={cb.email} value={cb.email}>{cb.ten}</option>
            ))}
          </select>

          {/* Submit */}
          <button type="submit"
                  className="btn-primary py-2 text-sm min-h-0 h-9 w-full">
            <Search size={14} />
            Lọc
          </button>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs text-slate-400">Từ ngày:</span>
          <input type="date" name="tu_ngay"  defaultValue={params.tu_ngay ?? ''}
                 className="input py-1.5 text-sm min-h-0 w-auto h-8" />
          <span className="text-xs text-slate-400">Đến ngày:</span>
          <input type="date" name="den_ngay" defaultValue={params.den_ngay ?? ''}
                 className="input py-1.5 text-sm min-h-0 w-auto h-8" />
        </div>
      </form>

      {/* ── Kết quả ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {hasFilter
            ? <>Tìm thấy <strong className="text-slate-900">{total.toLocaleString('vi-VN')}</strong> bản ghi</>
            : <>Tổng cộng <strong className="text-slate-900">{total.toLocaleString('vi-VN')}</strong> nhật ký</>
          }
        </p>
        <a
          href={`/api/audit-logs/export?${new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([,v]) => v))
          )}`}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1E3A5F]
                     font-medium transition-colors"
        >
          <Download size={13} />
          Xuất CSV
        </a>
      </div>

      {/* ── Timeline Feed ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <AuditLogFeed entries={data} />
      </div>

      {/* ── Phân trang ──────────────────────────────────────────── */}
      {tong_trang > 1 && (
        <div className="flex items-center justify-center gap-2">
          {trang > 1 && (
            <Link
              href={buildUrl({ trang: String(trang - 1) })}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200
                         text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={15} /> Trước
            </Link>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(tong_trang, 7) }, (_, i) => {
              let page: number
              if (tong_trang <= 7) {
                page = i + 1
              } else if (trang <= 4) {
                page = i + 1
              } else if (trang >= tong_trang - 3) {
                page = tong_trang - 6 + i
              } else {
                page = trang - 3 + i
              }
              return (
                <Link
                  key={page}
                  href={buildUrl({ trang: String(page) })}
                  className={cn(
                    'w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors',
                    page === trang
                      ? 'bg-[#1E3A5F] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {page}
                </Link>
              )
            })}
          </div>

          {trang < tong_trang && (
            <Link
              href={buildUrl({ trang: String(trang + 1) })}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200
                         text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Sau <ChevronRight size={15} />
            </Link>
          )}
        </div>
      )}

    </div>
  )
}
