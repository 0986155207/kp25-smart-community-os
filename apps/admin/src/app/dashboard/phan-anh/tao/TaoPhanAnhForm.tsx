'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Loader2, CheckCircle, AlertCircle,
  ChevronDown, ArrowLeft, MapPin, Navigation, X, ImageIcon,
} from 'lucide-react'
import { taoMoiPhanAnh, aiPhanLoai } from '../actions'
import MediaUpload from '@/components/phan-anh/MediaUpload'

// ─── Config ─────────────────────────────────────────────────
const LOAI_OPTIONS = [
  { value: 'AN_NINH',       label: '🔒 An ninh trật tự' },
  { value: 'MOI_TRUONG',    label: '🌿 Môi trường' },
  { value: 'CO_SO_HA_TANG', label: '🏗️ Cơ sở hạ tầng' },
  { value: 'AN_SINH',       label: '❤️ An sinh xã hội' },
  { value: 'GIAO_THONG',    label: '🚦 Giao thông' },
  { value: 'KHAC',          label: '📋 Khác' },
]

const MUC_DO_OPTIONS = [
  { value: 'KHAN_CAP',  label: '🔴 Khẩn cấp',   color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'CAO',       label: '🟠 Cao',          color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'TRUNG_BINH',label: '🟡 Trung bình',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'THAP',      label: '⚪ Thấp',          color: 'text-slate-600 bg-slate-50 border-slate-200' },
]

type AIResult  = { loai: string; mucDo: string; tomTat: string }
type GPSStatus = 'idle' | 'loading' | 'success' | 'error'

