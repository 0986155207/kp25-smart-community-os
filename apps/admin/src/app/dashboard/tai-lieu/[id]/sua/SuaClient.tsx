'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Globe, Lock } from 'lucide-react'
import type { TaiLieu } from '../../actions'
import { capNhatTaiLieu } from '../../actions'
import { LOAI_CFG } from '../../config'

const NAM_OPTIONS = Array.from({ length: 10 }, (_, i) => 2026 - i)

export default function SuaClient({ doc }: { doc: TaiLieu }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isCongKhai, setIsCongKhai] = useState(doc.la_cong_khai)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('la_cong_khai', isCongKhai ? 'true' : 'false')
    setResult(null)
    startTransition(async () => {
      const res = await capNhatTaiLieu(doc.id, fd)
      setResult(res)
      if (res.success) {
        setTimeout(() => router.push(`/dashboard/tai-lieu/${doc.id}`), 800)
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/tai-lieu/${doc.id}`}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa tài liệu</h1>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{doc.tieu_de}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thông tin chính */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thông tin văn bản</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              name="tieu_de"
              defaultValue={doc.tieu_de}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Loại tài liệu</label>
            <select
              name="loai"
              defaultValue={doc.loai}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            >
              {Object.entries(LOAI_CFG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              name="mo_ta"
              defaultValue={doc.mo_ta ?? ''}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 placeholder-slate-400 resize-none
                focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Số hiệu & năm</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Số hiệu</label>
              <input
                name="so_hieu"
                defaultValue={doc.so_hieu ?? ''}
                placeholder={`01/NQ-${KHU_PHO.ma}`}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                  text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Năm ban hành</label>
              <select
                name="nam_ban_hanh"
                defaultValue={doc.nam_ban_hanh ?? ''}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                  text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
              >
                <option value="">-- Chọn năm --</option>
                {NAM_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Từ khoá / Tags</label>
            <input
              name="tags"
              defaultValue={doc.tags?.join(', ') ?? ''}
              placeholder="chi bộ, an ninh, 2026"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>
        </div>

        {/* File */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Liên kết tệp</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">URL tải xuống</label>
            <input
              name="file_url"
              type="url"
              defaultValue={doc.file_url ?? ''}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Tên file</label>
            <input
              name="file_name"
              defaultValue={doc.file_name ?? ''}
              placeholder="nghi-quyet-q1-2026.pdf"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nguồn gốc</label>
            <input
              name="nguon"
              defaultValue={doc.nguon ?? ''}
              placeholder="Phường Long Trường, UBND TP.HCM..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
            />
          </div>
        </div>

        {/* Phạm vi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Phạm vi</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsCongKhai(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${isCongKhai ? 'border-[#8B1A1A] bg-red-50 text-[#8B1A1A]'
                             : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <Globe size={16} /> Công khai
            </button>
            <button
              type="button"
              onClick={() => setIsCongKhai(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${!isCongKhai ? 'border-slate-700 bg-slate-50 text-slate-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <Lock size={16} /> Nội bộ
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium
            ${result.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {result.success
              ? <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              : <AlertCircle  size={16} className="shrink-0 mt-0.5 text-red-600" />
            }
            <span>{result.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-1">
          <Link
            href={`/dashboard/tai-lieu/${doc.id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B1A1A] text-white
              text-sm font-semibold hover:bg-[#6B1414] disabled:opacity-60 transition-colors"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" />Đang lưu...</>
            ) : (
              <><CheckCircle2 size={15} />Lưu thay đổi</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
