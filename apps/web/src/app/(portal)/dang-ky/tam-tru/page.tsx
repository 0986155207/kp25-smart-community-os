'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, UserCheck, CheckCircle2,
  Loader2, AlertCircle, User, MapPin, Calendar,
  Home, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { guiDangKyTamTru } from '../actions'

// ─── Lý do ──────────────────────────────────────────────────────
const LY_DO = [
  { value: 'LAM_VIEC',   label: 'Làm việc',    emoji: '💼' },
  { value: 'HOC_TAP',    label: 'Học tập',     emoji: '📚' },
  { value: 'NHAN_VIEC',  label: 'Nhận việc làm',emoji: '🤝' },
  { value: 'CHUA_BENH',  label: 'Chữa bệnh',   emoji: '🏥' },
  { value: 'KINH_DOANH', label: 'Kinh doanh',  emoji: '🏪' },
  { value: 'KHAC',       label: 'Khác',        emoji: '📋' },
]

// ─── State mặc định ─────────────────────────────────────────────
type FormState = {
  // Bước 1 — Cá nhân
  ho_ten:             string
  ngay_sinh:          string
  gioi_tinh:          string
  so_cccd:            string
  noi_sinh:           string
  dan_toc:            string
  // Bước 2 — Địa chỉ
  dia_chi_thuong_tru: string
  tinh_thanh_goc:     string
  dia_chi_tam_tru:    string
  so_nha_tam_tru:     string
  duong_tam_tru:      string
  chu_nha_ho_ten:     string
  chu_nha_sdt:        string
  // Bước 3 — Thời gian
  ly_do_tam_tru:      string
  ngay_bat_dau:       string
  ngay_ket_thuc:      string
  ghi_chu:            string
}

const DEFAULT: FormState = {
  ho_ten: '', ngay_sinh: '', gioi_tinh: 'NAM', so_cccd: '', noi_sinh: '', dan_toc: 'Kinh',
  dia_chi_thuong_tru: '', tinh_thanh_goc: '', dia_chi_tam_tru: '',
  so_nha_tam_tru: '', duong_tam_tru: '', chu_nha_ho_ten: '', chu_nha_sdt: '',
  ly_do_tam_tru: 'LAM_VIEC', ngay_bat_dau: '', ngay_ket_thuc: '', ghi_chu: '',
}

const STEPS = [
  { label: 'Cá nhân',   icon: User     },
  { label: 'Địa chỉ',   icon: MapPin   },
  { label: 'Thời gian', icon: Calendar },
]

