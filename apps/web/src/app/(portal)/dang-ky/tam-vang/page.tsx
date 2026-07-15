'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, UserMinus, CheckCircle2,
  Loader2, AlertCircle, User, MapPin, Calendar,
  Phone, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { guiDangKyTamVang } from '../actions'

// ─── Lý do ──────────────────────────────────────────────────────
const LY_DO = [
  { value: 'LAM_VIEC',   label: 'Làm việc',         emoji: '💼' },
  { value: 'HOC_TAP',    label: 'Học tập',           emoji: '📚' },
  { value: 'CHUA_BENH',  label: 'Chữa bệnh',        emoji: '🏥' },
  { value: 'DU_LICH',    label: 'Du lịch',           emoji: '✈️' },
  { value: 'THAM_THAN',  label: 'Thăm thân nhân',   emoji: '👨‍👩‍👦' },
  { value: 'KHAC',       label: 'Khác',             emoji: '📋' },
]

type FormState = {
  // Bước 1 — Cá nhân
  ho_ten:           string
  ngay_sinh:        string
  gioi_tinh:        string
  so_cccd:          string
  sdt_lien_lac:     string
  // Bước 2 — Địa chỉ
  dia_chi_hien_tai: string
  dia_chi_tam_vang: string
  tinh_thanh_den:   string
  // Bước 3 — Thời gian & người thân
  ly_do_tam_vang:   string
  ngay_di:          string
  ngay_du_kien_ve:  string
  ho_ten_nguoi_than:string
  sdt_nguoi_than:   string
  ghi_chu:          string
}

const DEFAULT: FormState = {
  ho_ten: '', ngay_sinh: '', gioi_tinh: 'NAM', so_cccd: '', sdt_lien_lac: '',
  dia_chi_hien_tai: '', dia_chi_tam_vang: '', tinh_thanh_den: '',
  ly_do_tam_vang: 'LAM_VIEC', ngay_di: '', ngay_du_kien_ve: '',
  ho_ten_nguoi_than: '', sdt_nguoi_than: '', ghi_chu: '',
}

const STEPS = [
  { label: 'Cá nhân',   icon: User     },
  { label: 'Địa chỉ',   icon: MapPin   },
  { label: 'Thời gian', icon: Calendar },
]

