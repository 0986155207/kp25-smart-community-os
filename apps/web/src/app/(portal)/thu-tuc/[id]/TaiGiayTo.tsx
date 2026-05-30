'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, FileText, Image as ImageIcon,
  CheckCircle2, Loader2, AlertCircle, FileScan,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────
type FileItem = {
  id:       string
  file:     File
  kind:     'image' | 'pdf' | 'other'
  preview:  string | null   // objectURL cho ảnh
  status:   'pending' | 'uploading' | 'done' | 'error'
  progress: number
  url?:     string
  error?:   string
}

interface Props {
  onUrlsChange: (urls: string[]) => void
  disabled?:   boolean
  maxFiles?:   number     // default 5
  maxSizeMB?:  number     // default 5
}

// ─── Config ──────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic',
  'application/pdf',
]
// Dùng chung bucket phan-anh-media (đã tồn tại) với subfolder ho-so/
const BUCKET = 'phan-anh-media'
const FOLDER = 'ho-so'

// ─── Helpers ─────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10) }

function sanitizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80)
}

function getKind(file: File): FileItem['kind'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf') return 'pdf'
  return 'other'
}

// ─── Component ───────────────────────────────────────────────
export default function TaiGiayTo({
  onUrlsChange,
  disabled = false,
  maxFiles = 5,
  maxSizeMB = 5,
}: Props) {
  const [items,    setItems]    = useState<FileItem[]>([])
  const [isDragOn, setIsDragOn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Cập nhật callback khi items thay đổi ─────────────────
  function updateParent(list: FileItem[]) {
    const urls = list.filter(i => i.status === 'done' && i.url).map(i => i.url!)
    onUrlsChange(urls)
  }

  // ── Upload 1 file lên Supabase Storage ───────────────────
  async function uploadFile(item: FileItem) {
    const supabase = createClient()
    const path = `${FOLDER}/${new Date().getFullYear()}/${Date.now()}_${uid()}_${sanitizeName(item.file.name)}`

    // Set uploading
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i))

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, item.file, {
        contentType: item.file.type,
        upsert: false,
      })

    if (error) {
      setItems(prev => prev.map(i =>
        i.id === item.id
          ? { ...i, status: 'error', error: `Upload thất bại: ${error.message}` }
          : i
      ))
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

    setItems(prev => {
      const next = prev.map(i =>
        i.id === item.id ? { ...i, status: 'done' as const, progress: 100, url: publicUrl } : i
      )
      updateParent(next)
      return next
    })
  }

  // ── Xử lý file được chọn ─────────────────────────────────
  function processFiles(files: File[]) {
    const maxSize = maxSizeMB * 1024 * 1024

    const valid = files.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false
      if (f.size > maxSize) return false
      return true
    })

    setItems(prev => {
      const remaining = maxFiles - prev.length
      const toAdd = valid.slice(0, remaining).map<FileItem>(f => ({
        id:       uid(),
        file:     f,
        kind:     getKind(f),
        preview:  f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
        status:   'pending',
        progress: 0,
      }))

      // Upload ngay
      setTimeout(() => toAdd.forEach(item => uploadFile(item)), 0)

      return [...prev, ...toAdd]
    })
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    processFiles(Array.from(fileList))
  }

  // ── Drag & Drop ──────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOn(true)
  }, [])
  const onDragLeave = useCallback(() => setIsDragOn(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOn(false)
    handleFiles(e.dataTransfer.files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  // ── Xoá file ─────────────────────────────────────────────
  function removeItem(id: string) {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      updateParent(next)
      return next
    })
  }

  const canAddMore = items.length < maxFiles && !disabled

  return (
    <div className="space-y-3">
      {/* ── Tiêu đề ── */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <FileScan size={13} className="text-slate-500" />
          Tải ảnh / scan giấy tờ
          <span className="font-normal text-slate-400">(tùy chọn)</span>
        </label>
        <span className="text-[10px] text-slate-400">
          {items.length}/{maxFiles} · JPG, PNG, PDF · tối đa {maxSizeMB}MB/file
        </span>
      </div>

      {/* ── Drop Zone ── */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
                      transition-all select-none
                      ${isDragOn
                        ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.pdf"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
            onClick={e => { (e.target as HTMLInputElement).value = '' }}
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${isDragOn ? 'bg-[#8B1A1A]/10' : 'bg-slate-100'}`}>
              <Upload size={18} className={isDragOn ? 'text-[#8B1A1A]' : 'text-slate-400'} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDragOn ? 'text-[#8B1A1A]' : 'text-slate-600'}`}>
                {isDragOn ? 'Thả file vào đây' : 'Kéo & thả hoặc nhấn để chọn file'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Ảnh CCCD, giấy khai sinh, hợp đồng, v.v. — JPG, PNG, PDF
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Danh sách file đã chọn ── */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                          ${item.status === 'done'    ? 'bg-green-50  border-green-200'  : ''}
                          ${item.status === 'error'   ? 'bg-red-50    border-red-200'    : ''}
                          ${item.status === 'uploading' || item.status === 'pending'
                                                      ? 'bg-slate-50  border-slate-200'  : ''}
                        `}
            >
              {/* Preview / Icon */}
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200 flex items-center justify-center">
                {item.kind === 'image' && item.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                ) : item.kind === 'pdf' ? (
                  <FileText size={18} className="text-red-500" />
                ) : (
                  <ImageIcon size={18} className="text-slate-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-1.5">
                      <Loader2 size={10} className="animate-spin text-blue-500" />
                      <span className="text-[10px] text-blue-600">Đang tải lên...</span>
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <Loader2 size={10} className="animate-spin text-slate-400" />
                      <span className="text-[10px] text-slate-500">Đang chuẩn bị...</span>
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={10} className="text-green-600" />
                      <span className="text-[10px] text-green-700 font-medium">Đã tải lên</span>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={10} className="text-red-500" />
                      <span className="text-[10px] text-red-600">{item.error ?? 'Lỗi upload'}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {(item.status === 'uploading') && (
                  <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={item.status === 'uploading'}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                           text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all
                           disabled:opacity-40"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Ghi chú ── */}
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Giấy tờ được mã hóa và lưu trữ an toàn. Chỉ cán bộ xử lý hồ sơ mới có quyền truy cập.
        Nếu không có file, cán bộ sẽ hướng dẫn bổ sung sau.
      </p>
    </div>
  )
}
