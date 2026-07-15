'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Loader2, CheckCircle2, AlertCircle,
  Link2, Tag, Hash, Calendar, Globe, Lock,
} from 'lucide-react'
import { LOAI_CFG } from '../config'
import { themTaiLieu } from '../actions'

const NAM_OPTIONS = Array.from({ length: 10 }, (_, i) => 2026 - i)

function Field({
  label, name, type = 'text', placeholder = '', required = false,
  helpText, children,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  required?: boolean; helpText?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
            text-sm text-slate-800 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
            transition-all"
        />
      )}
      {helpText && <p className="text-xs text-slate-400">{helpText}</p>}
    </div>
  )
}

export default function ThemTaiLieuPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isCongKhai, setIsCongKhai] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('la_cong_khai', isCongKhai ? 'true' : 'false')
    setResult(null)

    startTransition(async () => {
      const res = await themTaiLieu(fd)
      if (res.success) {
        router.push(`/dashboard/tai-lieu/${res.id}`)
      } else {
        setResult(res)
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tai-lieu"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thêm tài liệu</h1>
          <p className="text-sm text-slate-500 mt-0.5">Đăng tải văn bản, quy chế, nghị quyết khu phố</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card thông tin chính */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thông tin văn bản</h2>

          <Field
            label="Tiêu đề văn bản"
            name="tieu_de"
            placeholder="VD: Nghị quyết Hội nghị Chi bộ khu phố 25 quý I/2026"
            required
          />

          {/* Loại tài liệu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Loại tài liệu <span className="text-red-500">*</span>
            </label>
            <select
              name="loai"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800
                focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                transition-all"
            >
              {Object.entries(LOAI_CFG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Mô tả / Tóm tắt</label>
            <textarea
              name="mo_ta"
              placeholder="Tóm tắt nội dung chính của văn bản..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                text-sm text-slate-800 placeholder-slate-400 resize-none
                focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                transition-all"
            />
          </div>
        </div>

        {/* Card metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Số hiệu & năm ban hành</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Số hiệu văn bản"
              name="so_hieu"
              placeholder={`VD: 01/NQ-${KHU_PHO.ma}`}
              helpText="Số hiệu định danh chính thức"
            >
              <div className="relative">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="so_hieu"
                  type="text"
                  placeholder={`01/NQ-${KHU_PHO.ma}`}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5
                    text-sm text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                    transition-all"
                />
              </div>
            </Field>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" /> Năm ban hành
              </label>
              <select
                name="nam_ban_hanh"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                  text-sm text-slate-800
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                  transition-all"
              >
                <option value="">-- Chọn năm --</option>
                {NAM_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <Field
            label="Từ khoá / Tags"
            name="tags"
            placeholder="VD: chi bộ, an ninh, 2026 (phân cách bằng dấu phẩy)"
            helpText="Giúp tìm kiếm nhanh hơn"
          >
            <div className="relative">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="tags"
                type="text"
                placeholder="chi bộ, an ninh, 2026"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5
                  text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                  transition-all"
              />
            </div>
          </Field>
        </div>

        {/* Card file / link */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Liên kết tệp</h2>

          <Field
            label="URL tải xuống"
            name="file_url"
            placeholder="https://drive.google.com/... hoặc https://..."
            helpText="Dán đường dẫn Google Drive, OneDrive hoặc URL trực tiếp đến file"
          >
            <div className="relative">
              <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="file_url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5
                  text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
                  transition-all"
              />
            </div>
          </Field>

          <Field
            label="Tên file"
            name="file_name"
            placeholder="VD: nghi-quyet-q1-2026.pdf"
            helpText="Tên hiển thị của file tài liệu"
          />

          <Field
            label="Nguồn gốc"
            name="nguon"
            placeholder="VD: Phường Long Trường, UBND TP.HCM..."
            helpText="Đơn vị ban hành hoặc cung cấp tài liệu"
          />
        </div>

        {/* Phạm vi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Phạm vi công bố</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsCongKhai(true)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all
                ${isCongKhai
                  ? 'border-[#8B1A1A] bg-red-50 text-[#8B1A1A]'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
            >
              <Globe size={20} />
              <span className="text-sm font-medium">Công khai</span>
              <span className="text-xs text-center opacity-70">Tất cả cán bộ đều thấy</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCongKhai(false)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all
                ${!isCongKhai
                  ? 'border-slate-700 bg-slate-50 text-slate-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
            >
              <Lock size={20} />
              <span className="text-sm font-medium">Nội bộ</span>
              <span className="text-xs text-center opacity-70">Chỉ Ban quản lý KP</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {result && !result.success && (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium
            bg-red-50 text-red-800 border border-red-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span>{result.message}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-1">
          <Link
            href="/dashboard/tai-lieu"
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
              <><CheckCircle2 size={15} />Lưu tài liệu</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
