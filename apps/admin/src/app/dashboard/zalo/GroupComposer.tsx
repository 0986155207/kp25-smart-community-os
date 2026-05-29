'use client'

import { useState, useTransition } from 'react'
import {
  Users, Copy, CheckCheck, Send, RefreshCw, Sparkles,
  ChevronDown, Info,
} from 'lucide-react'
// ─── Format helpers (inline, không cross-package) ─────────────
function fmtDate(d: Date = new Date()) {
  return d.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
function trunc(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 3) + '...'
}
function formatThongBaoGroup(tieuDe: string, noiDung: string) {
  return `📢 ${tieuDe}\n\n${trunc(noiDung, 400)}\n\n-- KP25 Long Trường (${fmtDate()})`
}
function formatSuKienGroup(tieuDe: string, moTa: string, thoiGian: string, diaDiem: string) {
  return `📅 ${tieuDe}\n\nThoi gian: ${thoiGian}\nDia diem : ${diaDiem}\n\n${trunc(moTa, 300)}\n\n-- KP25 Long Trường`
}
function formatTuyenTruyenGroup(tieuDe: string, noidung: string, tags: string[]) {
  const tagStr = tags.map(h => `#${h}`).join(' ')
  return `📣 ${tieuDe}\n\n${trunc(noidung, 500)}${tagStr ? `\n${tagStr}` : ''}\n\n-- KP25 Long Trường (${fmtDate()})`
}
import { taoBroadcast, danhDauDaCopy } from './actions'

// ─── Các loại tin nhắn cho Group ─────────────────────────────
const LOAI_OPTIONS = [
  { value: 'THONG_BAO', label: '📢 Thông báo' },
  { value: 'SU_KIEN',   label: '📅 Sự kiện' },
  { value: 'TUYEN_TRUYEN', label: '📣 Tuyên truyền' },
  { value: 'KHAC',      label: '✏️ Tự soạn' },
] as const

type LoaiGroup = (typeof LOAI_OPTIONS)[number]['value']

export default function GroupComposer() {
  const [loai, setLoai]           = useState<LoaiGroup>('THONG_BAO')
  const [tieuDe, setTieuDe]       = useState('')
  const [noiDung, setNoiDung]     = useState('')
  const [thoiGian, setThoiGian]   = useState('')
  const [diaDiem, setDiaDiem]     = useState('')
  const [hashtag, setHashtag]     = useState('')
  const [preview, setPreview]     = useState('')
  const [copied, setCopied]       = useState(false)
  const [savedId, setSavedId]     = useState<string | null>(null)
  const [isPending, startTr]      = useTransition()
  const [error, setError]         = useState<string | null>(null)

  // ─── Tạo preview text ───────────────────────────────────────
  function buildPreview(): string {
    if (!tieuDe && !noiDung) return ''

    switch (loai) {
      case 'THONG_BAO':
        return formatThongBaoGroup(tieuDe, noiDung)

      case 'SU_KIEN':
        return formatSuKienGroup(
          tieuDe,
          noiDung,
          thoiGian || '(chưa điền)',
          diaDiem  || '(chưa điền)',
        )

      case 'TUYEN_TRUYEN':
        return formatTuyenTruyenGroup(
          tieuDe,
          noiDung,
          hashtag.split(/[,\s]+/).filter(Boolean),
        )

      case 'KHAC':
        return noiDung

      default:
        return noiDung
    }
  }

  function handlePreview() {
    setPreview(buildPreview())
    setCopied(false)
  }

  async function handleCopy() {
    const text = preview || buildPreview()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)

      // Lưu vào DB và đánh dấu đã copy
      if (!savedId) {
        startTr(async () => {
          try {
            const bc = await taoBroadcast({
              tieuDe:       tieuDe || 'Tin nhắn Group',
              noiDung:      text,
              noiDungNhom:  text,
              loai:         'TEXT',
              kenh:         ['GROUP'],
            })
            setSavedId(bc.id as string)
            await danhDauDaCopy(bc.id as string)
          } catch (e) {
            // Không block copy dù lưu DB lỗi
            console.warn('[GroupComposer] Lưu DB lỗi:', e)
          }
        })
      } else {
        startTr(() => danhDauDaCopy(savedId).catch(console.warn))
      }
    } catch {
      setError('Trình duyệt không cho phép copy. Hãy chọn và copy thủ công.')
    }
  }

  function handleReset() {
    setTieuDe('')
    setNoiDung('')
    setThoiGian('')
    setDiaDiem('')
    setHashtag('')
    setPreview('')
    setCopied(false)
    setSavedId(null)
    setError(null)
  }

  const previewText = preview || buildPreview()

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-emerald-50">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm">Soạn tin nhắn Group Zalo</h3>
          <p className="text-xs text-slate-500">
            Soạn → copy → dán vào Group cộng đồng KP25
          </p>
        </div>
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
          NHÓM CỘNG ĐỒNG
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Chọn loại */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Loại tin nhắn
          </label>
          <div className="flex flex-wrap gap-2">
            {LOAI_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setLoai(opt.value); setPreview('') }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  loai === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tiêu đề */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            value={tieuDe}
            onChange={e => setTieuDe(e.target.value)}
            placeholder="Nhập tiêu đề ngắn gọn..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Sự kiện: thêm trường */}
        {loai === 'SU_KIEN' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Thời gian</label>
              <input
                value={thoiGian}
                onChange={e => setThoiGian(e.target.value)}
                placeholder="Vd: 07:30 ngày 20/06/2026"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Địa điểm</label>
              <input
                value={diaDiem}
                onChange={e => setDiaDiem(e.target.value)}
                placeholder="Vd: Nhà văn hóa KP25"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        )}

        {/* Hashtag cho tuyên truyền */}
        {loai === 'TUYEN_TRUYEN' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Hashtag (phân cách bằng dấu phẩy)
            </label>
            <input
              value={hashtag}
              onChange={e => setHashtag(e.target.value)}
              placeholder="KP25, LongTruong, AnToanGiaoThong"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        )}

        {/* Nội dung */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            value={noiDung}
            onChange={e => setNoiDung(e.target.value)}
            rows={loai === 'KHAC' ? 8 : 5}
            placeholder={
              loai === 'KHAC'
                ? 'Soạn thảo tự do, nội dung sẽ được copy trực tiếp...'
                : 'Nhập nội dung chi tiết...'
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">{noiDung.length} ký tự</p>
        </div>

        {/* Nút xem trước */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={!tieuDe && !noiDung}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-700
                     hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronDown size={14} />
          Xem trước tin nhắn
        </button>

        {/* Preview */}
        {previewText && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Xem trước
              </span>
              <span className="text-[11px] text-slate-400">{previewText.length} ký tự</span>
            </div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {previewText}
            </pre>
          </div>
        )}

        {/* Thông báo copy */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <Info size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Info size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Sau khi copy, mở ứng dụng Zalo và dán vào Group <strong>KP25 – Long Trường</strong>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!previewText || isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                       bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50
                       text-white text-sm font-bold rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <CheckCheck size={15} />
                Đã copy vào clipboard!
              </>
            ) : isPending ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Copy size={15} />
                Copy tin nhắn
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50
                       text-slate-500 transition-colors"
            title="Soạn lại"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {copied && savedId && (
          <p className="text-[11px] text-emerald-600 text-center font-medium">
            Đã lưu lịch sử • ID: {savedId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  )
}
