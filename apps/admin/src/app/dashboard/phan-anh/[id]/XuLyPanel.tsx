'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircle, Clock, XCircle, Loader2, Save,
  Sparkles, Brain, FileText, Copy, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { capNhatTrangThai, aiTuVanXuLy, aiSoanKetQua } from '../actions'

// ─── Config ─────────────────────────────────────────────────
const TRANG_THAI_OPTIONS = [
  {
    value: 'MOI',
    label: 'Mới — Chờ tiếp nhận',
    description: 'Phản ánh vừa được gửi, chưa có cán bộ tiếp nhận.',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    dotBg: 'bg-amber-600',
  },
  {
    value: 'DANG_XU_LY',
    label: 'Đang xử lý',
    description: 'Đã tiếp nhận, đang trong quá trình giải quyết.',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    dotBg: 'bg-blue-600',
  },
  {
    value: 'DA_XU_LY',
    label: 'Đã xử lý xong',
    description: 'Vấn đề đã được giải quyết hoàn toàn.',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    dotBg: 'bg-emerald-600',
  },
  {
    value: 'DONG',
    label: 'Đóng hồ sơ',
    description: 'Đóng hồ sơ (không xử lý hoặc đã hết hạn).',
    icon: XCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    dotBg: 'bg-slate-500',
  },
]

interface Props {
  id: string
  tieuDe: string
  moTa: string
  loai: string
  mucDo: string
  diaChiPhanAnh: string
  currentTrangThai: string
  currentKetQua: string
}

export default function XuLyPanel({
  id,
  tieuDe,
  moTa,
  loai,
  mucDo,
  diaChiPhanAnh,
  currentTrangThai,
  currentKetQua,
}: Props) {
  const [trangThai, setTrangThai]   = useState(currentTrangThai)
  const [ketQua, setKetQua]         = useState(currentKetQua)
  const [isPending, startTransition] = useTransition()

  // AI tư vấn
  const [tuVanLoading, setTuVanLoading] = useState(false)
  const [tuVan, setTuVan]               = useState('')
  const [tuVanOpen, setTuVanOpen]       = useState(false)

  // AI soạn kết quả
  const [draftLoading, setDraftLoading] = useState(false)

  const hasChanged = trangThai !== currentTrangThai || ketQua !== currentKetQua

  // ── AI Tư vấn ─────────────────────────────────────────────
  async function handleTuVan() {
    if (tuVanLoading) return
    setTuVanLoading(true)
    const res = await aiTuVanXuLy(tieuDe, moTa, loai, mucDo, diaChiPhanAnh)
    setTuVanLoading(false)
    if (res.success && res.tuVan) {
      setTuVan(res.tuVan)
      setTuVanOpen(true)
    } else {
      toast.error(res.message ?? 'AI không phản hồi được')
    }
  }

  // ── AI soạn kết quả ───────────────────────────────────────
  async function handleDraftKetQua() {
    if (draftLoading) return
    setDraftLoading(true)
    const res = await aiSoanKetQua(tieuDe, moTa, loai)
    setDraftLoading(false)
    if (res.success && res.ketQua) {
      setKetQua(res.ketQua)
      toast.success('AI đã soạn thảo kết quả xử lý')
    } else {
      toast.error(res.message ?? 'AI không soạn được')
    }
  }

  // ── Lưu ───────────────────────────────────────────────────
  function handleSubmit() {
    startTransition(async () => {
      const result = await capNhatTrangThai(id, trangThai, ketQua)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-5">

      {/* ── AI Tư vấn xử lý ──────────────────────────────── */}
      <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-violet-600" />
            <span className="text-sm font-bold text-violet-800">AI Tư vấn xử lý</span>
          </div>
          <button
            type="button"
            onClick={handleTuVan}
            disabled={tuVanLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tuVanLoading
              ? <><Loader2 size={12} className="animate-spin" />Đang phân tích...</>
              : <><Sparkles size={12} />Nhận tư vấn</>
            }
          </button>
        </div>

        {tuVan && (
          <>
            <button
              type="button"
              onClick={() => setTuVanOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 text-xs text-violet-600 hover:text-violet-800 transition-colors"
            >
              <span className="font-medium">{tuVanOpen ? 'Ẩn bớt' : 'Xem tư vấn AI'}</span>
              {tuVanOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {tuVanOpen && (
              <div className="relative">
                <pre className="whitespace-pre-wrap text-xs text-slate-700 bg-white rounded-lg border border-violet-100 p-3 font-sans leading-relaxed max-h-64 overflow-y-auto">
                  {tuVan}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tuVan)
                    toast.success('Đã sao chép')
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Copy size={12} />
                </button>
              </div>
            )}
          </>
        )}

        {!tuVan && (
          <p className="text-xs text-violet-500">
            AI sẽ phân tích và đề xuất đơn vị phụ trách, các bước xử lý, thời hạn hoàn thành.
          </p>
        )}
      </div>

      {/* ── Chọn trạng thái ──────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Trạng thái xử lý</label>
        <div className="space-y-2">
          {TRANG_THAI_OPTIONS.map((opt) => {
            const isSelected = trangThai === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTrangThai(opt.value)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `${opt.border} ${opt.bg}`
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${isSelected ? opt.color : 'text-slate-400'}`}>
                  <opt.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isSelected ? opt.color : 'text-slate-700'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                </div>
                {isSelected && (
                  <div className={`shrink-0 w-5 h-5 rounded-full ${opt.dotBg} flex items-center justify-center`}>
                    <CheckCircle size={13} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Kết quả xử lý ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Kết quả xử lý
            <span className="font-normal text-slate-400 ml-1">(tùy chọn)</span>
          </label>
          <button
            type="button"
            onClick={handleDraftKetQua}
            disabled={draftLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs font-semibold hover:bg-[#1E3A5F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {draftLoading
              ? <><Loader2 size={11} className="animate-spin" />Đang soạn...</>
              : <><FileText size={11} />AI soạn thảo</>
            }
          </button>
        </div>
        <textarea
          value={ketQua}
          onChange={(e) => setKetQua(e.target.value)}
          rows={5}
          className="input resize-none"
          placeholder="Mô tả kết quả, biện pháp đã thực hiện, ghi chú xử lý..."
        />
      </div>

      {/* ── Nút lưu ──────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={isPending || !hasChanged}
        className="btn-primary w-full py-3 disabled:opacity-40"
      >
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" />Đang lưu...</>
        ) : (
          <><Save size={16} />Lưu thay đổi</>
        )}
      </button>

      {!hasChanged && (
        <p className="text-center text-xs text-slate-400">Chưa có thay đổi nào</p>
      )}
    </div>
  )
}
