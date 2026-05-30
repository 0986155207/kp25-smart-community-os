'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Phone, Clock, CheckCircle2, AlertCircle, XCircle,
  ChevronRight, Loader2, MapPin, ArrowLeft, Eye,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────
type PhanAnhItem = {
  id: string
  tieu_de: string
  loai: string
  muc_do: string
  trang_thai: string
  dia_chi_phan_anh: string
  created_at: string
  updated_at: string
  anh_urls: string[] | null
}

// ─── Config ─────────────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: typeof Clock
}> = {
  MOI: {
    label: 'Chờ tiếp nhận',
    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    icon: Clock,
  },
  DANG_XU_LY: {
    label: 'Đang xử lý',
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
    icon: Clock,
  },
  DA_XU_LY: {
    label: 'Đã xử lý xong',
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  DONG: {
    label: 'Đã đóng',
    color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200',
    icon: XCircle,
  },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh', MOI_TRUONG: 'Môi trường',
  HA_TANG: 'Hạ tầng', AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông', KHAC: 'Khác',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

// ─── Component ──────────────────────────────────────────────
export default function TheoDoidPhanAnhPage() {
  const [sdt,      setSdt]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<PhanAnhItem[] | null>(null)
  const [maskedSdt, setMaskedSdt] = useState('')
  const [errMsg,   setErrMsg]   = useState('')
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const clean = sdt.trim()
    if (!clean) return
    if (!/^0[0-9]{9}$/.test(clean)) {
      setErrMsg('Số điện thoại cần đúng 10 chữ số, bắt đầu bằng 0')
      return
    }

    setLoading(true)
    setErrMsg('')
    setSearched(false)

    try {
      const res  = await fetch(`/api/phan-anh/theo-doi?sdt=${clean}`)
      const json = await res.json() as {
        success: boolean
        data?: PhanAnhItem[]
        sdt?: string
        message?: string
      }

      if (!res.ok || !json.success) {
        setErrMsg(json.message ?? 'Không thể tra cứu. Vui lòng thử lại.')
        return
      }

      setResults(json.data ?? [])
      setMaskedSdt(json.sdt ?? '')
      setSearched(true)
    } catch {
      setErrMsg('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <Link
          href="/phan-anh"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <ArrowLeft size={14} />
          Tất cả phản ánh
        </Link>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center mx-auto">
            <Search size={28} className="text-[#8B1A1A]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Theo dõi phản ánh</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Nhập số điện thoại bạn đã dùng khi gửi phản ánh<br />
            để xem trạng thái xử lý realtime
          </p>
        </div>
      </div>

      {/* ── Form tìm kiếm ────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="tel"
            value={sdt}
            onChange={e => {
              setSdt(e.target.value.replace(/\D/g, '').slice(0, 10))
              setErrMsg('')
            }}
            placeholder="Nhập số điện thoại (10 chữ số)"
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-slate-800
                        placeholder:text-slate-400 text-sm font-mono focus:outline-none
                        focus:ring-4 focus:ring-[#8B1A1A]/10 transition-all shadow-sm
                        ${errMsg
                          ? 'border-red-400 bg-red-50'
                          : 'border-slate-200 bg-white focus:border-[#8B1A1A]'
                        }`}
          />
        </div>
        {errMsg && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} />
            {errMsg}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || sdt.trim().length < 10}
          className="w-full py-3.5 bg-[#8B1A1A] text-white font-bold text-sm rounded-2xl
                     hover:bg-[#6d1414] disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Đang tra cứu...</>
            : <><Search size={15} /> Tra cứu phản ánh</>
          }
        </button>
      </form>

      {/* ── Kết quả ──────────────────────────────────────────── */}
      {searched && results && (
        <div className="space-y-4">

          {/* Summary */}
          <div className={`rounded-xl p-4 flex items-center gap-3
                          ${results.length > 0
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-slate-50 border border-slate-200'
                          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                            ${results.length > 0 ? 'bg-blue-600' : 'bg-slate-400'}`}>
              <Phone size={15} className="text-white" />
            </div>
            <div>
              {results.length > 0 ? (
                <>
                  <p className="font-bold text-slate-800">
                    Tìm thấy <span className="text-blue-700">{results.length}</span> phản ánh
                  </p>
                  <p className="text-xs text-slate-500">SĐT: {maskedSdt}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-700">Không tìm thấy phản ánh nào</p>
                  <p className="text-xs text-slate-500">
                    Số điện thoại này chưa có phản ánh nào tại KP25.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Danh sách phản ánh */}
          {results.map(pa => {
            const cfg  = TRANG_THAI_CFG[pa.trang_thai] ?? TRANG_THAI_CFG['MOI']!
            const Icon = cfg.icon
            const shortCode = pa.id.slice(0, 8).toUpperCase()
            const progress =
              pa.trang_thai === 'MOI'       ? 10 :
              pa.trang_thai === 'DANG_XU_LY' ? 55 :
              pa.trang_thai === 'DA_XU_LY'  ? 100 :
              pa.trang_thai === 'DONG'      ? 100 : 10

            return (
              <div key={pa.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cfg.border}`}>

                {/* Progress bar */}
                <div className="h-1 bg-slate-100">
                  <div
                    className={`h-full transition-all duration-700
                                ${pa.trang_thai === 'DA_XU_LY' || pa.trang_thai === 'DONG'
                                  ? 'bg-emerald-500'
                                  : pa.trang_thai === 'DANG_XU_LY'
                                  ? 'bg-blue-500'
                                  : 'bg-amber-400'
                                }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="p-4">
                  {/* Status badge + mã */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                    ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">#{shortCode}</span>
                  </div>

                  {/* Tiêu đề */}
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2">{pa.tieu_de}</h3>

                  {/* Meta */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{pa.dia_chi_phan_anh}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={11} className="shrink-0 text-slate-400" />
                      <span>Gửi: {fmtDate(pa.created_at)}</span>
                      {pa.updated_at !== pa.created_at && (
                        <span className="text-slate-400">
                          · Cập nhật: {fmtDate(pa.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Loại */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                      {LOAI_LABEL[pa.loai] ?? pa.loai}
                    </span>
                    {pa.anh_urls && pa.anh_urls.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                        📷 {pa.anh_urls.length} ảnh
                      </span>
                    )}
                  </div>

                  {/* CTA xem chi tiết */}
                  <Link
                    href={`/phan-anh/${pa.id}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                               border-2 border-[#8B1A1A]/20 text-[#8B1A1A] text-xs font-bold
                               hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A]
                               transition-all"
                  >
                    <Eye size={13} />
                    Xem chi tiết & theo dõi realtime
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}

          {/* Gửi thêm */}
          {results.length === 0 && (
            <Link
              href="/phan-anh/tao"
              className="block py-3.5 bg-[#8B1A1A] text-white text-sm font-bold rounded-2xl
                         text-center hover:bg-[#6d1414] transition-colors"
            >
              + Gửi phản ánh mới
            </Link>
          )}
        </div>
      )}

      {/* ── Hướng dẫn (khi chưa tìm) ────────────────────────── */}
      {!searched && !loading && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hướng dẫn</p>
          {[
            {
              icon: '📱',
              title: 'Nhập đúng số điện thoại',
              desc: 'Dùng số điện thoại bạn đã nhập khi gửi phản ánh. Thông tin được bảo mật.',
              color: 'bg-blue-50 border-blue-100',
            },
            {
              icon: '🔔',
              title: 'Trạng thái realtime',
              desc: 'Khi cán bộ cập nhật trạng thái xử lý, trang chi tiết sẽ tự động hiển thị.',
              color: 'bg-purple-50 border-purple-100',
            },
            {
              icon: '📋',
              title: 'Theo dõi tiến độ',
              desc: 'Xem chi tiết từng phản ánh với timeline: Mới → Đang xử lý → Hoàn thành.',
              color: 'bg-green-50 border-green-100',
            },
          ].map(item => (
            <div key={item.title} className={`flex items-start gap-3 p-4 rounded-2xl border ${item.color}`}>
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          <Link
            href="/phan-anh/tao"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#8B1A1A] to-[#a52a2a]
                       text-white rounded-2xl hover:opacity-95 transition-opacity"
          >
            <span className="text-2xl">📸</span>
            <div className="flex-1">
              <p className="font-bold text-sm">Gửi phản ánh mới</p>
              <p className="text-xs text-white/70">Báo cáo vấn đề trong khu phố 24/7</p>
            </div>
            <ChevronRight size={16} className="text-white/70" />
          </Link>
        </div>
      )}
    </div>
  )
}
