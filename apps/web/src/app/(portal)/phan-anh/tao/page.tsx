'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Upload, MapPin, Send, X, Loader2,
  Image as ImageIcon, Film, CheckCircle2, Play,
  Sparkles, AlertCircle, Navigation,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { guiThongBaoPhanAnhMoi } from './actions'
import AIPhanTichCard from './AIPhanTichCard'
import GPSLocator, { type GPSData } from './GPSLocator'
import type { AIPhanTichResult } from '@/app/api/phan-anh/phan-tich-ai/route'
import type { LoaiPhanAnh, MucDoUuTien } from '@kp25/types'

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  tieuDe:          z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(200),
  moTa:            z.string().min(10, 'Mô tả tối thiểu 10 ký tự').max(2000),
  loai:            z.enum(['AN_NINH', 'MOI_TRUONG', 'HA_TANG', 'AN_SINH', 'GIAO_THONG', 'CHIEU_SANG', 'KHAC']),
  mucDo:           z.enum(['KHAN_CAP', 'CAO', 'TRUNG_BINH', 'THAP']),
  diaChiPhanAnh:   z.string().min(5, 'Vui lòng nhập địa chỉ phản ánh'),
  nguoiGuiTen:     z.string().min(2, 'Vui lòng nhập họ tên'),
  nguoiGuiSdt:     z.string().regex(/^(0[3-9][0-9]{8})$/, 'Số điện thoại không hợp lệ'),
})

type FormData = z.infer<typeof schema>

// ─── Config loại phản ánh ────────────────────────────────────
const LOAI_OPTIONS = [
  { value: 'MOI_TRUONG', label: 'Môi trường',  emoji: '🌿', desc: 'Rác thải, ô nhiễm' },
  { value: 'HA_TANG',    label: 'Hạ tầng',     emoji: '🏗️', desc: 'Đường xá, cống' },
  { value: 'AN_NINH',   label: 'An ninh',      emoji: '🛡️', desc: 'Trật tự, an toàn' },
  { value: 'GIAO_THONG',label: 'Giao thông',   emoji: '🚗', desc: 'Ùn tắc, biển báo' },
  { value: 'CHIEU_SANG', label: 'Chiếu sáng',  emoji: '💡', desc: 'Đèn đường hỏng' },
  { value: 'AN_SINH',   label: 'An sinh',      emoji: '❤️', desc: 'Người cần hỗ trợ' },
  { value: 'KHAC',      label: 'Khác',         emoji: '📋', desc: 'Vấn đề khác' },
]

