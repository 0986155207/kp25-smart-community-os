'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState } from 'react'
import {
  X, Download, FileSpreadsheet, FileText, Printer,
  CheckCircle2, Loader2, AlertCircle, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────
type Format = 'excel' | 'word' | 'pdf'

interface FormatOption {
  id:       Format
  label:    string
  ext:      string
  icon:     React.ElementType
  color:    string
  bg:       string
  border:   string
  desc:     string
  note:     string
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id:     'excel',
    label:  'Excel',
    ext:    '.xlsx',
    icon:   FileSpreadsheet,
    color:  'text-emerald-700',
    bg:     'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    desc:   'Bảng tính đầy đủ, 4 sheet dữ liệu',
    note:   'Tổng quan · Dân cư · Phản ánh · An sinh',
  },
  {
    id:     'word',
    label:  'Word',
    ext:    '.docx',
    icon:   FileText,
    color:  'text-blue-700',
    bg:     'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    desc:   'Văn bản hành chính chính thức',
    note:   'Đầy đủ ký tên · Quốc hiệu · Bảng số liệu',
  },
  {
    id:     'pdf',
    label:  'PDF / In',
    ext:    '.pdf',
    icon:   Printer,
    color:  'text-red-700',
    bg:     'bg-red-50',
    border: 'border-red-200 hover:border-red-400',
    desc:   'Mở trang in, xuất PDF qua trình duyệt',
    note:   'Tối ưu khổ A4 · Tất cả bảng số liệu',
  },
]

// ─── State per format ──────────────────────────────────────────
type DlState = 'idle' | 'loading' | 'done' | 'error'

export default function ExportModal() {
  const [open,   setOpen]   = useState(false)
  const [states, setStates] = useState<Record<Format, DlState>>({
    excel: 'idle', word: 'idle', pdf: 'idle',
  })
  const [errors, setErrors] = useState<Record<Format, string>>({
    excel: '', word: '', pdf: '',
  })

  function setSt(fmt: Format, st: DlState) {
    setStates(prev => ({ ...prev, [fmt]: st }))
  }
  function setErr(fmt: Format, msg: string) {
    setErrors(prev => ({ ...prev, [fmt]: msg }))
  }

  async function handleExport(fmt: Format) {
    if (states[fmt] === 'loading') return

    if (fmt === 'pdf') {
      // Mở trang in standalone trong tab mới (không có sidebar)
      window.open('/print/bao-cao?print=1', '_blank')
      setSt('pdf', 'done')
      setTimeout(() => setSt('pdf', 'idle'), 3000)
      return
    }

    setSt(fmt, 'loading')
    setErr(fmt, '')

    try {
      const url = `/api/bao-cao/export-${fmt}`
      const res = await fetch(url)

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(body || `HTTP ${res.status}`)
      }

      // Tạo link tải file
      const blob  = await res.blob()
      const href  = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      const date  = new Date().toISOString().split('T')[0]
      a.href      = href
      a.download  = `Bao-cao-${KHU_PHO.ma}-${date}.${fmt === 'excel' ? 'xlsx' : 'docx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(href)

      setSt(fmt, 'done')
      setTimeout(() => setSt(fmt, 'idle'), 3000)
    } catch (err) {
      setSt(fmt, 'error')
      setErr(fmt, err instanceof Error ? err.message : 'Lỗi không xác định')
      setTimeout(() => setSt(fmt, 'idle'), 4000)
    }
  }

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                   bg-[#1E3A5F] text-white text-sm font-semibold
                   hover:bg-[#162d4a] active:scale-95
                   transition-all shadow-sm"
      >
        <Download size={15} />
        Xuất báo cáo
      </button>

      {/* ── Modal overlay ────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg
                          ring-1 ring-slate-200 overflow-hidden
                          animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Xuất Báo cáo</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {KHU_PHO.ten} · Phường Long Trường · TP.HCM
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600
                           hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Format cards */}
            <div className="p-6 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Chọn định dạng xuất
              </p>

              {FORMAT_OPTIONS.map(opt => {
                const st   = states[opt.id]
                const Icon = opt.icon

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleExport(opt.id)}
                    disabled={st === 'loading'}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left',
                      'transition-all duration-150 group',
                      st === 'loading' ? 'opacity-70 cursor-wait' : 'cursor-pointer',
                      st === 'done'    ? 'border-emerald-300 bg-emerald-50' :
                      st === 'error'   ? 'border-red-300 bg-red-50' :
                                         opt.border + ' bg-white hover:shadow-md'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                      st === 'done'  ? 'bg-emerald-100' :
                      st === 'error' ? 'bg-red-100' : opt.bg
                    )}>
                      {st === 'loading' ? (
                        <Loader2 size={22} className="animate-spin text-slate-500" />
                      ) : st === 'done' ? (
                        <CheckCircle2 size={22} className="text-emerald-600" />
                      ) : st === 'error' ? (
                        <AlertCircle size={22} className="text-red-600" />
                      ) : (
                        <Icon size={22} className={opt.color} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{opt.label}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{opt.ext}</span>
                        {opt.id === 'pdf' && (
                          <ExternalLink size={11} className="text-slate-300 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{opt.desc}</p>
                      {st === 'error' ? (
                        <p className="text-xs text-red-600 mt-0.5 truncate">{errors[opt.id]}</p>
                      ) : st === 'done' ? (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          {opt.id === 'pdf' ? 'Đã mở trang in ✓' : 'Tải xuống thành công ✓'}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.note}</p>
                      )}
                    </div>

                    {/* Arrow */}
                    {st === 'idle' && (
                      <Download
                        size={16}
                        className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Dữ liệu được tổng hợp realtime từ hệ thống {KHU_PHO.ma}.<br />
                Báo cáo phản ánh tình hình tại thời điểm xuất.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
