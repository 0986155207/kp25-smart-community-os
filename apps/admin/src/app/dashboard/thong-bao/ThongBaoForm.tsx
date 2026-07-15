'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Upload, X, Pin, Calendar, FileText, Save, Send, BellRing, CheckCircle2, XCircle, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { taoThongBao, capNhatThongBao, danhDauDaGuiPush } from './actions'

// ─── Schema ──────────────────────────────────────────────────
const schema = z.object({
  tieuDe: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(300, 'Tối đa 300 ký tự'),
  noiDung: z.string().min(10, 'Nội dung tối thiểu 10 ký tự').max(10000, 'Tối đa 10000 ký tự'),
  loai: z.enum(['THONG_BAO_CHUNG', 'HOP_KHU_PHO', 'AN_NINH', 'MOI_TRUONG', 'SU_KIEN']),
  ghimLen: z.boolean(),
  ngayHetHan: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const LOAI_OPTIONS = [
  { value: 'THONG_BAO_CHUNG', label: 'Thông báo chung', emoji: '📢' },
  { value: 'HOP_KHU_PHO', label: 'Họp khu phố', emoji: '🏛️' },
  { value: 'AN_NINH', label: 'An ninh', emoji: '🛡️' },
  { value: 'MOI_TRUONG', label: 'Môi trường', emoji: '🌿' },
  { value: 'SU_KIEN', label: 'Sự kiện', emoji: '🎉' },
]

// ─── Props ────────────────────────────────────────────────────
interface Props {
  mode: 'create' | 'edit'
  defaultValues?: Partial<FormData & { anhUrl?: string }>
  id?: string
}

export default function ThongBaoForm({ mode, defaultValues, id }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [anhUrl, setAnhUrl] = useState<string>(defaultValues?.anhUrl ?? '')
  const [uploading, setUploading] = useState(false)
  // Push notification
  const [guiPush, setGuiPush] = useState(mode === 'create')
  const [pushKetQua, setPushKetQua] = useState<{
    ok: boolean; soThietBi?: number; msg: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tieuDe: defaultValues?.tieuDe ?? '',
      noiDung: defaultValues?.noiDung ?? '',
      loai: (defaultValues?.loai as FormData['loai']) ?? 'THONG_BAO_CHUNG',
      ghimLen: defaultValues?.ghimLen ?? false,
      ngayHetHan: defaultValues?.ngayHetHan ?? '',
    },
  })

  const selectedLoai = watch('loai')
  const ghimLen = watch('ghimLen')
  const noiDung = watch('noiDung')

  // ─── Upload ảnh ──────────────────────────────────────────
  async function uploadAnh(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn (tối đa 10MB)')
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `thong-bao/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('kp25-uploads')
        .upload(path, file, { upsert: false })

      if (error) throw error
      const { data: urlData } = supabase.storage.from('kp25-uploads').getPublicUrl(data.path)
      setAnhUrl(urlData.publicUrl)
      toast.success('Tải ảnh lên thành công')
    } catch {
      toast.error('Lỗi tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  // ─── Submit ───────────────────────────────────────────────
  function onSubmit(data: FormData) {
    setPushKetQua(null)
    startTransition(async () => {
      const payload = { ...data, anhUrl: anhUrl || undefined }

      if (mode === 'create') {
        const result = await taoThongBao(payload)
        if (!result.success) {
          toast.error(result.message)
          return
        }
        toast.success(result.message)

        // ── Gửi Push kèm theo ──────────────────────────
        if (guiPush && result.id) {
          try {
            const tomTat = data.noiDung.length > 150
              ? data.noiDung.slice(0, 150) + '...'
              : data.noiDung

            const loaiEmoji = LOAI_OPTIONS.find(o => o.value === data.loai)?.emoji ?? '📢'

            const res = await fetch('/api/push/send', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `${loaiEmoji} ${data.tieuDe}`,
                body:  tomTat,
                url:   `/thong-bao/${result.id}`,
              }),
            })
            const pData = await res.json() as {
              success: boolean; thanh_cong?: number; tong?: number; message?: string; error?: string
            }

            if (pData.success) {
              await danhDauDaGuiPush(result.id)
              setPushKetQua({
                ok:        true,
                soThietBi: pData.thanh_cong,
                msg:       `Đã gửi push đến ${pData.thanh_cong}/${pData.tong} thiết bị`,
              })
              toast.success(`🔔 Push gửi thành công đến ${pData.thanh_cong} thiết bị!`)
            } else {
              setPushKetQua({ ok: false, msg: pData.error ?? 'Gửi push thất bại' })
              toast.error('Thông báo đã lưu nhưng push thất bại')
            }
          } catch {
            setPushKetQua({ ok: false, msg: 'Lỗi kết nối khi gửi push' })
          }
        }

        router.push('/dashboard/thong-bao')

      } else if (mode === 'edit' && id) {
        const result = await capNhatThongBao(id, payload)
        if (result.success) {
          toast.success(result.message)
          router.push(`/dashboard/thong-bao/${id}`)
        } else {
          toast.error(result.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cột trái: nội dung chính ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tiêu đề */}
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </label>
              <input
                {...register('tieuDe')}
                className="input text-base font-medium"
                placeholder="Nhập tiêu đề thông báo..."
              />
              {errors.tieuDe && (
                <p className="text-red-500 text-xs mt-1">{errors.tieuDe.message}</p>
              )}
            </div>

            {/* Loại thông báo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Loại thông báo <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LOAI_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('loai', opt.value as FormData['loai'])}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedLoai === opt.value
                        ? 'border-[#8B1A1A] bg-red-50 text-[#8B1A1A]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div className="card">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <FileText size={14} className="inline mr-1.5 text-slate-400" />
              Nội dung thông báo <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('noiDung')}
              rows={12}
              className="input resize-y min-h-[200px] leading-relaxed"
              placeholder={`Nhập nội dung thông báo đầy đủ, rõ ràng...&#10;&#10;Ví dụ:&#10;Kính gửi toàn thể bà con ${KHU_PHO.ten},&#10;&#10;Ban quản lý khu phố xin thông báo...`}
            />
            {errors.noiDung && (
              <p className="text-red-500 text-xs mt-1">{errors.noiDung.message}</p>
            )}
            <p className="text-xs text-slate-400 mt-1.5 text-right">
              {noiDung.length} / 10.000 ký tự
            </p>
          </div>

          {/* Ảnh đính kèm */}
          <div className="card">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Ảnh minh hoạ
              <span className="font-normal text-slate-400 ml-1">(tùy chọn)</span>
            </label>

            {anhUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img src={anhUrl} alt="Ảnh thông báo" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setAnhUrl('')}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#8B1A1A] hover:bg-red-50/50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAnh(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 size={24} className="text-[#8B1A1A] animate-spin" />
                ) : (
                  <>
                    <Upload size={24} className="text-slate-300 mb-2" />
                    <span className="text-sm text-slate-400">Nhấn để tải ảnh lên</span>
                    <span className="text-xs text-slate-300 mt-0.5">PNG, JPG — tối đa 10MB</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* ── Cột phải: tuỳ chọn & publish ── */}
        <div className="space-y-5">

          {/* Ghim thông báo */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Pin size={15} className="text-[#8B1A1A]" />
              Ghim thông báo
            </h3>
            <button
              type="button"
              onClick={() => setValue('ghimLen', !ghimLen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                ghimLen
                  ? 'border-[#8B1A1A] bg-red-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${ghimLen ? 'text-[#8B1A1A]' : 'text-slate-700'}`}>
                  {ghimLen ? 'Đã ghim lên đầu' : 'Không ghim'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {ghimLen
                    ? 'Thông báo sẽ hiển thị nổi bật'
                    : 'Thông báo xuất hiện theo thứ tự thời gian'}
                </p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${
                ghimLen ? 'bg-[#8B1A1A] justify-end' : 'bg-slate-200 justify-start'
              }`}>
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>
          </div>

          {/* Gửi Push kèm theo */}
          {mode === 'create' && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BellRing size={15} className="text-[#8B1A1A]" />
                Gửi thông báo đẩy
              </h3>
              <button
                type="button"
                onClick={() => setGuiPush(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  guiPush
                    ? 'border-[#8B1A1A] bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 text-left">
                  <Smartphone size={16} className={`mt-0.5 shrink-0 ${guiPush ? 'text-[#8B1A1A]' : 'text-slate-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${guiPush ? 'text-[#8B1A1A]' : 'text-slate-700'}`}>
                      {guiPush ? 'Sẽ gửi Push kèm theo' : 'Không gửi Push'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {guiPush
                        ? 'Thông báo hiện ngay trên điện thoại người dùng'
                        : 'Chỉ lưu, không gửi đến thiết bị'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shrink-0 ml-2 ${
                  guiPush ? 'bg-[#8B1A1A] justify-end' : 'bg-slate-200 justify-start'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </button>

              {/* Kết quả push sau khi gửi */}
              {pushKetQua && (
                <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs
                  ${pushKetQua.ok
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {pushKetQua.ok
                    ? <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                    : <XCircle      size={13} className="shrink-0 mt-0.5" />
                  }
                  <span className="font-medium">{pushKetQua.msg}</span>
                </div>
              )}
            </div>
          )}

          {/* Ngày hết hạn */}
          <div className="card">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              Ngày hết hạn
              <span className="font-normal text-slate-400">(tùy chọn)</span>
            </label>
            <input
              {...register('ngayHetHan')}
              type="date"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Để trống nếu thông báo không có hạn
            </p>
          </div>

          {/* Preview loại */}
          <div className="card bg-slate-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Xem trước nhãn
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-red">
                {LOAI_OPTIONS.find((o) => o.value === selectedLoai)?.emoji}{' '}
                {LOAI_OPTIONS.find((o) => o.value === selectedLoai)?.label}
              </span>
              {ghimLen && <span className="badge badge-gray">📌 Ghim</span>}
            </div>
          </div>

          {/* Nút submit */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3.5 text-base"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {guiPush && mode === 'create' ? 'Đang đăng & gửi push...' : 'Đang lưu...'}
              </>
            ) : mode === 'create' ? (
              <>
                <Send size={18} />
                {guiPush ? 'Đăng & Gửi Push 🔔' : 'Đăng thông báo'}
              </>
            ) : (
              <>
                <Save size={18} />
                Lưu thay đổi
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Huỷ bỏ
          </button>
        </div>
      </div>
    </form>
  )
}
