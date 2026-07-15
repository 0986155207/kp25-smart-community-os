'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState } from 'react'
import Link from 'next/link'
import {
  Search, ChevronRight, Clock, CheckCircle2, AlertCircle,
  FileText, Phone, ArrowLeft, Loader2, Info, RefreshCw,
} from 'lucide-react'
import { TRANG_THAI_HO_SO, type TrangThaiHoSo } from '../data'

// ─── Type kết quả ──────────────────────────────────────────
interface KetQuaTraCuu {
  maHoSo: string
  thuTucTen: string
  thuTucId: string
  hoTen: string
  cccd: string
  sdt: string
  trangThai: TrangThaiHoSo
  ngayNop: string
  ngayCapNhat: string
  ngayHenTra: string | null
  ghiChu: string | null
  chuanBiBoSung: string[] | null
}

// ─── Timeline trạng thái ────────────────────────────────────
const TIMELINE: { key: TrangThaiHoSo; label: string }[] = [
  { key: 'TIEP_NHAN',   label: 'Tiếp nhận'   },
  { key: 'DANG_XU_LY',  label: 'Đang xử lý'  },
  { key: 'DA_DUYET',    label: 'Đã duyệt'    },
  { key: 'DA_TRA',      label: 'Trả kết quả' },
]

const STEP_ORDER: Record<TrangThaiHoSo, number> = {
  TIEP_NHAN:   0,
  DANG_XU_LY:  1,
  CHO_BO_SUNG: 1,
  DA_DUYET:    2,
  TU_CHOI:     2,
  DA_TRA:      3,
}

