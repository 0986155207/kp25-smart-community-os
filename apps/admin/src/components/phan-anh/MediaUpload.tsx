'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, Image as ImageIcon, Video, AlertCircle,
  CheckCircle2, Loader2, Film, Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────

export type MediaItem = {
  id:       string
  file:     File
  kind:     'image' | 'video'
  preview:  string               // objectURL
  status:   'pending' | 'uploading' | 'done' | 'error'
  progress: number               // 0–100
  url?:     string               // Supabase public URL
  error?:   string
}

interface MediaUploadProps {
  onUrlsChange: (anhUrls: string[], videoUrls: string[]) => void
  maxImages?: number
  maxVideos?: number
  disabled?:  boolean
}

// ─── Helpers ─────────────────────────────────────────────────

const ACCEPTED_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
const ACCEPTED_VIDEO = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-msvideo', 'video/webm']

const MAX_IMAGE_SIZE = 50  * 1024 * 1024   // 50 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024   // 200 MB

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sanitizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 100)
}

// ─── Component ────────────────────────────────────────────────

export default function MediaUpload({
  onUrlsChange,
  maxImages = 5,
  maxVideos = 2,
  disabled  = false,
}: MediaUploadProps) {
  const [items, setItems]   = useState<MediaItem[]>([])
  const [isDrag, setIsDrag] = useState(false)
  const inputRef            = useRef<HTMLInputElement>(null)
  const supabase            = createClient()

  // ── Đếm ảnh/video hiện tại ──────────────────────────────────
  const imageCount = items.filter(i => i.kind === 'image').length
  const videoCount = items.filter(i => i.kind === 'video').length
  const canAddMore = imageCount < maxImages || videoCount < maxVideos

  // ── Thêm file vào danh sách ─────────────────────────────────
  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const newItems: MediaItem[] = []

    for (const file of arr) {
      const isImage = ACCEPTED_IMAGE.includes(file.type)
      const isVideo = ACCEPTED_VIDEO.includes(file.type)

      if (!isImage && !isVideo) continue

      const kind = isImage ? 'image' : 'video'

      // Giới hạn số lượng
      if (kind === 'image' && imageCount + newItems.filter(i => i.kind === 'image').length >= maxImages) continue
      if (kind === 'video' && videoCount + newItems.filter(i => i.kind === 'video').length >= maxVideos) continue

      // Giới hạn kích thước
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        newItems.push({
          id: uid(), file, kind, preview: '', status: 'error', progress: 0,
          error: `Ảnh quá lớn (${formatBytes(file.size)}). Tối đa 50MB`,
        })
        continue
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        newItems.push({
          id: uid(), file, kind, preview: '', status: 'error', progress: 0,
          error: `Video quá lớn (${formatBytes(file.size)}). Tối đa 200MB`,
        })
        continue
      }

      newItems.push({
        id:       uid(),
        file,
        kind,
        preview:  URL.createObjectURL(file),
        status:   'pending',
        progress: 0,
      })
    }

    if (newItems.length > 0) {
      setItems(prev => {
        const next = [...prev, ...newItems]
        uploadItems(newItems, next)
        return next
      })
    }
  }

  // ── Upload 1 file lên Supabase Storage ──────────────────────
  async function uploadOne(item: MediaItem): Promise<{ url?: string; error?: string }> {
    const ext       = item.file.name.split('.').pop() ?? 'bin'
    const safeName  = sanitizeName(item.file.name.replace(/\.[^.]+$/, ''))
    const path      = `phan-anh/${uid()}_${safeName}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('phan-anh-media')
      .upload(path, item.file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (upErr) return { error: upErr.message }

    const { data } = supabase.storage.from('phan-anh-media').getPublicUrl(path)
    return { url: data.publicUrl }
  }

  // ── Upload nhiều items, cập nhật progress UI ─────────────────
  function uploadItems(newItems: MediaItem[], allItems: MediaItem[]) {
    for (const item of newItems) {
      if (item.status === 'error') continue

      // Simulate progress (Supabase JS v2 không expose progress natively)
      let tick = 0
      const fakeProgress = setInterval(() => {
        tick += Math.random() * 15
        if (tick >= 90) { clearInterval(fakeProgress); return }
        setItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, progress: Math.min(tick, 90) } : i)
        )
      }, 300)

      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 5 } : i)
      )

      void uploadOne(item).then(({ url, error }) => {
        clearInterval(fakeProgress)
        setItems(prev => {
          const next = prev.map(i =>
            i.id === item.id
              ? error
                ? { ...i, status: 'error' as const, progress: 0, error }
                : { ...i, status: 'done' as const,  progress: 100, url }
              : i
          )
          // Notify parent về URLs đã upload xong
          const anhUrls   = next.filter(i => i.kind === 'image' && i.url).map(i => i.url!)
          const videoUrls = next.filter(i => i.kind === 'video' && i.url).map(i => i.url!)
          onUrlsChange(anhUrls, videoUrls)
          return next
        })
      })
    }
  }

  // ── Xoá 1 item ───────────────────────────────────────────────
  function removeItem(id: string) {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      const item = prev.find(i => i.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)

      // Xoá file trên Storage nếu đã upload
      if (item?.url) {
        const path = item.url.split('/phan-anh-media/')[1]
        if (path) void supabase.storage.from('phan-anh-media').remove([path])
      }

      const anhUrls   = next.filter(i => i.kind === 'image' && i.url).map(i => i.url!)
      const videoUrls = next.filter(i => i.kind === 'video' && i.url).map(i => i.url!)
      onUrlsChange(anhUrls, videoUrls)
      return next
    })
  }

  // ── Drag & drop ──────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDrag(false)
    if (!disabled) addFiles(e.dataTransfer.files)
  }, [disabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
            isDrag
              ? 'border-[#1E3A5F] bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ImageIcon size={18} className="text-[#1E3A5F]" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Video size={18} className="text-amber-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              Kéo thả hoặc <span className="text-[#1E3A5F] underline">chọn file</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Ảnh: JPG, PNG, WebP, HEIC (tối đa {maxImages} ảnh · 50MB/ảnh)
            </p>
            <p className="text-xs text-slate-400">
              Video: MP4, MOV, AVI, WebM (tối đa {maxVideos} video · 200MB/video)
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={[...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO].join(',')}
        className="hidden"
        onChange={e => e.target.files && addFiles(e.target.files)}
      />

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(item => (
            <MediaCard key={item.id} item={item} onRemove={removeItem} />
          ))}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {imageCount > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon size={12} />
              {imageCount}/{maxImages} ảnh
            </span>
          )}
          {videoCount > 0 && (
            <span className="flex items-center gap-1">
              <Film size={12} />
              {videoCount}/{maxVideos} video
            </span>
          )}
          <span className="text-slate-300">·</span>
          <span>
            {items.filter(i => i.status === 'done').length}/{items.length} đã upload
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Card preview từng file ───────────────────────────────────

function MediaCard({ item, onRemove }: { item: MediaItem; onRemove: (id: string) => void }) {
  const [showPlay, setShowPlay] = useState(false)

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[4/3] group">

      {/* Preview */}
      {item.kind === 'image' && item.preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.preview}
          alt={item.file.name}
          className="w-full h-full object-cover"
        />
      )}

      {item.kind === 'video' && item.preview && (
        <div className="relative w-full h-full bg-slate-900">
          <video
            src={item.preview}
            className="w-full h-full object-cover opacity-80"
            muted
            playsInline
            onMouseEnter={e => { e.currentTarget.play().catch(() => undefined); setShowPlay(false) }}
            onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; setShowPlay(true) }}
          />
          {showPlay && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={28} className="text-white opacity-70" />
            </div>
          )}
          {/* Video badge */}
          <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Film size={9} />
            VIDEO
          </div>
        </div>
      )}

      {/* Error state */}
      {item.status === 'error' && (
        <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-2 text-center">
          <AlertCircle size={20} className="text-red-400 mb-1" />
          <p className="text-xs text-red-600 font-medium leading-tight">{item.error}</p>
        </div>
      )}

      {/* Upload progress overlay */}
      {item.status === 'uploading' && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="text-white animate-spin" />
          <div className="w-3/4 bg-white/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="text-white text-[10px] font-semibold">{Math.round(item.progress)}%</p>
        </div>
      )}

      {/* Done badge */}
      {item.status === 'done' && (
        <div className="absolute top-1.5 right-8 bg-emerald-500 text-white rounded-full p-0.5">
          <CheckCircle2 size={12} />
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
        title="Xoá"
      >
        <X size={10} />
      </button>

      {/* Filename footer */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
        <p className="text-[10px] text-white truncate">{item.file.name}</p>
        <p className="text-[9px] text-white/60">{formatBytes(item.file.size)}</p>
      </div>
    </div>
  )
}
