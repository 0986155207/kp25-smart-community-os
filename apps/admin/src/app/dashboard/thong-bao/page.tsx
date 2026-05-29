import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Bell, Plus, Pin, Eye, Calendar, ChevronRight,
  Megaphone, Shield, Leaf, Users, PartyPopper, BellRing,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatRelativeTime, mapThongBao, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import GhimButton from './GhimButton'

export const metadata: Metadata = { title: 'Quản lý thông báo' }
export const revalidate = 0

// ─── Config ────────────────────────────────────────────────────
const LOAI_CFG: Record<string, { label: string; badge: string; bg: string; iconColor: string; Icon: typeof Bell }> = {
  THONG_BAO_CHUNG: { label: 'Thông báo chung', badge: 'badge-blue',   bg: 'bg-blue-50',   iconColor: 'text-blue-600',   Icon: Megaphone },
  HOP_KHU_PHO:     { label: 'Họp khu phố',     badge: 'badge-purple', bg: 'bg-violet-50', iconColor: 'text-violet-600', Icon: Users },
  AN_NINH:         { label: 'An ninh',          badge: 'badge-red',    bg: 'bg-red-50',    iconColor: 'text-red-600',    Icon: Shield },
  MOI_TRUONG:      { label: 'Môi trường',       badge: 'badge-green',  bg: 'bg-green-50',  iconColor: 'text-green-600',  Icon: Leaf },
  SU_KIEN:         { label: 'Sự kiện',          badge: 'badge-orange', bg: 'bg-orange-50', iconColor: 'text-orange-600', Icon: PartyPopper },
}

const TABS = [
  { key: 'TATCA',         label: 'Tất cả' },
  { key: 'THONG_BAO_CHUNG', label: 'Chung' },
  { key: 'HOP_KHU_PHO',  label: 'Họp khu phố' },
  { key: 'AN_NINH',      label: 'An ninh' },
  { key: 'MOI_TRUONG',   label: 'Môi trường' },
  { key: 'SU_KIEN',      label: 'Sự kiện' },
]

// ─── Data ──────────────────────────────────────────────────────
async function getThongBao(loai?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('thong_bao')
    .select('*')
    .is('deleted_at', null)
    .order('ghim_len', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (loai && loai !== 'TATCA') query = query.eq('loai', loai)

  const { data } = await query
  return (data ?? []).map(mapThongBao)
}

async function getStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('thong_bao')
    .select('loai, ghim_len')
    .is('deleted_at', null)

  const rows = data ?? []
  return {
    tong: rows.length,
    ghim: rows.filter((r) => r.ghim_len).length,
    THONG_BAO_CHUNG: rows.filter((r) => r.loai === 'THONG_BAO_CHUNG').length,
    HOP_KHU_PHO: rows.filter((r) => r.loai === 'HOP_KHU_PHO').length,
    AN_NINH: rows.filter((r) => r.loai === 'AN_NINH').length,
    MOI_TRUONG: rows.filter((r) => r.loai === 'MOI_TRUONG').length,
    SU_KIEN: rows.filter((r) => r.loai === 'SU_KIEN').length,
  }
}

// ─── Page ──────────────────────────────────────────────────────
export default async function ThongBaoPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string }>
}) {
  const params = await searchParams
  const filterLoai = params.loai ?? 'TATCA'

  const [items, stats] = await Promise.all([
    getThongBao(filterLoai),
    getStats(),
  ])

  const pinned = items.filter((i) => i.ghimLen)
  const regular = items.filter((i) => !i.ghimLen)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý thông báo</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tổng {stats.tong} thông báo · {stats.ghim} đang ghim
          </p>
        </div>
        <Link href="/dashboard/thong-bao/tao" className="btn-primary">
          <Plus size={16} />
          Tạo thông báo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(['THONG_BAO_CHUNG', 'HOP_KHU_PHO', 'AN_NINH', 'MOI_TRUONG', 'SU_KIEN'] as const).map((key) => {
          const cfg = LOAI_CFG[key]!
          return (
            <Link
              key={key}
              href={`/dashboard/thong-bao?loai=${key}`}
              className={cn(
                'card py-3 flex items-center gap-3 transition-all hover:shadow-md',
                filterLoai === key && 'ring-2 ring-[#8B1A1A]'
              )}
            >
              <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <cfg.Icon size={16} className={cfg.iconColor} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-slate-900">{stats[key]}</div>
                <div className="text-xs text-slate-400 truncate">{cfg.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Tabs + danh sách */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/thong-bao?loai=${tab.key}`}
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
                filterLoai === tab.key ? 'bg-[#8B1A1A] text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {tab.key === 'TATCA' ? stats.tong : stats[tab.key as keyof typeof stats]}
              </span>
            </Link>
          ))}
        </div>

        {/* Ghim */}
        {pinned.length > 0 && (
          <div className="border-b border-slate-100">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50/50 border-b border-amber-100">
              <Pin size={13} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Đang ghim ({pinned.length})
              </span>
            </div>
            {pinned.map((item) => (
              <ThongBaoRow key={item.id} item={item} isPinned />
            ))}
          </div>
        )}

        {/* Danh sách thường */}
        {regular.length === 0 && pinned.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Chưa có thông báo nào</p>
            <Link href="/dashboard/thong-bao/tao" className="btn-primary inline-flex mt-4">
              <Plus size={15} />
              Tạo thông báo đầu tiên
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {regular.map((item) => (
              <ThongBaoRow key={item.id} item={item} isPinned={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Row component ─────────────────────────────────────────────
function ThongBaoRow({
  item,
  isPinned,
}: {
  item: ReturnType<typeof mapThongBao>
  isPinned: boolean
}) {
  const cfg = LOAI_CFG[item.loai] ?? LOAI_CFG['THONG_BAO_CHUNG']!

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
      {/* Icon loại */}
      <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        {item.anhUrl ? (
          <img src={item.anhUrl} alt="" className="w-11 h-11 rounded-xl object-cover" />
        ) : (
          <cfg.Icon size={20} className="text-slate-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
          {isPinned && (
            <span className="badge badge-yellow">
              <Pin size={9} />
              Ghim
            </span>
          )}
          {item.daGuiPush && (
            <span className="badge badge-green flex items-center gap-1">
              <BellRing size={9} />
              Đã gửi Push
            </span>
          )}
          {item.ngayHetHan && (
            <span className="badge badge-gray flex items-center gap-1">
              <Calendar size={9} />
              Hết hạn {formatDate(item.ngayHetHan)}
            </span>
          )}
        </div>
        <Link
          href={`/dashboard/thong-bao/${item.id}`}
          className="font-semibold text-slate-900 hover:text-[#8B1A1A] transition-colors line-clamp-1 block"
        >
          {item.tieuDe}
        </Link>
        <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">
          {truncate(item.noiDung, 100)}
        </p>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatRelativeTime(item.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {item.luotXem} lượt xem
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <GhimButton id={item.id} ghimLen={item.ghimLen} />
        <Link
          href={`/dashboard/thong-bao/${item.id}`}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Xem chi tiết"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