// ─── Component ───────────────────────────────────────────────────
export default function DangKyTamVangPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [isPending, startTransition] = useTransition()
  const [doneId, setDoneId] = useState<string | null>(null)

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.ho_ten.trim()) return 'Vui lòng nhập họ tên'
      if (!form.sdt_lien_lac.trim()) return 'Vui lòng nhập số điện thoại liên lạc'
      if (!/^(0[3-9][0-9]{8})$/.test(form.sdt_lien_lac.trim())) {
        return 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03–09)'
      }
    }
    if (step === 1) {
      if (!form.dia_chi_hien_tai.trim()) return `Vui lòng nhập địa chỉ hiện tại tại ${KHU_PHO.ma}`
      if (!form.dia_chi_tam_vang.trim()) return 'Vui lòng nhập nơi đến'
    }
    if (step === 2) {
      if (!form.ngay_di) return 'Vui lòng chọn ngày đi'
      if (form.ngay_du_kien_ve && form.ngay_du_kien_ve <= form.ngay_di) {
        return 'Ngày dự kiến về phải sau ngày đi'
      }
    }
    return null
  }

  function nextStep() {
    const err = validateStep()
    if (err) { toast.error(err); return }
    setStep(s => s + 1)
  }

  function handleSubmit() {
    const err = validateStep()
    if (err) { toast.error(err); return }

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    startTransition(async () => {
      const result = await guiDangKyTamVang(fd)
      if (result.success && result.id) {
        setDoneId(result.id)
        toast.success('Khai báo thành công!')
      } else {
        toast.error(result.message)
      }
    })
  }

  // ── Màn hình thành công ────────────────────────────────────────
  if (doneId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Khai báo thành công!</h2>
        <p className="text-slate-500 leading-relaxed">
          Đơn khai báo tạm vắng đã được tiếp nhận và lưu vào hệ thống {KHU_PHO.ten}.
          Hãy liên hệ khi có thay đổi về thời gian hoặc địa điểm.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2">
          <p className="text-xs text-slate-500 font-medium">Thông tin đơn</p>
          <p className="text-sm font-semibold text-slate-800">{form.ho_ten}</p>
          <p className="text-xs text-slate-500">Đến: {form.dia_chi_tam_vang}{form.tinh_thanh_den ? ` — ${form.tinh_thanh_den}` : ''}</p>
          <p className="text-xs text-slate-500">Ngày đi: {form.ngay_di}</p>
          <p className="text-xs font-mono text-slate-400 mt-2">Mã hồ sơ: {doneId.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dang-ky/tra-cuu" className="btn-outline">
            Tra cứu hồ sơ
          </Link>
          <Link href="/dang-ky" className="btn-primary">
            Về trang đăng ký
          </Link>
        </div>
      </div>
    )
  }

  // ─── Main form ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/dang-ky" className="hover:text-slate-600 transition-colors">Đăng ký</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Khai báo Tạm vắng</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/dang-ky')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
          <UserMinus size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Khai báo Tạm vắng</h1>
          <p className="text-sm text-slate-500">{KHU_PHO.ten} · Phường Long Trường</p>
        </div>
      </div>

      {/* Cảnh báo bắt buộc */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-6">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Lưu ý:</strong> Theo quy định, cư dân vắng mặt liên tục trên 30 ngày phải
          khai báo tạm vắng với Ban quản lý khu phố trước khi rời đi.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${i < step ? 'bg-orange-500 text-white' : i === step ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? <CheckCircle2 size={16} /> : <s.icon size={15} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium transition-colors
                ${i <= step ? 'text-orange-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mb-5 transition-colors ${i < step ? 'bg-orange-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Bước 1: Thông tin cá nhân ─────────────────────────── */}
      {step === 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <User size={16} className="text-orange-500" />
            Thông tin cá nhân
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-form">Họ và tên <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Nguyễn Văn A" value={form.ho_ten}
                onChange={e => set('ho_ten', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Số CCCD / CMND</label>
              <input className="input font-mono" placeholder="079200012345" value={form.so_cccd}
                onChange={e => set('so_cccd', e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Dùng để tra cứu hồ sơ sau này</p>
            </div>

            <div>
              <label className="label-form">SĐT liên lạc <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Nhập số điện thoại của bạn" type="tel" value={form.sdt_lien_lac}
                onChange={e => set('sdt_lien_lac', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Ngày sinh</label>
              <input className="input" type="date" value={form.ngay_sinh}
                onChange={e => set('ngay_sinh', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Giới tính</label>
              <select className="input" value={form.gioi_tinh}
                onChange={e => set('gioi_tinh', e.target.value)}>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Bước 2: Địa chỉ ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />
              Địa chỉ hiện tại tại {KHU_PHO.ma}
            </h2>
            <div>
              <label className="label-form">Địa chỉ đang ở tại {KHU_PHO.ma} <span className="text-red-500">*</span></label>
              <input className="input" placeholder={`Số nhà, tên đường, ${KHU_PHO.ten}, Phường Long Trường`}
                value={form.dia_chi_hien_tai} onChange={e => set('dia_chi_hien_tai', e.target.value)} />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={16} className="text-orange-500" />
              Nơi đến (tạm vắng)
            </h2>
            <div>
              <label className="label-form">Địa chỉ nơi đến <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                value={form.dia_chi_tam_vang} onChange={e => set('dia_chi_tam_vang', e.target.value)} />
            </div>
            <div>
              <label className="label-form">Tỉnh / Thành phố</label>
              <input className="input" placeholder="Ví dụ: Hà Nội, Đà Nẵng, Bình Dương..."
                value={form.tinh_thanh_den} onChange={e => set('tinh_thanh_den', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Bước 3: Thời gian & người thân ────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Lý do */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Lý do tạm vắng
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LY_DO.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('ly_do_tam_vang', opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all
                    ${form.ly_do_tam_vang === opt.value
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thời gian */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              Thời gian
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Ngày đi <span className="text-red-500">*</span></label>
                <input className="input" type="date" value={form.ngay_di}
                  onChange={e => set('ngay_di', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Ngày dự kiến về</label>
                <input className="input" type="date" value={form.ngay_du_kien_ve}
                  min={form.ngay_di || undefined}
                  onChange={e => set('ngay_du_kien_ve', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Người thân liên lạc */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Phone size={15} className="text-slate-400" />
              Người thân liên hệ khi cần
              <span className="font-normal text-slate-400">(tùy chọn)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Tên người thân</label>
                <input className="input" placeholder="Họ tên" value={form.ho_ten_nguoi_than}
                  onChange={e => set('ho_ten_nguoi_than', e.target.value)} />
              </div>
              <div>
                <label className="label-form">SĐT người thân</label>
                <input className="input" placeholder="09xx..." type="tel" value={form.sdt_nguoi_than}
                  onChange={e => set('sdt_nguoi_than', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="card">
            <label className="label-form">Ghi chú bổ sung <span className="text-slate-400 font-normal">(tùy chọn)</span></label>
            <textarea className="input resize-none" rows={2}
              placeholder="Thông tin bổ sung nếu có..."
              value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} />
          </div>

          {/* Xác nhận */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-slate-700">Xác nhận thông tin</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
              <span className="text-slate-400">Họ tên:</span>      <span className="font-medium">{form.ho_ten}</span>
              <span className="text-slate-400">SĐT:</span>          <span>{form.sdt_lien_lac}</span>
              <span className="text-slate-400">Địa chỉ {KHU_PHO.ma}:</span> <span className="truncate">{form.dia_chi_hien_tai}</span>
              <span className="text-slate-400">Nơi đến:</span>      <span className="truncate">{form.dia_chi_tam_vang}</span>
              <span className="text-slate-400">Ngày đi:</span>      <span>{form.ngay_di || '—'}</span>
              <span className="text-slate-400">Lý do:</span>        <span>{LY_DO.find(l => l.value === form.ly_do_tam_vang)?.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Nút điều hướng ────────────────────────────────────── */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
          >
            Tiếp theo
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {isPending ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</> : <><CheckCircle2 size={16} />Gửi khai báo</>}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">Bước {step + 1} / {STEPS.length}</p>
    </div>
  )
}