const MUC_DO_OPTIONS = [
  { value: 'KHAN_CAP',   label: 'Khẩn cấp',   sub: 'Nguy hiểm tính mạng',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-300'    },
  { value: 'CAO',        label: 'Cao',         sub: 'Xử lý trong ngày',      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
  { value: 'TRUNG_BINH', label: 'Trung bình',  sub: 'Xử lý trong tuần',      color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-300'  },
  { value: 'THAP',       label: 'Thấp',        sub: 'Xử lý trong tháng',     color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200'  },
]

const BUCKET      = 'phan-anh-media'
const MAX_IMAGES  = 5
const MAX_VIDEOS  = 2
const MAX_IMG_MB  = 50
const MAX_VID_MB  = 200

function uid()            { return Math.random().toString(36).slice(2, 10) }
function sanitizeName(n: string) {
  return n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').slice(0, 80)
}

type MediaItem = {
  localId: string; file: File; kind: 'image' | 'video'
  preview: string; status: 'uploading' | 'done' | 'error'; url?: string; error?: string
}

// ─── Page ────────────────────────────────────────────────────
export default function TaoPhanAnhSmartPage() {
  const router   = useRouter()
  const supabase = createClient()

  // Media state
  const [media, setMedia]             = useState<MediaItem[]>([])
  const [submitting, setSubmitting]   = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const vidInputRef = useRef<HTMLInputElement>(null)

  // AI analysis state
  const [aiStatus,  setAiStatus]   = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [aiResult,  setAiResult]   = useState<AIPhanTichResult | null>(null)
  const [aiApplied, setAiApplied]  = useState(false)

  // GPS state
  const [gpsData, setGpsData]   = useState<GPSData | null>(null)

  const {
    register, handleSubmit, watch, setValue, getValues, formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { loai: 'MOI_TRUONG', mucDo: 'TRUNG_BINH' },
  })

  const selectedLoai  = watch('loai')
  const selectedMucDo = watch('mucDo')
  const imageItems    = media.filter(m => m.kind === 'image')
  const videoItems    = media.filter(m => m.kind === 'video')

  // ── Upload helper ─────────────────────────────────────────
  async function uploadFile(file: File) {
    const ext      = file.name.split('.').pop() ?? 'bin'
    const safeName = sanitizeName(file.name.replace(/\.[^.]+$/, ''))
    const path     = `phan-anh/${uid()}_${safeName}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600' })
    if (error) return { error: error.message }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl }
  }

  // ── Trigger AI analysis ───────────────────────────────────
  const triggerAIAnalysis = useCallback(async (uploadedUrls: string[], moTa: string) => {
    if (!uploadedUrls.length) return
    setAiStatus('analyzing')
    setAiResult(null)
    setAiApplied(false)
    try {
      const res = await fetch('/api/phan-anh/phan-tich-ai', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageUrls: uploadedUrls, moTa }),
      })
      const json = await res.json() as { success: boolean; data?: AIPhanTichResult }
      if (json.success && json.data) {
        setAiResult(json.data)
        setAiStatus('done')
      } else {
        setAiStatus('error')
      }
    } catch {
      setAiStatus('error')
    }
  }, [])

  // ── Add files ─────────────────────────────────────────────
  async function addFiles(files: FileList, kind: 'image' | 'video') {
    const maxCount   = kind === 'image' ? MAX_IMAGES : MAX_VIDEOS
    const maxMB      = kind === 'image' ? MAX_IMG_MB : MAX_VID_MB
    const currentCnt = kind === 'image' ? imageItems.length : videoItems.length
    const slots      = maxCount - currentCnt
    if (slots <= 0) { toast.error(`Tối đa ${maxCount} ${kind === 'image' ? 'ảnh' : 'video'}`); return }

    const toProcess   = Array.from(files).slice(0, slots)
    const newUrls: string[] = []

    for (const file of toProcess) {
      if (file.size / (1024 * 1024) > maxMB) { toast.error(`${file.name} quá lớn (tối đa ${maxMB}MB)`); continue }
      const preview = URL.createObjectURL(file)
      const localId = uid()
      setMedia(prev => [...prev, { localId, file, kind, preview, status: 'uploading' }])
      const { url, error } = await uploadFile(file)
      setMedia(prev => prev.map(m =>
        m.localId === localId
          ? error ? { ...m, status: 'error', error } : { ...m, status: 'done', url }
          : m
      ))
      if (error) { toast.error(`Lỗi tải lên: ${file.name}`) }
      else if (url) { newUrls.push(url) }
    }

    // Auto-trigger AI analysis on first image upload
    if (kind === 'image' && newUrls.length > 0 && aiStatus === 'idle') {
      await triggerAIAnalysis(newUrls, '')
    }
  }

  function removeMedia(localId: string) {
    setMedia(prev => {
      const item = prev.find(m => m.localId === localId)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      if (item?.url) {
        const path = item.url.split(`/${BUCKET}/`)[1]
        if (path) void supabase.storage.from(BUCKET).remove([path])
      }
      return prev.filter(m => m.localId !== localId)
    })
    // Reset AI if no images remain
    const remaining = media.filter(m => m.localId !== localId && m.kind === 'image')
    if (remaining.length === 0) {
      setAiStatus('idle'); setAiResult(null); setAiApplied(false)
    }
  }

  // ── Apply AI suggestions ──────────────────────────────────
  function applyAISuggestions() {
    if (!aiResult) return
    setValue('loai',  aiResult.loai as LoaiPhanAnh)
    setValue('mucDo', aiResult.mucDo as MucDoUuTien)
    if (aiResult.tieuDe) setValue('tieuDe', aiResult.tieuDe)
    if (aiResult.moTa)   setValue('moTa',   aiResult.moTa)
    setAiApplied(true)
    toast.success('Đã áp dụng gợi ý AI vào form')
  }

  function resetAI() { setAiApplied(false) }

  function reanalyze() {
    const imageUrls = imageItems.filter(m => m.url).map(m => m.url!)
    void triggerAIAnalysis(imageUrls, '')
  }

  // ── GPS location applied to address field ─────────────────
  // GPS chỉ cung cấp TỌA ĐỘ cho bản đồ, KHÔNG ghi đè địa chỉ người dùng đã nhập
  // Chỉ tự điền nếu field địa chỉ đang trống
  function handleGPS(data: GPSData | null) {
    setGpsData(data)
    if (data?.address && !getValues('diaChiPhanAnh')?.trim()) {
      setValue('diaChiPhanAnh', data.address)
    }
  }

  // ── Submit ────────────────────────────────────────────────
  async function onSubmit(data: FormData) {
    if (media.some(m => m.status === 'uploading')) {
      toast.error('Vui lòng chờ upload hoàn tất'); return
    }
    setSubmitting(true)
    try {
      const anhUrls   = imageItems.filter(m => m.url).map(m => m.url!)
      const videoUrls = videoItems.filter(m => m.url).map(m => m.url!)

      const { error, data: inserted } = await supabase.from('phan_anh').insert({
        tieu_de:           data.tieuDe,
        mo_ta:             data.moTa,
        loai:              data.loai === 'CHIEU_SANG' ? 'HA_TANG' : data.loai,  // map CHIEU_SANG → HA_TANG cho DB enum
        muc_do:            data.mucDo,
        dia_chi_phan_anh:  data.diaChiPhanAnh,
        nguoi_gui_ten:     data.nguoiGuiTen,
        nguoi_gui_sdt:     data.nguoiGuiSdt,
        anh_urls:          anhUrls,
        video_urls:        videoUrls,
        trang_thai:        'MOI',
        // GPS
        toa_do_lat: gpsData?.lat  ?? null,
        toa_do_lng: gpsData?.lng  ?? null,
        // AI fields
        ai_da_phan_tich: aiResult !== null,
        ai_danh_gia:     aiResult?.tomTat   ?? null,
        ai_phan_loai:    aiResult?.loai === 'CHIEU_SANG' ? 'HA_TANG' : (aiResult?.loai ?? null),
        ai_muc_do:       aiResult?.mucDo    ?? null,
        ai_tieu_de:      aiResult?.tieuDe   ?? null,
        ai_tom_tat:      aiResult?.tomTat   ?? null,
        ai_tinh_nang:    aiResult?.tinhNang ?? [],
        ai_de_xuat:      aiResult?.deXuat   ?? null,
        ai_do_tin_cay:   aiResult?.doTinCay ?? null,
      }).select('id').single()

      if (error) throw error
      void guiThongBaoPhanAnhMoi(inserted.id)
      toast.success('Gửi phản ánh thành công! Chúng tôi sẽ xử lý sớm nhất.')
      router.push('/phan-anh')
    } catch {
      toast.error('Không thể gửi phản ánh. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const uploading = media.some(m => m.status === 'uploading')

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
          <Camera size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gửi phản ánh hiện trường</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-500 text-sm">Khu phố 25 · Phường Long Trường</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
              <Sparkles size={10} />
              AI Smart
            </span>
          </div>
        </div>
      </div>

      {/* ── Workflow hint ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 p-3.5 bg-violet-50 border border-violet-200 rounded-2xl text-xs text-violet-700">
        <Sparkles size={16} className="text-violet-500 shrink-0" />
        <p>
          <strong>AI tự động phân tích:</strong> Chụp/tải ảnh hiện trường → AI nhận diện vấn đề, đề xuất phân loại &amp; nội dung
          → Bạn xem xét, chỉnh sửa và gửi đi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ─── BƯỚC 1: Upload ảnh/video ─────────────────── */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">1</span>
              Ảnh / Video hiện trường
            </h2>
            {aiStatus === 'analyzing' && (
              <div className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold">
                <Loader2 size={13} className="animate-spin" />
                AI đang phân tích...
              </div>
            )}
            {aiStatus === 'done' && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                <CheckCircle2 size={13} />
                AI đã phân tích
              </div>
            )}
          </div>

          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={imageItems.length >= MAX_IMAGES}
              onClick={() => imgInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed
                border-slate-300 hover:border-violet-400 hover:bg-violet-50
                disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
            >
              <div className="relative">
                <ImageIcon size={22} className="text-violet-500" />
                {aiStatus === 'idle' && imageItems.length === 0 && (
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-violet-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-violet-700">
                {imageItems.length === 0 ? 'Chụp / Tải ảnh' : 'Thêm ảnh'}
              </span>
              <span className="text-[11px] text-slate-400">
                {imageItems.length}/{MAX_IMAGES} · AI phân tích tự động
              </span>
            </button>

            <button
              type="button"
              disabled={videoItems.length >= MAX_VIDEOS}
              onClick={() => vidInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed
                border-slate-300 hover:border-amber-400 hover:bg-amber-50
                disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Film size={22} className="text-amber-500" />
              <span className="text-xs font-semibold text-slate-600">Thêm video</span>
              <span className="text-[11px] text-slate-400">{videoItems.length}/{MAX_VIDEOS} · tối đa {MAX_VID_MB}MB</span>
            </button>
          </div>

          <input ref={imgInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic" multiple capture="environment" className="hidden"
            onChange={e => { if (e.target.files) { void addFiles(e.target.files, 'image'); e.target.value = '' } }} />
          <input ref={vidInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" multiple className="hidden"
            onChange={e => { if (e.target.files) { void addFiles(e.target.files, 'video'); e.target.value = '' } }} />

          {/* Image grid */}
          {imageItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageItems.map(item => (
                <div key={item.localId} className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={18} className="text-white animate-spin" />
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="absolute top-1 left-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                  <button type="button" onClick={() => removeMedia(item.localId)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video list */}
          {videoItems.length > 0 && (
            <div className="space-y-2">
              {videoItems.map(item => (
                <div key={item.localId} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <video src={item.preview} className="w-full h-full object-cover opacity-70" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{item.file.name}</p>
                    <p className="text-[11px] text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === 'uploading' && <Loader2 size={15} className="text-amber-500 animate-spin" />}
                    {item.status === 'done'      && <CheckCircle2 size={15} className="text-emerald-500" />}
                    <button type="button" onClick={() => removeMedia(item.localId)}
                      className="w-6 h-6 rounded-full bg-slate-200 hover:bg-red-100 flex items-center justify-center transition-colors">
                      <X size={12} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI analyzing loader */}
          {aiStatus === 'analyzing' && (
            <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-violet-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-700">Gemini AI đang phân tích ảnh...</p>
                <p className="text-xs text-violet-500 mt-0.5">Tự động nhận diện loại vấn đề, mức độ và gợi ý nội dung</p>
              </div>
              <Loader2 size={18} className="text-violet-500 animate-spin ml-auto shrink-0" />
            </div>
          )}

          {/* AI error */}
          {aiStatus === 'error' && (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              <span>AI không phân tích được ảnh này. Vui lòng điền thủ công.</span>
              <button type="button" onClick={reanalyze} className="text-violet-600 font-semibold hover:underline ml-3 shrink-0">
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* ─── AI Analysis card ────────────────────────────── */}
        {aiStatus === 'done' && aiResult && (
          <AIPhanTichCard
            result={aiResult}
            applied={aiApplied}
            onApply={applyAISuggestions}
            onReset={resetAI}
            onReanalyze={reanalyze}
          />
        )}

        {/* ─── BƯỚC 2: Loại + Mức độ ──────────────────────── */}
        <div className="card space-y-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">2</span>
            Phân loại phản ánh
            {aiApplied && (
              <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> AI gợi ý
              </span>
            )}
          </h2>

          {/* Loại */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loại vấn đề</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {LOAI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('loai', opt.value as LoaiPhanAnh)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center
                    ${selectedLoai === opt.value
                      ? 'border-[#8B1A1A] bg-red-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <span className="text-xl leading-none">{opt.emoji}</span>
                  <span className={`text-[10px] font-bold leading-tight ${selectedLoai === opt.value ? 'text-[#8B1A1A]' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mức độ */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mức độ ưu tiên</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MUC_DO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('mucDo', opt.value as MucDoUuTien)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border-2 transition-all text-left
                    ${selectedMucDo === opt.value
                      ? `${opt.border} ${opt.bg}`
                      : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <span className={`text-sm font-bold ${selectedMucDo === opt.value ? opt.color : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── BƯỚC 3: Nội dung ─────────────────────────── */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">3</span>
            Nội dung phản ánh
            {aiApplied && (
              <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Đã điền tự động
              </span>
            )}
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              {...register('tieuDe')}
              className="input"
              placeholder="Ví dụ: Đèn đường số 12 bị hỏng từ 3 ngày nay"
            />
            {errors.tieuDe && <p className="text-red-500 text-xs mt-1">{errors.tieuDe.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('moTa')}
              rows={4}
              className="input resize-none"
              placeholder="Mô tả cụ thể tình trạng, địa điểm, thời gian xảy ra, ảnh hưởng đến cuộc sống..."
            />
            {errors.moTa && <p className="text-red-500 text-xs mt-1">{errors.moTa.message}</p>}
          </div>
        </div>

        {/* ─── BƯỚC 4: Địa điểm ─────────────────────────── */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">4</span>
            Địa điểm
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <MapPin size={13} className="inline mr-1" />
              Địa chỉ phản ánh <span className="text-red-500">*</span>
            </label>
            <input
              {...register('diaChiPhanAnh')}
              className="input"
              placeholder="Số nhà, tên đường, khu vực cụ thể..."
            />
            {errors.diaChiPhanAnh && <p className="text-red-500 text-xs mt-1">{errors.diaChiPhanAnh.message}</p>}
          </div>

          {/* GPS Locator */}
          <GPSLocator onLocation={handleGPS} value={gpsData} />

          {gpsData && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Navigation size={10} />
              Tọa độ GPS: {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)} — Hỗ trợ định vị chính xác trên bản đồ
            </p>
          )}
        </div>

        {/* ─── BƯỚC 5: Thông tin người gửi ─────────────── */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center">5</span>
            Thông tin người phản ánh
          </h2>
          <p className="text-xs text-slate-400">Thông tin được bảo mật, chỉ dùng để liên lạc khi cần thiết.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input {...register('nguoiGuiTen')} className="input" placeholder="Nguyễn Văn A" />
              {errors.nguoiGuiTen && <p className="text-red-500 text-xs mt-1">{errors.nguoiGuiTen.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input {...register('nguoiGuiSdt')} className="input" placeholder="0901234567" type="tel" />
              {errors.nguoiGuiSdt && <p className="text-red-500 text-xs mt-1">{errors.nguoiGuiSdt.message}</p>}
            </div>
          </div>
        </div>

        {/* ─── AI summary trước khi gửi ─────────────────── */}
        {aiResult && (
          <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-200 rounded-2xl text-sm">
            <Sparkles size={16} className="text-violet-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-violet-800 mb-1">AI đã hỗ trợ phân tích phản ánh này</p>
              <p className="text-violet-600 text-xs leading-relaxed">
                Loại: <strong>{LOAI_OPTIONS.find(l => l.value === aiResult.loai)?.label ?? aiResult.loai}</strong>
                {' · '}Độ tin cậy: <strong>{aiResult.doTinCay}%</strong>
                {' · '}{aiApplied ? 'Đã áp dụng gợi ý AI' : 'Bạn chưa áp dụng gợi ý AI'}
              </p>
            </div>
          </div>
        )}

        {/* ─── Submit ───────────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="btn-primary w-full py-4 text-base"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Đang gửi phản ánh...</>
          ) : uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Đang tải lên media...</>
          ) : (
            <><Send size={18} /> Gửi phản ánh</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400">
          Phản ánh sẽ được ban quản lý khu phố tiếp nhận và xử lý sớm nhất
        </p>
      </form>
    </div>
  )
}