function StatusTimeline({ trangThai }: { trangThai: TrangThaiHoSo }) {
  const currentStep = STEP_ORDER[trangThai]
  const isError     = trangThai === 'TU_CHOI' || trangThai === 'CHO_BO_SUNG'

  return (
    <div className="flex items-center justify-between relative">
      {/* Đường kẻ */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 z-0" />
      <div
        className={`absolute top-4 left-4 h-0.5 z-0 transition-all duration-700
                    ${isError ? 'bg-red-400' : 'bg-[#8B1A1A]'}`}
        style={{ width: `${Math.min(currentStep / (TIMELINE.length - 1), 1) * 100}%` }}
      />

      {TIMELINE.map((step, i) => {
        const done    = i < currentStep
        const current = i === currentStep
        const active  = done || current

        return (
          <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                          ${active
                            ? isError && current
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-[#8B1A1A] border-[#8B1A1A] text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                          }`}
            >
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight
                              ${active ? 'text-slate-800' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Kết quả tra cứu ────────────────────────────────────────
function KetQuaCard({ hs }: { hs: KetQuaTraCuu }) {
  const cfg = TRANG_THAI_HO_SO[hs.trangThai]
  const ngayNopFmt    = new Date(hs.ngayNop).toLocaleDateString('vi-VN')
  const ngayCapNhatFmt = new Date(hs.ngayCapNhat).toLocaleDateString('vi-VN')
  const ngayHenTraFmt  = hs.ngayHenTra
    ? new Date(hs.ngayHenTra).toLocaleDateString('vi-VN')
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* Header màu trạng thái */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs text-slate-400 font-mono">Mã hồ sơ</span>
            <p className="text-2xl font-bold text-slate-900 font-mono tracking-wider">{hs.maHoSo}</p>
          </div>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.bg }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: cfg.dot }}
            />
            {cfg.label}
          </span>
        </div>

        <p className="font-semibold text-slate-800">{hs.thuTucTen}</p>
      </div>

      {/* Timeline */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
        <StatusTimeline trangThai={hs.trangThai} />
      </div>

      {/* Thông tin */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">Người nộp</p>
            <p className="font-medium text-slate-800">{hs.hoTen}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">CCCD</p>
            <p className="font-mono text-slate-800">
              {hs.cccd.replace(/^(\d{3})\d{6}(\d{3})$/, '$1••••••$2')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Ngày nộp</p>
            <p className="font-medium text-slate-800">{ngayNopFmt}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cập nhật lần cuối</p>
            <p className="font-medium text-slate-800">{ngayCapNhatFmt}</p>
          </div>
        </div>

        {ngayHenTraFmt && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Clock size={14} className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Dự kiến trả kết quả:</span> {ngayHenTraFmt}
            </p>
          </div>
        )}

        {/* Cần bổ sung */}
        {hs.trangThai === 'CHO_BO_SUNG' && hs.chuanBiBoSung && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-amber-600" />
              <p className="text-sm font-bold text-amber-800">Cần bổ sung giấy tờ</p>
            </div>
            <ul className="space-y-1">
              {hs.chuanBiBoSung.map((item, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="text-amber-500 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Từ chối */}
        {hs.trangThai === 'TU_CHOI' && hs.ghiChu && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-sm font-bold text-red-700">Lý do từ chối</p>
            </div>
            <p className="text-xs text-red-700">{hs.ghiChu}</p>
          </div>
        )}

        {/* Ghi chú khác */}
        {hs.ghiChu && hs.trangThai !== 'TU_CHOI' && (
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Ghi chú từ cán bộ</p>
            <p className="text-sm text-slate-700">{hs.ghiChu}</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/thu-tuc/${hs.thuTucId}`}
          className="flex-1 py-2.5 px-4 border-2 border-[#8B1A1A] text-[#8B1A1A] text-sm font-semibold
                     rounded-xl text-center hover:bg-[#8B1A1A] hover:text-white transition-all"
        >
          Xem chi tiết thủ tục
        </Link>
        <a
          href={`tel:02837461111`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50
                     border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl
                     hover:border-slate-300 transition-all"
        >
          <Phone size={14} />
          028 3746 1111
        </a>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────
export default function TraCuuHoSoPage() {
  const [mode,     setMode]     = useState<'maHoSo' | 'cccd'>('maHoSo')
  const [query,    setQuery]    = useState('')
  const [result,   setResult]   = useState<KetQuaTraCuu[] | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResult(null)
    setNotFound(false)

    try {
      const param = mode === 'maHoSo' ? `ma=${query.trim().toUpperCase()}` : `cccd=${query.trim()}`
      const res = await fetch(`/api/thu-tuc/tra-cuu?${param}`)
      const json = await res.json()

      if (!res.ok || !json.data?.length) {
        setNotFound(true)
      } else {
        setResult(json.data)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <Link
          href="/thu-tuc"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Danh sách thủ tục
        </Link>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center mx-auto">
            <Search size={28} className="text-[#8B1A1A]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tra cứu hồ sơ</h1>
          <p className="text-slate-500 text-sm">
            Kiểm tra trạng thái xử lý hồ sơ hành chính đã nộp tại Phường Long Trường
          </p>
        </div>
      </div>

      {/* ── Tabs tra cứu ────────────────────────────────── */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
        {([
          { key: 'maHoSo', label: 'Theo mã hồ sơ', icon: FileText },
          { key: 'cccd',   label: 'Theo số CCCD',   icon: Search  },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setMode(tab.key); setQuery(''); setResult(null); setNotFound(false) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                        transition-all ${mode === tab.key
                          ? 'bg-white text-[#8B1A1A] shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                        }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Form tìm kiếm ───────────────────────────────── */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              mode === 'maHoSo'
                ? `Nhập mã hồ sơ — ví dụ: ${KHU_PHO.ma}-2026-001234`
                : 'Nhập 9 hoặc 12 số CCCD'
            }
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-[#8B1A1A]
                       focus:outline-none focus:ring-4 focus:ring-[#8B1A1A]/10 text-slate-800
                       placeholder:text-slate-400 text-sm bg-white shadow-sm transition-all font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full py-3.5 bg-[#8B1A1A] text-white font-bold text-sm rounded-2xl
                     hover:bg-[#6d1414] disabled:opacity-60 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Đang tra cứu...</>
          ) : (
            <><Search size={15} /> Tra cứu ngay</>
          )}
        </button>
      </form>

      {/* ── Kết quả ─────────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">
              Tìm thấy {result.length} hồ sơ
            </h2>
            <button
              onClick={() => { setResult(null); setQuery('') }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RefreshCw size={13} />
              Tra cứu lại
            </button>
          </div>

          {result.map(hs => (
            <KetQuaCard key={hs.maHoSo} hs={hs} />
          ))}
        </div>
      )}

      {/* ── Không tìm thấy ──────────────────────────────── */}
      {notFound && (
        <div className="text-center py-10 space-y-4">
          <div className="text-5xl">🔍</div>
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Không tìm thấy hồ sơ</h3>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'maHoSo'
                ? 'Mã hồ sơ không đúng hoặc chưa được cập nhật vào hệ thống.'
                : 'Không có hồ sơ nào liên kết với số CCCD này.'
              }
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <div className="flex items-start gap-2">
              <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">Kiểm tra lại:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Mã hồ sơ có dạng <code className="bg-amber-100 px-1 rounded">{KHU_PHO.ma}-YYYY-XXXXXX</code></li>
                  <li>• Hồ sơ nộp trực tiếp cần 1–2 ngày để cập nhật vào hệ thống</li>
                  <li>• Liên hệ <strong>028 3746 1111</strong> để kiểm tra thủ công</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hướng dẫn (khi chưa tìm) ───────────────────── */}
      {!result && !notFound && !loading && (
        <div className="space-y-4">
          <h2 className="font-bold text-slate-700 text-sm">Hướng dẫn tra cứu</h2>
          <div className="space-y-3">
            {[
              {
                icon: '📋',
                title: 'Tra cứu theo mã hồ sơ',
                desc: `Mã được cấp sau khi nộp hồ sơ trực tuyến. Có dạng ${KHU_PHO.ma}-YYYY-XXXXXX.`,
                color: 'bg-blue-50 border-blue-100',
              },
              {
                icon: '🪪',
                title: 'Tra cứu theo CCCD',
                desc: 'Xem tất cả hồ sơ liên kết với số CCCD của bạn tại Phường Long Trường.',
                color: 'bg-purple-50 border-purple-100',
              },
              {
                icon: '📞',
                title: 'Hỗ trợ trực tiếp',
                desc: 'Gọi 028 3746 1111 (giờ hành chính) hoặc hỏi AI Trợ lý để được hỗ trợ.',
                color: 'bg-green-50 border-green-100',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${item.color}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hỏi AI */}
          <Link
            href="/chat?q=Tôi muốn tra cứu tình trạng hồ sơ hành chính"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#8B1A1A] to-[#a52a2a]
                       text-white rounded-2xl hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <p className="font-bold text-sm">Hỏi AI Trợ lý</p>
              <p className="text-xs text-white/80">Được hỗ trợ tra cứu và hướng dẫn 24/7</p>
            </div>
            <ChevronRight size={16} className="text-white/70" />
          </Link>
        </div>
      )}

    </div>
  )
}
