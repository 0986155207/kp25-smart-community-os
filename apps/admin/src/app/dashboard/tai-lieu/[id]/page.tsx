import { KHU_PHO } from '@/lib/khu-pho'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowLeft, Download, ExternalLink, Calendar, Hash,
  Globe, Lock, Tag, User, Clock, Pencil, Trash2,
} from 'lucide-react'
import { layTaiLieuChiTiet } from '../actions'
import { LOAI_CFG } from '../config'
import XoaButton from './XoaButton'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const doc = await layTaiLieuChiTiet(id)
  return { title: doc ? `${doc.tieu_de} — ${KHU_PHO.ma} Admin` : `Tài liệu — ${KHU_PHO.ma} Admin` }
}

function MetaRow({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default async function TaiLieuChiTietPage({ params }: Props) {
  const { id } = await params
  const doc = await layTaiLieuChiTiet(id)

  if (!doc) notFound()

  const cfg = LOAI_CFG[doc.loai] ?? LOAI_CFG['KHAC']!
  const Icon = cfg.Icon

  const ngayTao = new Date(doc.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard/tai-lieu"
          className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors"
        >
          <ArrowLeft size={15} />
          Tài liệu
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium line-clamp-1">{doc.tieu_de}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 ${cfg.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={26} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  {doc.so_hieu && (
                    <span className="badge badge-gray font-mono text-xs">{doc.so_hieu}</span>
                  )}
                  {!doc.la_cong_khai && (
                    <span className="badge badge-red flex items-center gap-1">
                      <Lock size={9} /> Nội bộ
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{doc.tieu_de}</h1>
              </div>
            </div>

            {doc.mo_ta && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-700 leading-relaxed">{doc.mo_ta}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Từ khoá</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tải xuống */}
          {doc.file_url && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-700 mb-3">Tệp đính kèm</p>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200
                  hover:border-[#8B1A1A] hover:bg-red-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
                  <Download size={18} className="text-[#8B1A1A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#8B1A1A] truncate">
                    {doc.file_name ?? 'Tải xuống tài liệu'}
                  </p>
                  <p className="text-xs text-slate-400">{doc.luot_tai} lượt tải</p>
                </div>
                <ExternalLink size={15} className="text-slate-400 group-hover:text-[#8B1A1A] shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Sidebar metadata */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thông tin</p>
            <div>
              <MetaRow icon={cfg.Icon}  label="Loại"        value={cfg.label} />
              {doc.nam_ban_hanh && (
                <MetaRow icon={Calendar} label="Năm ban hành" value={doc.nam_ban_hanh.toString()} />
              )}
              {doc.so_hieu && (
                <MetaRow icon={Hash}    label="Số hiệu"     value={
                  <span className="font-mono">{doc.so_hieu}</span>
                } />
              )}
              <MetaRow icon={doc.la_cong_khai ? Globe : Lock}
                label="Phạm vi"
                value={doc.la_cong_khai ? 'Công khai' : 'Nội bộ'}
              />
              {doc.nguon && (
                <MetaRow icon={User}    label="Nguồn gốc"   value={doc.nguon} />
              )}
              <MetaRow icon={Clock}     label="Ngày thêm"   value={ngayTao} />
              {doc.created_by && (
                <MetaRow icon={User}    label="Người thêm"  value={doc.created_by} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thao tác</p>
            <Link
              href={`/dashboard/tai-lieu/${doc.id}/sua`}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Pencil size={15} />
              Chỉnh sửa
            </Link>
            {doc.file_url && (
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Download size={15} />
                Tải xuống
              </a>
            )}
            <XoaButton id={doc.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
