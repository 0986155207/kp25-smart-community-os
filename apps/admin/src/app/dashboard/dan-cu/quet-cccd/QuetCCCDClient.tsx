'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  ScanLine, Camera, Loader2, Search, Home,
  Sparkles, AlertCircle, Save,
} from 'lucide-react'
import { themNhanKhauTuOCR } from './actions'

interface HoDan { id: string; ma_ho: string; chu_ho: string; dia_chi_day: string | null }

interface OCRData {
  ho_ten: string | null
  cccd: string | null
  ngay_sinh: string | null
  gioi_tinh: string | null
  quoc_tich: string | null
  dan_toc: string | null
  nguyen_quan: string | null
  noi_sinh: string | null
  dia_chi_thuong_tru: string | null
  cccd_ngay_cap: string | null
  cccd_noi_cap: string | null
}

type Step = 'pickHo' | 'upload' | 'review'

export default function QuetCCCDClient() {
  const [step, setStep]     = useState<Step>('pickHo')
  const [hoDan, setHoDan]   = useState<HoDan | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [data, setData]     = useState<OCRData | null>(null)
  const [quanHe, setQuanHe] = useState('Con')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Xử lý ảnh được chọn ──
  async function handleImage(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh'); return }
    if (file.size > 8 * 1024 * 1024) { toast.error('Ảnh quá lớn (tối đa 8MB)'); return }

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setImgPreview(base64)
      await runOCR(base64, file.type)
    }
    reader.readAsDataURL(file)
  }

  // ── Gọi API OCR ──
  async function runOCR(base64: string, mimeType: string) {
    setOcrLoading(true)
    setData(null)
    try {
      const res = await fetch('/api/ocr/cccd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Không đọc được CCCD')
        return
      }
      setData(json.data)
      setStep('review')
      toast.success('Đã trích xuất thông tin từ CCCD')
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setOcrLoading(false)
    }
  }

  function setField(k: keyof OCRData, v: string) {
    setData(prev => prev ? { ...prev, [k]: v } : prev)
  }

  async function save() {
    if (!hoDan || !data) return
    if (!data.ho_ten?.trim()) { toast.error('Thiếu họ tên'); return }
    setSaving(true)
    try {
      const res = await themNhanKhauTuOCR({
        hoId: hoDan.id,
        quanHe,
        ...data,
      })
      if (res.success) {
        toast.success(res.message)
        // reset cho lần quét tiếp theo
        setData(null); setImgPreview(null); setStep('upload')
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Lỗi hệ thống')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['pickHo', 'upload', 'review'] as Step[]).map((s, i) => {
          const active = ['pickHo', 'upload', 'review'].indexOf(step) >= i
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
              {i < 2 && <div className={`w-8 h-0.5 ${active && ['pickHo', 'upload', 'review'].indexOf(step) > i ? 'bg-[#1E3A5F]' : 'bg-slate-200'}`} />}
            </div>
          )
        })}
      </div>

      {/* STEP 1: Chọn hộ */}
      {step === 'pickHo' && (
        <PickHo onNext={(ho) => { setHoDan(ho); setStep('upload') }} />
      )}

      {/* STEP 2: Upload ảnh */}
      {step === 'upload' && (
        <div>
          <button onClick={() => setStep('pickHo')} className="text-sm text-slate-500 hover:text-slate-700 mb-4">← Chọn lại hộ</button>
          {hoDan && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <Home size={17} className="text-slate-500" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800">{hoDan.chu_ho}</p>
                <p className="text-xs text-slate-400 truncate">{hoDan.dia_chi_day}</p>
              </div>
            </div>
          )}

          <div
            onClick={() => !ocrLoading && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${ocrLoading ? 'border-blue-300 bg-blue-50/50' : 'border-slate-300 hover:border-[#1E3A5F] hover:bg-slate-50'}`}
          >
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); (e.target as HTMLInputElement).value = '' }} />

            {ocrLoading ? (
              <div className="flex flex-col items-center gap-3">
                {imgPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgPreview} alt="CCCD" className="max-h-40 rounded-xl border border-slate-200" />
                )}
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-semibold">AI đang đọc thông tin...</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center">
                  <ScanLine size={26} className="text-[#1E3A5F]" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Chụp hoặc tải ảnh CCCD</p>
                  <p className="text-xs text-slate-400 mt-1">Mặt trước CCCD · AI tự động đọc thông tin · JPG, PNG</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg">
                    <Camera size={13} /> Chụp / Chọn ảnh
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Chụp rõ nét, đủ ánh sáng, không bị lóa. AI sẽ trích xuất họ tên, số CCCD, ngày sinh, quê quán...
              Bạn luôn được <strong>xem lại và chỉnh sửa</strong> trước khi lưu.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: Review & lưu */}
      {step === 'review' && data && (
        <div>
          <button onClick={() => setStep('upload')} className="text-sm text-slate-500 hover:text-slate-700 mb-4">← Quét lại</button>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-violet-500" />
            <h2 className="font-bold text-slate-800">Kiểm tra & xác nhận thông tin</h2>
          </div>

          {imgPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgPreview} alt="CCCD" className="max-h-32 rounded-xl border border-slate-200 mb-4 mx-auto" />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReviewField label="Họ tên" value={data.ho_ten} onChange={v => setField('ho_ten', v)} />
            <ReviewField label="Số CCCD" value={data.cccd} onChange={v => setField('cccd', v)} />
            <ReviewField label="Ngày sinh" type="date" value={data.ngay_sinh} onChange={v => setField('ngay_sinh', v)} />
            <ReviewSelect label="Giới tính" value={data.gioi_tinh} onChange={v => setField('gioi_tinh', v)}
              options={[{ v: 'NAM', l: 'Nam' }, { v: 'NU', l: 'Nữ' }, { v: 'KHAC', l: 'Khác' }]} />
            <ReviewField label="Dân tộc" value={data.dan_toc} onChange={v => setField('dan_toc', v)} />
            <ReviewField label="Quốc tịch" value={data.quoc_tich} onChange={v => setField('quoc_tich', v)} />
            <ReviewField label="Nguyên quán" value={data.nguyen_quan} onChange={v => setField('nguyen_quan', v)} full />
            <ReviewField label="Nơi thường trú" value={data.dia_chi_thuong_tru} onChange={v => setField('dia_chi_thuong_tru', v)} full />
            <ReviewField label="Ngày cấp CCCD" type="date" value={data.cccd_ngay_cap} onChange={v => setField('cccd_ngay_cap', v)} />
            <ReviewField label="Nơi cấp" value={data.cccd_noi_cap} onChange={v => setField('cccd_noi_cap', v)} />
            <ReviewSelect label="Quan hệ chủ hộ" value={quanHe} onChange={setQuanHe}
              options={['Chủ hộ', 'Vợ / Chồng', 'Con', 'Cha / Mẹ', 'Anh / Chị / Em', 'Ông / Bà', 'Cháu', 'Thành viên khác'].map(q => ({ v: q, l: q }))} />
          </div>

          <button onClick={save} disabled={saving}
            className="w-full mt-5 py-3.5 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Save size={16} /> Lưu vào hộ {hoDan?.chu_ho}</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Pick household ──────────────────────────────────────────
function PickHo({ onNext }: { onNext: (ho: HoDan) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<HoDan[]>([])
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/ho-dan?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : (data.data ?? []))
    } catch { setResults([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(query), 300)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query, search])

  return (
    <div>
      <h2 className="font-bold text-slate-800 mb-1">Chọn hộ dân</h2>
      <p className="text-sm text-slate-400 mb-3">Nhân khẩu mới sẽ được thêm vào hộ này</p>
      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên chủ hộ, mã hộ..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1E3A5F] focus:outline-none focus:ring-4 focus:ring-[#1E3A5F]/10 text-sm transition-all" />
        {loading && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {results.map(ho => (
          <button key={ho.id} onClick={() => onNext(ho)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#1E3A5F] hover:shadow-sm transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#1E3A5F]/10">
              <Home size={17} className="text-slate-500 group-hover:text-[#1E3A5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{ho.chu_ho}</p>
              <p className="text-xs text-slate-400 truncate">{ho.ma_ho} · {ho.dia_chi_day}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Review field ────────────────────────────────────────────
function ReviewField({ label, value, onChange, type = 'text', full }: {
  label: string; value: string | null; onChange: (v: string) => void; type?: string; full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={`Nhập ${label.toLowerCase()}`}
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10
          ${value ? 'border-slate-200' : 'border-amber-200 bg-amber-50/30'}`} />
    </div>
  )
}

function ReviewSelect({ label, value, onChange, options }: {
  label: string; value: string | null; onChange: (v: string) => void; options: { v: string; l: string }[]
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
      <select value={value ?? ''} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10">
        <option value="">— Chọn —</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
