'use client'

import { useState, useTransition } from 'react'
import { Search, CheckCircle2, XCircle, Loader2, Home, Users, MapPin, BadgeCheck } from 'lucide-react'
import { traCuuHoDan } from './actions'
import type { KetQuaTraCuu } from './actions'

const TRANG_THAI_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  'Thường trú': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Tạm trú':    { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  'Tạm vắng':   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
}

export default function TraCuuForm() {
  const [hoTen,   setHoTen]   = useState('')
  const [diaChi,  setDiaChi]  = useState('')
  const [result,  setResult]  = useState<KetQuaTraCuu | null>(null)
  const [searched, setSearched] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hoTen.trim() || !diaChi.trim()) return
    setSearched(false)
    startTransition(async () => {
      const res = await traCuuHoDan(hoTen, diaChi)
      setResult(res)
      setSearched(true)
    })
  }

  const style = result?.trangThai ? (TRANG_THAI_STYLE[result.trangThai] ?? TRANG_THAI_STYLE['Thường trú']!) : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
          <Search size={18} className="text-[#1E3A5F]" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Tra cứu đăng ký hộ khẩu</h2>
          <p className="text-xs text-slate-500 mt-0.5">Nhập họ tên chủ hộ và địa chỉ để kiểm tra trạng thái</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Họ và tên chủ hộ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={hoTen}
            onChange={e => setHoTen(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Địa chỉ (số nhà hoặc đường) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={diaChi}
            onChange={e => setDiaChi(e.target.value)}
            placeholder="VD: 63/22 Đường Số 1"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={pending || !hoTen.trim() || !diaChi.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending
            ? <><Loader2 size={16} className="animate-spin" /> Đang tra cứu...</>
            : <><Search size={16} /> Tra cứu</>
          }
        </button>
      </form>

      {/* Kết quả */}
      {searched && result && (
        <div className="mt-5">
          {result.found ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="font-semibold text-emerald-800 text-sm">Tìm thấy thông tin hộ dân</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Home size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500">Chủ hộ: </span>
                    <span className="text-sm font-semibold text-slate-800">{result.chuHo}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500">Địa chỉ: </span>
                    <span className="text-sm text-slate-700">{result.diaChiDay}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{result.soNhanKhau} nhân khẩu</span>
                </div>
                {style && result.trangThai && (
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck size={14} className="text-slate-400 shrink-0" />
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {result.trangThai}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
                Thông tin chỉ hiển thị cơ bản. Để cập nhật hoặc xem chi tiết, vui lòng liên hệ trực tiếp Ban quản lý.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex items-start gap-3">
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Không tìm thấy thông tin</p>
                <p className="text-xs text-red-600 mt-1">
                  Kiểm tra lại họ tên và địa chỉ, hoặc liên hệ Trưởng khu phố để được hỗ trợ.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
