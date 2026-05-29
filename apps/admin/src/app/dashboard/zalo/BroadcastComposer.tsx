'use client'

import { useState, useTransition } from 'react'
import { Radio, Send, RefreshCw, Clock, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { taoBroadcast, guiBroadcast } from './actions'

interface Props {
  /** true khi OA đã được duyệt và access_token tồn tại */
  oaActive: boolean
}

type LoaiBroadcast = 'TEXT' | 'THONG_BAO' | 'SU_KIEN'

export default function BroadcastComposer({ oaActive }: Props) {
  const [tieuDe, setTieuDe]       = useState('')
  const [noiDung, setNoiDung]     = useState('')
  const [loai, setLoai]           = useState<LoaiBroadcast>('THONG_BAO')
  const [kenh, setKenh]           = useState<string[]>(['OA'])
  const [scheduledAt, setScheduled] = useState('')
  const [step, setStep]           = useState<'form' | 'done'>('form')
  const [savedId, setSavedId]     = useState<string | null>(null)
  const [isPending, startTr]      = useTransition()
  const [error, setError]         = useState<string | null>(null)
  const [result, setResult]       = useState<string | null>(null)

  function toggleKenh(k: string) {
    setKenh(prev =>
      prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
    )
  }

  async function handleLuu() {
    if (!tieuDe.trim() || !noiDung.trim()) {
      setError('Vui lòng điền tiêu đề và nội dung')
      return
    }
    if (kenh.length === 0) {
      setError('Chọn ít nhất 1 kênh gửi')
      return
    }
    setError(null)

    startTr(async () => {
      try {
        const bc = await taoBroadcast({
          tieuDe,
          noiDung,
          loai,
          kenh,
          scheduledAt: scheduledAt || undefined,
        })
        setSavedId(bc.id as string)
        setResult('Đã lưu bản nháp. Nhấn "Gửi ngay" để phát sóng.')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi lưu broadcast')
      }
    })
  }

  async function handleGui() {
    if (!savedId) return
    setError(null)

    startTr(async () => {
      try {
        await guiBroadcast(savedId)
        setStep('done')
        setResult('Broadcast đã được gửi thành công!')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gửi thất bại')
      }
    })
  }

  function handleReset() {
    setTieuDe('')
    setNoiDung('')
    setLoai('THONG_BAO')
    setKenh(['OA'])
    setScheduled('')
    setSavedId(null)
    setError(null)
    setResult(null)
    setStep('form')
  }

  if (step === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Đã gửi broadcast!</h3>
          <p className="text-slate-500 text-sm mb-6">{result}</p>
          <button
            type="button"
            onClick={handleReset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Soạn broadcast mới
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-blue-50">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Radio size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm">Broadcast Zalo OA</h3>
          <p className="text-xs text-slate-500">
            Gửi đến toàn bộ người theo dõi OA
          </p>
        </div>
        {oaActive ? (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            OA ĐANG HOẠT ĐỘNG
          </span>
        ) : (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            OA ĐANG CHỜ DUYỆT
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Cảnh báo OA chưa active */}
        {!oaActive && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">Zalo OA đang chờ phê duyệt</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Bản soạn thảo sẽ được lưu lại và có thể gửi ngay khi OA được kích hoạt.
                Trong thời gian chờ, dùng kênh Group để liên lạc với cộng đồng.
              </p>
            </div>
          </div>
        )}

        {/* Loại */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Loại nội dung
          </label>
          <div className="flex gap-2">
            {([
              { value: 'THONG_BAO', label: 'Thông báo' },
              { value: 'SU_KIEN',   label: 'Sự kiện' },
              { value: 'TEXT',      label: 'Văn bản' },
            ] as { value: LoaiBroadcast; label: string }[]).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLoai(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  loai === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kênh gửi */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Kênh gửi
          </label>
          <div className="flex gap-3">
            {[
              { key: 'OA',    label: 'Zalo OA', disabled: !oaActive },
              { key: 'GROUP', label: 'Group Zalo', disabled: false },
            ].map(k => (
              <label
                key={k.key}
                className={`flex items-center gap-2 cursor-pointer select-none ${
                  k.disabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={kenh.includes(k.key)}
                  disabled={k.disabled}
                  onChange={() => !k.disabled && toggleKenh(k.key)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">{k.label}</span>
                {k.disabled && (
                  <span className="text-[10px] text-amber-600 font-bold">(chờ duyệt)</span>
                )}
              </label>
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
            placeholder="Tiêu đề broadcast..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            value={noiDung}
            onChange={e => setNoiDung(e.target.value)}
            rows={6}
            placeholder="Nội dung tin nhắn gửi đến người theo dõi OA..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">{noiDung.length} ký tự</p>
        </div>

        {/* Lịch gửi (tùy chọn) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
            <Clock size={11} />
            Lịch gửi (tùy chọn — để trống = lưu nháp)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduled(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Error / Result */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        {result && !error && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700">{result}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {!savedId ? (
            <button
              type="button"
              onClick={handleLuu}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                         bg-slate-700 hover:bg-slate-800 disabled:opacity-50
                         text-white text-sm font-bold rounded-xl transition-colors"
            >
              {isPending ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Lưu bản nháp
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGui}
              disabled={isPending || !oaActive && !kenh.includes('GROUP')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                         bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                         text-white text-sm font-bold rounded-xl transition-colors"
            >
              {isPending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              Gửi ngay
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50
                       text-slate-500 transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
