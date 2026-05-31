'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, User, Phone, Users } from 'lucide-react'

interface Props {
  suKienId: string
  tenSuKien: string
}

interface FormData {
  hoTen: string
  soDienThoai: string
  soNguoi: number
  ghiChu: string
}

export default function DangKyForm({ suKienId, tenSuKien }: Props) {
  const [form, setForm] = useState<FormData>({
    hoTen: '',
    soDienThoai: '',
    soNguoi: 1,
    ghiChu: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.hoTen.trim()) { setError('Vui lòng nhập họ tên'); return }
    if (!form.soDienThoai.trim()) { setError('Vui lòng nhập số điện thoại'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/su-kien/dang-ky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suKienId,
          hoTen: form.hoTen.trim(),
          soDienThoai: form.soDienThoai.trim(),
          soNguoi: form.soNguoi,
          ghiChu: form.ghiChu.trim() || null,
        }),
      })
      const data = await res.json() as { success: boolean; message: string }
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message ?? 'Đăng ký thất bại, vui lòng thử lại')
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center
                        justify-center mx-auto mb-3">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-emerald-900 text-base mb-1">
          Đăng ký thành công!
        </h3>
        <p className="text-emerald-700 text-sm">
          Chúng tôi sẽ liên hệ xác nhận qua số điện thoại của bạn.
        </p>
        <p className="text-emerald-600 text-xs mt-2 font-medium">
          Sự kiện: {tenSuKien}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">

      {/* Họ tên */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={form.hoTen}
            onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))}
            placeholder="Nguyễn Văn A"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20
                       focus:border-[#1E3A5F] text-sm transition-colors"
          />
        </div>
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            value={form.soDienThoai}
            onChange={e => setForm(f => ({ ...f, soDienThoai: e.target.value }))}
            placeholder="Nhập số điện thoại của bạn"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20
                       focus:border-[#1E3A5F] text-sm transition-colors"
          />
        </div>
      </div>

      {/* Số người */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Số người tham dự
        </label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={form.soNguoi}
            onChange={e => setForm(f => ({ ...f, soNguoi: Number(e.target.value) }))}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20
                       focus:border-[#1E3A5F] text-sm bg-white transition-colors"
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n} người</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ghi chú (không bắt buộc)
        </label>
        <textarea
          value={form.ghiChu}
          onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
          placeholder="Thông tin thêm nếu có..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                     focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20
                     focus:border-[#1E3A5F] text-sm resize-none transition-colors"
        />
      </div>

      {/* Lỗi */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#8B1A1A] text-white font-semibold text-sm
                   hover:bg-[#7a1616] disabled:opacity-60 disabled:cursor-not-allowed
                   transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            Đăng ký tham dự
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Thông tin sẽ được Ban điều hành Khu phố 25 liên hệ xác nhận
      </p>
    </form>
  )
}
