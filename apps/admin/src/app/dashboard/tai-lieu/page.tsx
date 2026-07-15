import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Plus, Search, Download, ExternalLink, Calendar, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { layDanhSachTaiLieu, layThongKeTaiLieu } from './actions'
import type { TaiLieu } from './actions'
import { LOAI_CFG } from './config'

export const metadata: Metadata = { title: `Tài liệu — ${KHU_PHO.ma} Admin` }
export const revalidate = 0

const TABS = [
  { key: 'TATCA',     label: 'Tất cả' },
  { key: 'NGHI_QUYET', label: 'Nghị quyết' },
  { key: 'QUYET_DINH', label: 'Quyết định' },
  { key: 'THONG_BAO', label: 'Thông báo' },
  { key: 'BAO_CAO',   label: 'Báo cáo' },
  { key: 'BIEN_BAN',  label: 'Biên bản' },
  { key: 'QUY_CHE',   label: 'Quy chế' },
  { key: 'HUONG_DAN', label: 'Hướng dẫn' },
]

// ── Tiện ích ───────────────────────────────────────────────────
function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Document row ───────────────────────────────────────────────
function TaiLieuRow({ doc }: { doc: TaiLieu }) {
  const cfg = LOAI_CFG[doc.loai] ?? LOAI_CFG['KHAC']!
  const Icon = cfg.Icon

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
      {/* Icon */}
      <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={20} className={cfg.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
          {doc.so_hieu && (
            <span className="badge badge-gray font-mono text-xs">{doc.so_hieu}</span>
          )}
          {doc.nam_ban_hanh && (
            <span className="badge badge-gray flex items-center gap-1">
              <Calendar size={9} /> {doc.nam_ban_hanh}
            </span>
          )}
          {!doc.la_cong_khai && (
            <span className="badge badge-red">Nội bộ</span>
          )}
        </div>

        <Link
          href={`/dashboard/tai-lieu/${doc.id}`}
          className="font-semibold text-slate-900 hover:text-[#8B1A1A] transition-colors line-clamp-1 block"
        >
          {doc.tieu_de}
        </Link>

        {doc.mo_ta && (
          <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{doc.mo_ta}</p>
        )}

        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Download size={11} />
            {doc.luot_tai} lượt tải
          </span>
          {doc.file_name && (
            <span className="text-slate-400 font-mono">
              {doc.file_name}
              {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Tải xuống"
          >
            <Download size={16} />
          </a>
        )}
        <Link
          href={`/dashboard/tai-lieu/${doc.id}`}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Xem chi tiết"
        >
          <ExternalLink size={15} />
        </Link>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────
export default async function TaiLieuPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string; q?: string }>
}) {
  const params = await searchParams
  const filterLoai = params.loai ?? 'TATCA'
  const tuKhoa = params.q ?? ''

  const [docs, stats] = await Promise.all([
    layDanhSachTaiLieu(filterLoai, tuKhoa),
    layThongKeTaiLieu(),
  ])

  const statCards = [
    'NGHI_QUYET', 'QUYET_DINH', 'BAO_CAO', 'BIEN_BAN',
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tài liệu</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tổng {stats['TATCA'] ?? 0} văn bản · Văn bản, quy chế, nghị quyết khu phố
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/tai-lieu/soan-ai"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1E3A5F] text-[#1E3A5F]
              text-sm font-semibold hover:bg-[#1E3A5F]/5 transition-colors"
          >
            <Sparkles size={15} />
            Soạn với AI
          </Link>
          <Link href="/dashboard/tai-lieu/them" className="btn-primary">
            <Plus size={16} />
            Thêm thủ công
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(key => {
          const cfg = LOAI_CFG[key]!
          const Icon = cfg.Icon
          return (
            <Link
              key={key}
              href={`/dashboard/tai-lieu?loai=${key}`}
              className={cn(
                'card py-3 flex items-center gap-3 transition-all hover:shadow-md',
                filterLoai === key && 'ring-2 ring-[#8B1A1A]'
              )}
            >
              <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={16} className={cfg.iconColor} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-slate-900">{stats[key] ?? 0}</div>
                <div className="text-xs text-slate-400 truncate">{cfg.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Search + List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <form method="get" action="/dashboard/tai-lieu">
              <input type="hidden" name="loai" value={filterLoai} />
              <input
                name="q"
                defaultValue={tuKhoa}
                placeholder="Tìm theo tiêu đề..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]"
              />
            </form>
          </div>
          {tuKhoa && (
            <Link
              href={`/dashboard/tai-lieu?loai=${filterLoai}`}
              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Xoá bộ lọc
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.key}
              href={`/dashboard/tai-lieu?loai=${tab.key}${tuKhoa ? `&q=${tuKhoa}` : ''}`}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                filterLoai === tab.key
                  ? 'border-[#8B1A1A] text-[#8B1A1A] bg-red-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {tab.label}
              <span className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold',
                filterLoai === tab.key
                  ? 'bg-[#8B1A1A] text-white'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {tab.key === 'TATCA' ? (stats['TATCA'] ?? 0) : (stats[tab.key] ?? 0)}
              </span>
            </Link>
          ))}
        </div>

        {/* Danh sách */}
        {docs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">
              {tuKhoa ? `Không tìm thấy tài liệu với từ khoá "${tuKhoa}"` : 'Chưa có tài liệu nào'}
            </p>
            <Link href="/dashboard/tai-lieu/them" className="btn-primary inline-flex mt-4">
              <Plus size={15} />
              Thêm tài liệu đầu tiên
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {docs.map(doc => <TaiLieuRow key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>
    </div>
  )
}
