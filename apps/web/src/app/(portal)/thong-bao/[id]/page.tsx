import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bell, Pin, Eye, Calendar,
  ChevronRight, Share2, Clock, Megaphone,
  Shield, Leaf, Users, PartyPopper,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, mapThongBao, truncate } from '@/lib/utils'
import ShareButton from './ShareButton'

// ─── Config ────────────────────────────────────────────────────
const LOAI_CFG: Record<string, { label: string; badge: string; Icon: typeof Bell; color: string }> = {
  THONG_BAO_CHUNG: { label: 'Thông báo chung', badge: 'badge-blue',   Icon: Megaphone,   color: 'text-blue-600' },
  HOP_KHU_PHO:     { label: 'Họp khu phố',     badge: 'badge-purple', Icon: Users,       color: 'text-violet-600' },
  AN_NINH:         { label: 'An ninh',          badge: 'badge-red',    Icon: Shield,      color: 'text-red-600' },
  MOI_TRUONG:      { label: 'Môi trường',       badge: 'badge-green',  Icon: Leaf,        color: 'text-green-600' },
  SU_KIEN:         { label: 'Sự kiện',          badge: 'badge-orange', Icon: PartyPopper, color: 'text-orange-600' },
}

// ─── Metadata động ─────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('thong_bao')
    .select('tieu_de, noi_dung')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) return { title: 'Thông báo không tồn tại' }

  return {
    title: data.tieu_de,
    description: truncate(data.noi_dung, 160),
  }
}

// ─── Tăng lượt xem (fire and forget) ─────────────────────────
async function tangLuotXem(id: string) {
  try {
    const supabase = await createClient()
    await supabase.rpc('tang_luot_xem_thong_bao', { p_id: id })
  } catch {
    // Không ảnh hưởng render nếu lỗi
  }
}

// ─── Page ──────────────────────────────────────────────────────
export default async function ChiTietThongBaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch thông báo + các thông báo liên quan cùng lúc
  const [mainResult, relatedResult] = await Promise.all([
    supabase
      .from('thong_bao')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('thong_bao')
      .select('id, tieu_de, loai, noi_dung, created_at, luot_xem, ghim_len')
      .is('deleted_at', null)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  if (!mainResult.data) notFound()

  // Tăng lượt xem không block render
  void tangLuotXem(id)

  const item = mapThongBao(mainResult.data)
  const related = (relatedResult.data ?? []).map(mapThongBao)

  const cfg = LOAI_CFG[item.loai] ?? LOAI_CFG['THONG_BAO_CHUNG']!

  // Format nội dung thành đoạn văn
  const paragraphs = item.noiDung.split(/\n\n+/).filter(Boolean)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/thong-bao" className="hover:text-slate-600 transition-colors">Thông báo</Link>
        <ChevronRight size={14} />
        <span className="text-slate-600 truncate max-w-[200px]">{item.tieuDe}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Nội dung chính ── */}
        <article className="lg:col-span-2">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`badge ${cfg.badge}`}>
              <cfg.Icon size={11} />
              {cfg.label}
            </span>
            {item.ghimLen && (
              <span className="badge badge-yellow">
                <Pin size={10} />
                Thông báo quan trọng
              </span>
            )}
            {item.ngayHetHan && new Date(item.ngayHetHan) > new Date() && (
              <span className="badge badge-gray">
                <Calendar size={10} />
                Hết hạn {formatDate(item.ngayHetHan)}
              </span>
            )}
          </div>

          {/* Tiêu đề */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
            {item.tieuDe}
          </h1>

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400 pb-5 border-b border-slate-100 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDateTime(item.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              {(item.luotXem + 1).toLocaleString('vi-VN')} lượt xem
            </span>
            <span className="flex items-center gap-1.5">
              <Bell size={14} />
              Ban quản lý {KHU_PHO.ten}
            </span>
          </div>

          {/* Ảnh banner */}
          {item.anhUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <img
                src={item.anhUrl}
                alt={item.tieuDe}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Nội dung */}
          <div className="prose-content">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => {
                // Dòng in đậm (bắt đầu bằng chữ hoa hoặc có ":" ở cuối)
                const isHeader = /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐ]/.test(para) && para.length < 80
                return (
                  <p
                    key={i}
                    className={`mb-4 leading-relaxed ${
                      isHeader && i > 0
                        ? 'font-semibold text-slate-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {para.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < para.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )
              })
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.noiDung}</p>
            )}
          </div>

          {/* Share + Back */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Link
              href="/thong-bao"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={15} />
              Xem tất cả thông báo
            </Link>
            <ShareButton title={item.tieuDe} />
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="space-y-6">

          {/* Card tóm tắt */}
          <div className={`rounded-2xl p-5 ${
            item.ghimLen ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {item.ghimLen ? (
                <Pin size={16} className="text-amber-600" />
              ) : (
                <Bell size={16} className="text-slate-500" />
              )}
              <span className="text-sm font-semibold text-slate-700">Thông tin</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Loại</span>
                <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày đăng</span>
                <span className="text-slate-700">{formatDate(item.createdAt)}</span>
              </div>
              {item.ngayHetHan && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Hết hạn</span>
                  <span className={`font-medium ${
                    new Date(item.ngayHetHan) < new Date() ? 'text-red-500' : 'text-slate-700'
                  }`}>
                    {formatDate(item.ngayHetHan)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Lượt xem</span>
                <span className="text-slate-700 font-medium">{(item.luotXem + 1).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* CTA liên hệ */}
          <div className="card bg-[#1E3A5F] text-white">
            <Bell size={20} className="text-white/60 mb-2" />
            <h3 className="font-bold mb-1">Cần hỗ trợ?</h3>
            <p className="text-white/70 text-sm mb-3">
              Liên hệ trực tiếp với Ban quản lý {KHU_PHO.ten}
            </p>
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
            >
              Liên hệ ngay
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Thông báo khác */}
          {related.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                Thông báo khác
              </h3>
              <div className="space-y-1">
                {related.map((r) => {
                  const rCfg = LOAI_CFG[r.loai] ?? LOAI_CFG['THONG_BAO_CHUNG']!
                  return (
                    <Link
                      key={r.id}
                      href={`/thong-bao/${r.id}`}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <rCfg.Icon size={14} className={rCfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-[#8B1A1A] transition-colors leading-snug">
                          {r.tieuDe}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(r.createdAt)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Link
                href="/thong-bao"
                className="flex items-center justify-center gap-1 mt-3 text-sm text-[#8B1A1A] hover:underline font-medium"
              >
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
