'use client'

import { useState } from 'react'
import {
  Sparkles, Loader2, RefreshCw, Copy, Check,
  FileText, AlertTriangle, TrendingUp,
} from 'lucide-react'
import { taoPhantichCongDong } from '../actions'

export default function PhanTichClient() {
  const [baoCao, setBaoCao]     = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [genTime, setGenTime]   = useState<Date | null>(null)

  async function taoPhantich() {
    setLoading(true)
    setError(null)

    const res = await taoPhantichCongDong()

    setLoading(false)
    if (res.success) {
      setBaoCao(res.baoCao)
      setGenTime(new Date())
    } else {
      setError(res.message ?? 'Không thể tạo phân tích')
    }
  }

  async function copy() {
    if (!baoCao) return
    await navigator.clipboard.writeText(baoCao)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d5a9e] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Phân tích AI cộng đồng</h2>
              <p className="text-white/70 text-sm mt-0.5">
                Tự động phân tích toàn bộ dữ liệu khu phố và tạo báo cáo tổng hợp
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={taoPhantich}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1E3A5F] font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" />Đang phân tích...</>
              : <><Sparkles size={16} />{baoCao ? 'Làm mới phân tích' : 'Tạo phân tích'}</>
            }
          </button>

          {baoCao && (
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm hover:bg-white/25 transition-colors"
            >
              {copied ? <><Check size={15} />Đã sao chép</> : <><Copy size={15} />Sao chép</>}
            </button>
          )}
        </div>

        {genTime && (
          <p className="text-white/50 text-xs mt-3">
            Tạo lúc {genTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {genTime.toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Không thể tạo phân tích</p>
            <p className="text-sm mt-0.5">{error}</p>
            {error.includes('GEMINI_API_KEY') && (
              <p className="text-xs mt-2 text-red-500">
                Vui lòng thêm GEMINI_API_KEY vào file .env.local rồi khởi động lại server.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 size={18} className="animate-spin text-[#1E3A5F]" />
            <span className="text-slate-600 font-medium text-sm">AI đang phân tích dữ liệu khu phố...</span>
          </div>
          {[80, 60, 90, 40, 70, 50].map((w, i) => (
            <div key={i} className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Kết quả báo cáo */}
      {baoCao && !loading && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={16} className="text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Báo cáo tổng hợp tình hình Khu phố 25</p>
              <p className="text-xs text-slate-400">Được tạo tự động bởi AI · Gemini 2.5 Flash</p>
            </div>
            <button
              onClick={taoPhantich}
              className="ml-auto text-slate-400 hover:text-[#1E3A5F] transition-colors"
              title="Làm mới"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Nội dung báo cáo */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 rounded-xl p-5 max-h-[600px] overflow-y-auto">
            {baoCao}
          </div>
        </div>
      )}

      {/* Trạng thái ban đầu */}
      {!baoCao && !loading && !error && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-[#1E3A5F]" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Chưa có phân tích nào</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Nhấn &quot;Tạo phân tích&quot; để AI tự động đọc dữ liệu khu phố và tạo báo cáo tổng hợp toàn diện.
          </p>
        </div>
      )}
    </div>
  )
}
