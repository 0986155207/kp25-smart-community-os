import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Pin, Eye, Calendar,
  Clock, Trash2, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatDate, mapThongBao, truncate } from '@/lib/utils'
import DeleteButton from './DeleteButton'
import GhimButton from '../GhimButton'

export const metadata: Metadata = { title: 'Chi tiết thông báo' }
export const revalidate = 0

const LOAI_LABEL: Record<string, string> = {
  THONG_BAO_CHUNG: 'Thông báo chung',
  HOP_KHU_PHO: 'Họp khu phố',
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  SU_KIEN: 'Sự kiện',
}

const LOAI_BADGE: Record<string, string> = {
  THONG_BAO_CHUNG: 'badge-blue',
  HOP_KHU_PHO: 'badge-purple',
  AN_NINH: 'badge-red',
  MOI_TRUONG: 'badge-green',
  SU_KIEN: 'badge-orange',
}

export default async function ChiTietThongBaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('thong_bao')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) notFound()

  const item = mapThongBao(data)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/thong-bao"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`badge ${LOAI_BADGE[item.loai] ?? 'badge-blue'}`}>
                {LOAI_LABEL[item.loai] ?? item.loai}
              </span>
              {item.ghimLen && (
                <span className="badge badge-yellow">
                  <Pin size={9} />
                  Đang ghim
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{item.tieuDe}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <Clock size={13} />
              Đăng lúc {formatDateTime(item.createdAt)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <GhimButton id={item.id} ghimLen={item.ghimLen} />
          <Link
            href={`/dashboard/thong-bao/${item.id}/sua`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Edit size={14} />
            Chỉnh sửa
          </Link>
          <DeleteButton id={item.id} tieuDe={item.tieuDe} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nội dung chính */}
        <div className="lg:col-span-2 space-y-5">

          {/* Ảnh */}
          {item.anhUrl && (
            <div className="card p-0 overflow-hidden">
              <img
                src={item.anhUrl}
                alt={item.tieuDe}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Nội dung */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4">Nội dung thông báo</h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {item.noiDung}
            </div>
          </div>

          {/* Preview trên portal */}
          <div className="card bg-slate-50 border-dashed">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-600">Xem trên cổng dân cư</h3>
              <Link
                href={`http://localhost:3000/thong-bao/${item.id}`}
                target="_blank"
                className="text-xs text-[#8B1A1A] hover:underline flex items-center gap-1"
              >
                Mở portal <ExternalLink size={11} />
              </Link>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${LOAI_BADGE[item.loai] ?? 'badge-blue'} text-xs`}>
                  {LOAI_LABEL[item.loai]}
                </span>
                {item.ghimLen && <span className="badge badge-gray text-xs">Ghim</span>}
              </div>
              <p className="font-semibold text-slate-900 text-sm">{item.tieuDe}</p>
              <p className="text-slate-500 text-xs mt-1">{truncate(item.noiDung, 120)}</p>
            </div>
          </div>
        </div>

        {/* Cột phải: thông tin */}
        <div className="space-y-5">

          {/* Thống kê */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Eye size={14} className="text-slate-400" />
                  Lượt xem
                </span>
                <span className="font-bold text-slate-900">{item.luotXem.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Pin size={14} className="text-slate-400" />
                  Ghim
                </span>
                <span className={`font-medium ${item.ghimLen ? 'text-amber-600' : 'text-slate-400'}`}>
                  {item.ghimLen ? 'Đang ghim' : 'Không ghim'}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin hồ sơ */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Thông tin</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Loại</span>
                <span className={`badge ${LOAI_BADGE[item.loai] ?? 'badge-blue'}`}>
                  {LOAI_LABEL[item.loai]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày đăng</span>
                <span className="text-slate-700">{formatDateTime(item.createdAt)}</span>
              </div>
              {item.ngayHetHan && (
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Hết hạn
                  </span>
                  <span className="text-slate-700">{formatDate(item.ngayHetHan)}</span>
                </div>
              )}
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-400">Mã thông báo</span>
                <span className="text-slate-400 text-xs font-mono">{item.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Kênh thông báo */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Kênh phát hành</h3>
            <div className="space-y-2">
              {[
                { label: 'Push notification', sent: item.daGuiPush, icon: '🔔' },
                { label: 'Zalo', sent: item.daGuiZalo, icon: '💬' },
                { label: 'SMS', sent: item.daGuiSms, icon: '📱' },
              ].map((ch) => (
                <div key={ch.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{ch.icon} {ch.label}</span>
                  <span className={ch.sent ? 'badge badge-green' : 'badge badge-gray'}>
                    {ch.sent ? 'Đã gửi' : 'Chưa gửi'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