export default function TaoPhanAnhForm() {
  const router = useRouter()

  // Form fields
  const [tieuDe, setTieuDe]             = useState('')
  const [moTa, setMoTa]                 = useState('')
  const [loai, setLoai]                 = useState('KHAC')
  const [mucDo, setMucDo]               = useState('TRUNG_BINH')
  const [diaChiPhanAnh, setDiaChi]      = useState('')
  const [nguoiGuiTen, setNguoiGuiTen]   = useState('')
  const [nguoiGuiSdt, setNguoiGuiSdt]   = useState('')

  // GPS state
  const [gpsLat, setGpsLat]             = useState<number | null>(null)
  const [gpsLng, setGpsLng]             = useState<number | null>(null)
  const [gpsStatus, setGpsStatus]       = useState<GPSStatus>('idle')
  const [gpsError, setGpsError]         = useState('')

  // AI state
  const [aiLoading, setAiLoading]       = useState(false)
  const [aiResult, setAiResult]         = useState<AIResult | null>(null)
  const [aiApplied, setAiApplied]       = useState(false)

  // Media URLs (sau khi upload lên Supabase Storage)
  const [anhUrls, setAnhUrls]           = useState<string[]>([])
  const [videoUrls, setVideoUrls]       = useState<string[]>([])

  // Submit state
  const [isPending, startTransition]    = useTransition()
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const formRef                         = useRef<HTMLFormElement>(null)

  const canAI = tieuDe.trim().length >= 5 && moTa.trim().length >= 10

  // ── GPS capture ────────────────────────────────────────────
  function handleGetGPS() {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      setGpsError('Trình duyệt không hỗ trợ định vị GPS')
      return
    }
    setGpsStatus('loading')
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude)
        setGpsLng(pos.coords.longitude)
        setGpsStatus('success')
      },
      (err) => {
        setGpsStatus('error')
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError('Trình duyệt bị từ chối quyền truy cập vị trí. Vui lòng cấp quyền và thử lại.')
            break
          case err.POSITION_UNAVAILABLE:
            setGpsError('Không thể xác định vị trí hiện tại. Vui lòng thử lại.')
            break
          case err.TIMEOUT:
            setGpsError('Quá thời gian lấy vị trí. Vui lòng thử lại.')
            break
          default:
            setGpsError('Lỗi lấy vị trí GPS. Vui lòng thử lại.')
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  function clearGPS() {
    setGpsLat(null)
    setGpsLng(null)
    setGpsStatus('idle')
    setGpsError('')
  }

  // ── AI Phân loại ───────────────────────────────────────────
  async function handleAIClassify() {
    if (!canAI || aiLoading) return
    setAiLoading(true)
    setAiResult(null)
    setAiApplied(false)

    const res = await aiPhanLoai(tieuDe, moTa)
    setAiLoading(false)

    if (res.success) {
      setAiResult({ loai: res.loai, mucDo: res.mucDo, tomTat: res.tomTat })
    }
  }

  function applyAI() {
    if (!aiResult) return
    setLoai(aiResult.loai)
    setMucDo(aiResult.mucDo)
    setAiApplied(true)
  }

  // ── Submit ─────────────────────────────────────────────────
  function handleSubmit() {
    setSubmitError(null)
    const fd = new FormData()
    fd.set('tieuDe', tieuDe)
    fd.set('moTa', moTa)
    fd.set('loai', loai)
    fd.set('mucDo', mucDo)
    fd.set('diaChiPhanAnh', diaChiPhanAnh)
    fd.set('nguoiGuiTen', nguoiGuiTen)
    fd.set('nguoiGuiSdt', nguoiGuiSdt)
    if (aiResult?.tomTat) fd.set('tomTatAI', aiResult.tomTat)
    if (gpsLat !== null)  fd.set('toaDoLat', String(gpsLat))
    if (gpsLng !== null)  fd.set('toaDoLng', String(gpsLng))
    // Media URLs đã upload
    anhUrls.forEach(u   => fd.append('anhUrls',   u))
    videoUrls.forEach(u => fd.append('videoUrls', u))

    startTransition(async () => {
      const res = await taoMoiPhanAnh(fd)
      if (res.success && res.id) {
        router.push(`/dashboard/phan-anh/${res.id}`)
      } else {
        setSubmitError(res.message)
      }
    })
  }

  const mucDoCfg = MUC_DO_OPTIONS.find(m => m.value === mucDo)

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Tiêu đề + Mô tả ──────────────────────────────── */}
      <div className="card space-y-5">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          Thông tin phản ánh
        </h2>

        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            value={tieuDe}
            onChange={e => setTieuDe(e.target.value)}
            className="input"
            placeholder="Mô tả ngắn vấn đề cần phản ánh..."
            maxLength={200}
          />
          <p className="text-xs text-slate-400 mt-1 text-right">{tieuDe.length}/200</p>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={moTa}
            onChange={e => setMoTa(e.target.value)}
            className="input resize-none"
            rows={5}
            placeholder="Mô tả đầy đủ sự việc, địa điểm, thời gian, mức độ ảnh hưởng..."
          />
        </div>

        {/* AI Classify button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAIClassify}
            disabled={!canAI || aiLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2d5a9e] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {aiLoading
              ? <><Loader2 size={15} className="animate-spin" />Đang phân loại...</>
              : <><Sparkles size={15} />Phân loại bằng AI</>
            }
          </button>
          {!canAI && (
            <span className="text-xs text-slate-400">Nhập ít nhất 5 ký tự tiêu đề + 10 ký tự mô tả</span>
          )}
        </div>

        {/* AI Result card */}
        {aiResult && (
          <div className={`rounded-xl border p-4 ${aiApplied ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className={aiApplied ? 'text-emerald-600' : 'text-[#1E3A5F]'} />
                <span className={`text-xs font-bold ${aiApplied ? 'text-emerald-700' : 'text-[#1E3A5F]'}`}>
                  {aiApplied ? 'Đã áp dụng gợi ý AI' : 'AI gợi ý phân loại'}
                </span>
              </div>
              {!aiApplied && (
                <button
                  onClick={applyAI}
                  className="shrink-0 text-xs font-semibold text-[#1E3A5F] border border-[#1E3A5F] px-3 py-1 rounded-lg hover:bg-[#1E3A5F] hover:text-white transition-colors"
                >
                  Áp dụng
                </button>
              )}
              {aiApplied && <CheckCircle size={16} className="text-emerald-600 shrink-0" />}
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                {LOAI_OPTIONS.find(l => l.value === aiResult.loai)?.label ?? aiResult.loai}
              </span>
              <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                {MUC_DO_OPTIONS.find(m => m.value === aiResult.mucDo)?.label ?? aiResult.mucDo}
              </span>
            </div>

            {aiResult.tomTat && (
              <p className="text-sm text-slate-700 italic">"{aiResult.tomTat}"</p>
            )}
          </div>
        )}
      </div>

      {/* ── Phân loại ──────────────────────────────────────── */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-800">Phân loại</h2>

        {/* Loại */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại phản ánh</label>
          <div className="relative">
            <select
              value={loai}
              onChange={e => setLoai(e.target.value)}
              className="input appearance-none pr-10"
            >
              {LOAI_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Mức độ */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mức độ ưu tiên</label>
          <div className="grid grid-cols-2 gap-2">
            {MUC_DO_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMucDo(opt.value)}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  mucDo === opt.value
                    ? opt.color + ' border-current'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Địa điểm + GPS + Người gửi ────────────────────── */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-800">Thông tin bổ sung</h2>

        {/* Địa chỉ text */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa điểm xảy ra</label>
          <input
            value={diaChiPhanAnh}
            onChange={e => setDiaChi(e.target.value)}
            className="input"
            placeholder="Số nhà, đường, hẻm..."
          />
        </div>

        {/* GPS capture */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tọa độ GPS
            <span className="ml-1.5 text-xs font-normal text-slate-400">— hiển thị trên bản đồ</span>
          </label>

          {gpsStatus === 'idle' && (
            <button
              type="button"
              onClick={handleGetGPS}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors"
            >
              <MapPin size={15} />
              Lấy vị trí GPS hiện tại
            </button>
          )}

          {gpsStatus === 'loading' && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
              <Loader2 size={15} className="animate-spin text-[#8B1A1A]" />
              Đang lấy vị trí...
            </div>
          )}

          {gpsStatus === 'success' && gpsLat !== null && gpsLng !== null && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <Navigation size={16} className="text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800">Đã lấy vị trí GPS</p>
                <p className="text-xs text-emerald-600 font-mono mt-0.5">
                  {gpsLat.toFixed(6)},&nbsp;{gpsLng.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearGPS}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Xoá tọa độ GPS"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {gpsStatus === 'error' && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700">{gpsError}</p>
              </div>
              <button
                type="button"
                onClick={() => setGpsStatus('idle')}
                className="shrink-0 text-xs text-red-500 hover:underline font-medium"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Người gửi */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ tên người gửi</label>
            <input
              value={nguoiGuiTen}
              onChange={e => setNguoiGuiTen(e.target.value)}
              className="input"
              placeholder="Tùy chọn"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
            <input
              value={nguoiGuiSdt}
              onChange={e => setNguoiGuiSdt(e.target.value)}
              className="input"
              placeholder="Tùy chọn"
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* ── Ảnh / Video hiện trường ────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-[#1E3A5F]" />
          <h2 className="font-bold text-slate-800">Ảnh &amp; Video hiện trường</h2>
          <span className="text-xs text-slate-400 font-normal ml-1">— Tùy chọn</span>
        </div>
        <MediaUpload
          onUrlsChange={(a, v) => { setAnhUrls(a); setVideoUrls(v) }}
          maxImages={5}
          maxVideos={2}
          disabled={isPending}
        />
      </div>

      {/* ── Lỗi + Submit ──────────────────────────────────── */}
      {submitError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !tieuDe.trim() || !moTa.trim()}
          className="flex-1 btn-primary py-3 disabled:opacity-40"
        >
          {isPending
            ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</>
            : gpsStatus === 'success'
              ? <><Navigation size={16} />Gửi phản ánh + GPS</>
              : <><AlertCircle size={16} />Gửi phản ánh</>
          }
        </button>
      </div>
    </div>
  )
}
