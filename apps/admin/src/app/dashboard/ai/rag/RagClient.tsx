'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Database, Loader2, CheckCircle2, AlertCircle, BookOpen,
  Zap, ZapOff, RefreshCw, Search, ChevronDown, ChevronUp,
  FileText, Hash, Calendar,
} from 'lucide-react'
import type { TaiLieu } from '../../tai-lieu/actions'
import type { TrangThaiNhung } from '@/lib/rag'
import { LOAI_CFG } from '../../tai-lieu/config'

// ── Kết quả nhúng ─────────────────────────────────────────────
interface EmbedResult {
  success:  boolean
  message:  string
  so_chunk?: number
}

// ── Card tài liệu ─────────────────────────────────────────────
function TaiLieuCard({
  doc,
  trangThai,
  onEmbed,
  dangNhung,
}: {
  doc:      TaiLieu
  trangThai: TrangThaiNhung | undefined
  onEmbed:  (doc: TaiLieu, noiDung: string) => void
  dangNhung: boolean
}) {
  const [moRong, setMoRong]   = useState(false)
  const [noiDung, setNoiDung] = useState(
    [doc.tieu_de, doc.mo_ta].filter(Boolean).join('\n\n')
  )

  const cfg     = LOAI_CFG[doc.loai] ?? LOAI_CFG['KHAC']!
  const Icon    = cfg.Icon
  const daNhung = trangThai?.daNhung ?? false
  const soChunk = trangThai?.soChunk ?? 0

  const lanCuoi = trangThai?.lanCuoi
    ? new Date(trangThai.lanCuoi).toLocaleDateString('vi-VN')
    : null

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      daNhung ? 'border-emerald-200' : 'border-slate-200'
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-4 p-4">
        <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon size={18} className={cfg.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`badge ${cfg.badge} text-xs`}>{cfg.label}</span>
            {doc.so_hieu && (
              <span className="badge badge-gray font-mono text-xs flex items-center gap-1">
                <Hash size={9} />{doc.so_hieu}
              </span>
            )}
            {doc.nam_ban_hanh && (
              <span className="badge badge-gray text-xs flex items-center gap-1">
                <Calendar size={9} />{doc.nam_ban_hanh}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{doc.tieu_de}</p>
          <div className="flex items-center gap-3 mt-1">
            {daNhung ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 size={11} />
                Đã nhúng · {soChunk} đoạn
                {lanCuoi && <span className="text-slate-400 font-normal ml-1">· {lanCuoi}</span>}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <ZapOff size={11} />
                Chưa nhúng
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMoRong(v => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Mở rộng để chỉnh nội dung"
          >
            {moRong ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onEmbed(doc, noiDung)}
            disabled={dangNhung}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dangNhung
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : daNhung
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-[#1E3A5F] text-white hover:bg-[#2d5a9e]'
            }`}
          >
            {dangNhung
              ? <><Loader2 size={12} className="animate-spin" />Đang nhúng...</>
              : daNhung
                ? <><RefreshCw size={12} />Nhúng lại</>
                : <><Zap size={12} />Nhúng ngay</>
            }
          </button>
        </div>
      </div>

      {/* Nội dung cần nhúng */}
      {moRong && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
            Nội dung văn bản để nhúng (có thể dán toàn bộ nội dung)
          </label>
          <textarea
            value={noiDung}
            onChange={e => setNoiDung(e.target.value)}
            rows={6}
            placeholder="Dán nội dung đầy đủ của văn bản vào đây để nhúng chính xác hơn..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
              text-sm text-slate-800 placeholder-slate-400 resize-y
              focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]
              transition-all font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">
            {noiDung.length} ký tự ·{' '}
            ~{Math.ceil(noiDung.length / 900)} đoạn ước tính
          </p>
        </div>
      )}
    </div>
  )
}

// ── Test semantic search ───────────────────────────────────────
function TestTimKiem() {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Array<{
    tieu_de: string; noi_dung: string; do_tuong_dong: number; so_hieu: string | null
  }> | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function search() {
    if (!query.trim()) return
    setLoading(true); setError(null); setResults(null)
    try {
      const res = await fetch('/api/ai/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json() as { results?: typeof results; error?: string }
      if (data.error) setError(data.error)
      else setResults(data.results ?? [])
    } catch { setError('Lỗi kết nối') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-[#1E3A5F]" />
        <h3 className="text-sm font-semibold text-slate-700">Kiểm tra tìm kiếm ngữ nghĩa</h3>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void search()}
          placeholder="VD: thủ tục đăng ký tạm trú, quy định họp khu phố..."
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
        />
        <button
          onClick={() => void search()}
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white
            text-sm font-semibold hover:bg-[#2d5a9e] disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Tìm
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {results !== null && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Không tìm thấy kết quả phù hợp. Hãy nhúng thêm tài liệu.
            </p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-xs font-semibold text-[#1E3A5F]">{r.tieu_de}</span>
                    {r.so_hieu && (
                      <span className="ml-2 text-xs text-slate-400 font-mono">{r.so_hieu}</span>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.do_tuong_dong >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    r.do_tuong_dong >= 60 ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {r.do_tuong_dong}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{r.noi_dung}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function RagClient({
  docs,
  trangThai,
}: {
  docs:       TaiLieu[]
  trangThai:  Record<string, TrangThaiNhung>
}) {
  const router = useRouter()
  const [dangNhungId, setDangNhungId] = useState<string | null>(null)
  const [ketQua, setKetQua] = useState<Record<string, EmbedResult>>({})
  const [dangNhungTatCa, setDangNhungTatCa] = useState(false)

  // Thống kê
  const daNhung = docs.filter(d => trangThai[d.id]?.daNhung).length
  const tongChunk = Object.values(trangThai).reduce((s, t) => s + t.soChunk, 0)

  async function embedDoc(doc: TaiLieu, noiDung: string) {
    setDangNhungId(doc.id)
    setKetQua(prev => ({ ...prev, [doc.id]: { success: false, message: '' } }))
    try {
      const res = await fetch('/api/ai/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tai_lieu_id: doc.id,
          noi_dung:    noiDung,
          tieu_de:     doc.tieu_de,
        }),
      })
      const data = await res.json() as { success?: boolean; message?: string; so_chunk?: number; error?: string }
      if (data.success) {
        setKetQua(prev => ({
          ...prev,
          [doc.id]: { success: true, message: data.message ?? '', so_chunk: data.so_chunk },
        }))
        router.refresh()
      } else {
        setKetQua(prev => ({
          ...prev,
          [doc.id]: { success: false, message: data.error ?? 'Lỗi không xác định' },
        }))
      }
    } catch {
      setKetQua(prev => ({
        ...prev,
        [doc.id]: { success: false, message: 'Lỗi kết nối máy chủ' },
      }))
    } finally {
      setDangNhungId(null)
    }
  }

  async function embedTatCa() {
    setDangNhungTatCa(true)
    const chuaNhung = docs.filter(d => !trangThai[d.id]?.daNhung)
    for (const doc of chuaNhung) {
      const noiDung = [doc.tieu_de, doc.mo_ta].filter(Boolean).join('\n\n')
      await embedDoc(doc, noiDung)
      await new Promise(r => setTimeout(r, 500))
    }
    setDangNhungTatCa(false)
  }

  return (
    <div className="space-y-6">
      {/* Stats + Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{docs.length}</p>
            <p className="text-xs text-slate-500">Tổng tài liệu</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Database size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{daNhung}</p>
            <p className="text-xs text-slate-500">Đã nhúng · {tongChunk} đoạn</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Nhúng tất cả</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {docs.length - daNhung} tài liệu chưa nhúng
            </p>
          </div>
          <button
            onClick={() => void embedTatCa()}
            disabled={dangNhungTatCa || docs.length === daNhung}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E3A5F] text-white
              text-xs font-semibold hover:bg-[#2d5a9e] disabled:opacity-50 transition-colors"
          >
            {dangNhungTatCa
              ? <><Loader2 size={13} className="animate-spin" />Đang nhúng...</>
              : <><Zap size={13} />Nhúng tất cả</>
            }
          </button>
        </div>
      </div>

      {/* Giải thích quy trình */}
      <div className="bg-[#1E3A5F]/5 border border-[#1E3A5F]/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-[#1E3A5F] mb-2 uppercase tracking-wide">Cách hoạt động</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Văn bản được tách thành các đoạn nhỏ (~900 ký tự)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">2</span>
            gemini-embedding-001 chuyển thành vector 768 chiều
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">3</span>
            Lưu vào pgvector, tìm kiếm bằng cosine similarity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">4</span>
            AI tự động trích dẫn nguồn khi trả lời
          </span>
        </div>
      </div>

      {/* Danh sách tài liệu */}
      <div className="space-y-3">
        {docs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Database size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">Chưa có tài liệu nào</p>
            <p className="text-xs mt-1">Thêm tài liệu trong mục Tài liệu trước</p>
          </div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="space-y-1">
              <TaiLieuCard
                doc={doc}
                trangThai={trangThai[doc.id]}
                onEmbed={(...args) => void embedDoc(...args)}
                dangNhung={dangNhungId === doc.id}
              />
              {/* Kết quả nhúng */}
              {ketQua[doc.id]?.message && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${
                  ketQua[doc.id]!.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {ketQua[doc.id]!.success
                    ? <CheckCircle2 size={13} />
                    : <AlertCircle  size={13} />
                  }
                  {ketQua[doc.id]!.message}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Test tìm kiếm */}
      {daNhung > 0 && <TestTimKiem />}
    </div>
  )
}
