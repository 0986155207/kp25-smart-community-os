'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Send, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react'
import TaiGiayTo from './TaiGiayTo'

interface Props {
  thuTucId: string
  tenThuTuc: string
}

interface FormData {
  hoTen: string
  cccd: string
  sdt: string
  email: string
  diaChiNopHoSo: string
  ghiChu: string
  chuanBiHoSo: boolean
}

const INIT: FormData = {
  hoTen: '',
  cccd: '',
  sdt: '',
  email: '',
  diaChiNopHoSo: '',
  ghiChu: '',
  chuanBiHoSo: false,
}

type Step = 'form' | 'loading' | 'success' | 'error'

export default function NopHoSoForm({ thuTucId, tenThuTuc }: Props) {
  const [step,       setStep]       = useState<Step>('form')
  const [data,       setData]       = useState<FormData>(INIT)
  const [maHoSo,     setMaHoSo]     = useState('')
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormData, string>>>({})
  const [giayToUrls, setGiayToUrls] = useState<string[]>([])

  // ── Validate ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!data.hoTen.trim())            e.hoTen         = 'Vui lòng nhập họ tên'
    if (!/^\d{9,12}$/.test(data.cccd)) e.cccd          = 'CCCD phải có 9 hoặc 12 chữ số'
    if (!/^(0|\+84)\d{9}$/.test(data.sdt.replace(/\s/g, ''))) e.sdt = 'Số điện thoại không hợp lệ'
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email không hợp lệ'
    if (!data.chuanBiHoSo)             e.chuanBiHoSo   = 'Vui lòng xác nhận đã chuẩn bị hồ sơ'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStep('loading')
    try {
      const res = await fetch('/api/thu-tuc/nop-ho-so', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, thuTucId, giayToUrls }),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.message ?? 'Lỗi hệ thống')

      setMaHoSo(json.data.maHoSo)
      setStep('success')
    } catch {
      setStep('error')
    }
  }

  function set(field: keyof FormData, value: string | boolean) {
    setData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // ── Thành công ────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Đã ghi nhận hồ sơ!</h3>
        <p className="text-slate-500 text-sm mb-4">
          Cán bộ sẽ liên hệ với bạn trong thời gian làm việc.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-green-600 font-semibold mb-1">Mã hồ sơ của bạn</p>
          <p className="text-2xl font-bold text-green-800 tracking-widest font-mono">{maHoSo}</p>
          <p className="text-xs text-green-600 mt-1">Lưu mã này để tra cứu trạng thái xử lý</p>
        </div>

        <a
          href={`/thu-tuc/tra-cuu?ma=${maHoSo}`}
          className="block w-full py-3 px-4 bg-[#8B1A1A] text-white text-sm font-semibold
                     rounded-xl text-center hover:bg-[#6d1414] transition-colors mb-3"
        >
          Theo dõi hồ sơ
        </a>
        <button
          onClick={() => { setStep('form'); setData(INIT); setErrors({}) }}
          className="block w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Nộp hồ sơ khác
        </button>
      </div>
    )
  }

  // ── Lỗi ──────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-slate-800 mb-1">Gửi không thành công</h3>
        <p className="text-sm text-slate-500 mb-4">Vui lòng thử lại hoặc đến UBND Phường nộp trực tiếp.</p>
        <button
          onClick={() => setStep('form')}
          className="w-full py-3 bg-[#8B1A1A] text-white text-sm font-semibold rounded-xl
                     hover:bg-[#6d1414] transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B1A1A] to-[#a52a2a] p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Send size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Nộp hồ sơ trực tuyến</h3>
            <p className="text-xs text-white/70">Miễn phí · Nhanh chóng · An toàn</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">

        {/* Họ tên */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={data.hoTen}
              onChange={e => set('hoTen', e.target.value)}
              placeholder="Nguyễn Văn A"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-slate-800
                          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20
                          transition-all ${errors.hoTen ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-[#8B1A1A]'}`}
            />
          </div>
          {errors.hoTen && <p className="text-xs text-red-500 mt-1">{errors.hoTen}</p>}
        </div>

        {/* CCCD */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Số CCCD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={data.cccd}
              onChange={e => set('cccd', e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="012345678901"
              maxLength={12}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono text-slate-800
                          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20
                          transition-all ${errors.cccd ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-[#8B1A1A]'}`}
            />
          </div>
          {errors.cccd && <p className="text-xs text-red-500 mt-1">{errors.cccd}</p>}
        </div>

        {/* SĐT */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={data.sdt}
              onChange={e => set('sdt', e.target.value)}
              placeholder="0901 234 567"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-slate-800
                          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20
                          transition-all ${errors.sdt ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-[#8B1A1A]'}`}
            />
          </div>
          {errors.sdt && <p className="text-xs text-red-500 mt-1">{errors.sdt}</p>}
        </div>

        {/* Email (tùy chọn) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email <span className="text-slate-400 font-normal">(tùy chọn — nhận thông báo)</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={data.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@gmail.com"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm text-slate-800
                          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20
                          transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-[#8B1A1A]'}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Địa chỉ nhận kết quả */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Địa chỉ nhận kết quả
          </label>
          <input
            type="text"
            value={data.diaChiNopHoSo}
            onChange={e => set('diaChiNopHoSo', e.target.value)}
            placeholder="Nhập địa chỉ nếu muốn nhận qua bưu điện"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
                       placeholder:text-slate-400 focus:outline-none focus:border-[#8B1A1A]
                       focus:ring-2 focus:ring-[#8B1A1A]/20 bg-white transition-all"
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ghi chú thêm
          </label>
          <textarea
            value={data.ghiChu}
            onChange={e => set('ghiChu', e.target.value)}
            rows={3}
            placeholder="Nhập thông tin bổ sung nếu cần..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
                       placeholder:text-slate-400 focus:outline-none focus:border-[#8B1A1A]
                       focus:ring-2 focus:ring-[#8B1A1A]/20 bg-white transition-all resize-none"
          />
        </div>

        {/* Upload giấy tờ */}
        <TaiGiayTo
          onUrlsChange={setGiayToUrls}
          disabled={step === 'loading'}
          maxFiles={5}
          maxSizeMB={5}
        />

        {/* Xác nhận */}
        <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all
                           ${data.chuanBiHoSo
                              ? 'bg-green-50 border-green-200'
                              : errors.chuanBiHoSo
                                ? 'bg-red-50 border-red-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                           }`}>
          <input
            type="checkbox"
            checked={data.chuanBiHoSo}
            onChange={e => set('chuanBiHoSo', e.target.checked)}
            className="mt-0.5 accent-[#8B1A1A]"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            Tôi xác nhận đã chuẩn bị đầy đủ thành phần hồ sơ theo yêu cầu và thông tin cung cấp là chính xác.
          </span>
        </label>
        {errors.chuanBiHoSo && (
          <p className="text-xs text-red-500">{errors.chuanBiHoSo}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={step === 'loading'}
          className="w-full py-3.5 bg-[#8B1A1A] text-white font-bold text-sm rounded-xl
                     hover:bg-[#6d1414] disabled:opacity-60 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {step === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send size={15} />
              Nộp hồ sơ ngay
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Thông tin của bạn được bảo mật theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
          Cán bộ sẽ liên hệ xác nhận trong giờ làm việc.
        </p>
      </form>
    </div>
  )
}