// ─── Component ───────────────────────────────────────────────────
export default function DangKyTamTruPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [isPending, startTransition] = useTransition()
  const [doneId, setDoneId] = useState<string | null>(null)

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  // ── Validate từng bước ─────────────────────────────────────────
  function validateStep(): string | null {
    if (step === 0) {
      if (!form.ho_ten.trim()) return 'Vui lòng nhập họ tên'
      if (!form.so_cccd.trim()) return 'Vui lòng nhập số CCCD/CMND'
      if (form.so_cccd.trim().length < 9) return 'Số CCCD/CMND không hợp lệ (tối thiểu 9 ký tự)'
    }
    if (step === 1) {
      if (!form.dia_chi_thuong_tru.trim()) return 'Vui lòng nhập địa chỉ thường trú'
      if (!form.dia_chi_tam_tru.trim()) return 'Vui lòng nhập địa chỉ tạm trú tại KP25'
    }
    if (step === 2) {
      if (!form.ngay_bat_dau) return 'Vui lòng chọn ngày bắt đầu tạm trú'
      if (form.ngay_ket_thuc && form.ngay_ket_thuc <= form.ngay_bat_dau) {
        return 'Ngày kết thúc phải sau ngày bắt đầu'
      }
    }
    return null
  }

  function nextStep() {
    const err = validateStep()
    if (err) { toast.error(err); return }
    setStep(s => s + 1)
  }

  // ── Submit ─────────────────────────────────────────────────────
  function handleSubmit() {
    const err = validateStep()
    if (err) { toast.error(err); return }

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    startTransition(async () => {
      const result = await guiDangKyTamTru(fd)
      if (result.success && result.id) {
        setDoneId(result.id)
        toast.success('Đăng ký thành công!')
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
        <h2 className="text-2xl font-bold text-slate-900">Đăng ký thành công!</h2>
        <p className="text-slate-500 leading-relaxed">
          Đơn đăng ký tạm trú của bạn đã được tiếp nhận. Ban quản lý Khu phố 25 sẽ
          liên hệ xác nhận trong <strong>1–3 ngày làm việc</strong>.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2">
          <p className="text-xs text-slate-500 font-medium">Thông tin đơn</p>
          <p className="text-sm font-semibold text-slate-800">{form.ho_ten}</p>
          <p className="text-xs text-slate-500">CCCD: <span className="font-mono font-semibold">{form.so_cccd}</span></p>
          <p className="text-xs text-slate-500">Địa chỉ tạm trú: {form.dia_chi_tam_tru}</p>
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
        <span className="text-slate-700 font-medium">Đăng ký Tạm trú</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/dang-ky')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <UserCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Đăng ký Tạm trú</h1>
          <p className="text-sm text-slate-500">Khu phố 25 · Phường Long Trường</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? <CheckCircle2 size={16} /> : <s.icon size={15} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium transition-colors
                ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mb-5 transition-colors ${i < step ? 'bg-blue-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Bước 1: Thông tin cá nhân ─────────────────────────── */}
      {step === 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Thông tin cá nhân
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-form">Họ và tên <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Nguyễn Văn A" value={form.ho_ten}
                onChange={e => set('ho_ten', e.target.value)} />
            </div>

            <div>
              <label className="label-form">Số CCCD / CMND <span className="text-red-500">*</span></label>
              <input className="input font-mono" placeholder="079200012345" value={form.so_cccd}
                onChange={e => set('so_cccd', e.target.value)} />
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

            <div>
              <label className="label-form">Dân tộc</label>
              <input className="input" placeholder="Kinh" value={form.dan_toc}
                onChange={e => set('dan_toc', e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="label-form">Nơi sinh</label>
              <input className="input" placeholder="Tỉnh / Thành phố nơi sinh" value={form.noi_sinh}
                onChange={e => set('noi_sinh', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Bước 2: Địa chỉ ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Thường trú */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Home size={16} className="text-slate-500" />
              Địa chỉ thường trú (nơi cư trú gốc)
            </h2>
            <div>
              <label className="label-form">Địa chỉ thường trú <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                value={form.dia_chi_thuong_tru} onChange={e => set('dia_chi_thuong_tru', e.target.value)} />
            </div>
            <div>
              <label className="label-form">Tỉnh / Thành phố gốc</label>
              <input className="input" placeholder="Ví dụ: Bình Định, Đà Nẵng..."
                value={form.tinh_thanh_goc} onChange={e => set('tinh_thanh_goc', e.target.value)} />
            </div>
          </div>

          {/* Tạm trú */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              Địa chỉ tạm trú tại KP25
            </h2>
            <div>
              <label className="label-form">Địa chỉ đầy đủ <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Số nhà, tên đường, Khu phố 25, Phường Long Trường"
                value={form.dia_chi_tam_tru} onChange={e => set('dia_chi_tam_tru', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-form">Số nhà</label>
                <input className="input" placeholder="123/4" value={form.so_nha_tam_tru}
                  onChange={e => set('so_nha_tam_tru', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Đường / Hẻm</label>
                <input className="input" placeholder="Đường Số 5" value={form.duong_tam_tru}
                  onChange={e => set('duong_tam_tru', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Chủ nhà */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <User size={15} className="text-slate-400" />
              Thông tin chủ nhà / chủ cơ sở
              <span className="font-normal text-slate-400">(nếu thuê)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Tên chủ nhà</label>
                <input className="input" placeholder="Họ tên chủ nhà" value={form.chu_nha_ho_ten}
                  onChange={e => set('chu_nha_ho_ten', e.target.value)} />
              </div>
              <div>
                <label className="label-form">SĐT chủ nhà</label>
                <input className="input" placeholder="09xx..." type="tel" value={form.chu_nha_sdt}
                  onChange={e => set('chu_nha_sdt', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bước 3: Thời gian & Lý do ─────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Lý do */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              Lý do tạm trú
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LY_DO.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('ly_do_tam_tru', opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all
                    ${form.ly_do_tam_tru === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
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
              <Calendar size={16} className="text-blue-500" />
              Thời gian
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-form">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input className="input" type="date" value={form.ngay_bat_dau}
                  onChange={e => set('ngay_bat_dau', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Ngày kết thúc dự kiến</label>
                <input className="input" type="date" value={form.ngay_ket_thuc}
                  min={form.ngay_bat_dau || undefined}
                  onChange={e => set('ngay_ket_thuc', e.target.value)} />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              Thời hạn tạm trú tối đa <strong>24 tháng</strong> (Luật Cư trú 2020). Có thể gia hạn nhiều lần khi hết hạn.
            </div>
          </div>

          {/* Ghi chú */}
          <div className="card">
            <label className="label-form">Ghi chú bổ sung <span className="text-slate-400 font-normal">(tùy chọn)</span></label>
            <textarea className="input resize-none" rows={3}
              placeholder="Thông tin bổ sung nếu có..."
              value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} />
          </div>

          {/* CA khu vực xét duyệt */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">👮</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Công an khu vực xét duyệt</p>
              <p className="font-bold text-blue-900">Trần Hữu Hùng</p>
              <p className="text-xs text-blue-600">Khu phố 25 · Phường Long Trường · Xét duyệt: 1–5 ngày làm việc</p>
            </div>
            <a
              href="tel:0988897709"
              className="shrink-0 flex flex-col items-center gap-0.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-colors"
            >
              <span className="text-base leading-none">📞</span>
              <span className="text-[11px] font-bold">0988 897 709</span>
            </a>
          </div>

          {/* Xác nhận */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-slate-700">Xác nhận thông tin</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
              <span className="text-slate-400">Họ tên:</span>     <span className="font-medium">{form.ho_ten}</span>
              <span className="text-slate-400">CCCD:</span>        <span className="font-mono">{form.so_cccd}</span>
              <span className="text-slate-400">Thường trú:</span>  <span className="truncate">{form.dia_chi_thuong_tru}</span>
              <span className="text-slate-400">Tạm trú:</span>     <span className="truncate">{form.dia_chi_tam_tru}</span>
              <span className="text-slate-400">Ngày bắt đầu:</span><span>{form.ngay_bat_dau || '—'}</span>
              <span className="text-slate-400">Lý do:</span>       <span>{LY_DO.find(l => l.value === form.ly_do_tam_tru)?.label}</span>
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
          >
            Tiếp theo
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {isPending ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</> : <><CheckCircle2 size={16} />Gửi đơn đăng ký</>}
          </button>
        )}
      </div>

      {/* Bước / tổng */}
      <p className="text-center text-xs text-slate-400 mt-3">Bước {step + 1} / {STEPS.length}</p>
    </div>
  )
}
