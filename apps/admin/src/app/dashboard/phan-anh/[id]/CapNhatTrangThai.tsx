'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Clock, XCircle, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { capNhatTrangThai } from '../actions'

const TRANG_THAI_OPTIONS = [
  {
    value: 'MOI',
    label: 'Mới — Chờ tiếp nhận',
    description: 'Phản ánh vừa được gửi, chưa có cán bộ tiếp nhận.',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    dotBg: 'bg-amber-600',
  },
  {
    value: 'DANG_XU_LY',
    label: 'Đang xử lý',
    description: 'Đã tiếp nhận, đang trong quá trình giải quyết.',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    dotBg: 'bg-blue-600',
  },
  {
    value: 'DA_XU_LY',
    label: 'Đã xử lý xong',
    description: 'Vấn đề đã được giải quyết hoàn toàn.',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    dotBg: 'bg-emerald-600',
  },
  {
    value: 'DONG',
    label: 'Đóng hồ sơ',
    description: 'Đóng hồ sơ (không xử lý hoặc đã hết hạn).',
    icon: XCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    dotBg: 'bg-slate-500',
  },
]

interface Props {
  id: string
  currentTrangThai: string
  currentKetQua: string
}

export default function CapNhatTrangThai({ id, currentTrangThai, currentKetQua }: Props) {
  const [trangThai, setTrangThai] = useState(currentTrangThai)
  const [ketQua, setKetQua] = useState(currentKetQua)
  const [isPending, startTransition] = useTransition()

  const hasChanged = trangThai !== currentTrangThai || ketQua !== currentKetQua

  function handleSubmit() {
    startTransition(async () => {
      const result = await capNhatTrangThai(id, trangThai, ketQua)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Chọn trạng thái */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Trạng thái xử lý</label>
        <div className="space-y-2">
          {TRANG_THAI_OPTIONS.map((opt) => {
            const isSelected = trangThai === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTrangThai(opt.value)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `${opt.border} ${opt.bg}`
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${isSelected ? opt.color : 'text-slate-400'}`}>
                  <opt.icon size={18} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? opt.color : 'text-slate-700'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                </div>
                {isSelected && (
                  <div className={`ml-auto shrink-0 w-5 h-5 rounded-full ${opt.dotBg} flex items-center justify-center`}>
                    <CheckCircle size={13} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Kết quả xử lý */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Kết quả xử lý
          <span className="font-normal text-slate-400 ml-1">(tùy chọn)</span>
        </label>
        <textarea
          value={ketQua}
          onChange={(e) => setKetQua(e.target.value)}
          rows={4}
          className="input resize-none"
          placeholder="Mô tả kết quả, biện pháp đã thực hiện, ghi chú xử lý..."
        />
      </div>

      {/* Nút lưu */}
      <button
        onClick={handleSubmit}
        disabled={isPending || !hasChanged}
        className="btn-primary w-full py-3 disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            <Save size={16} />
            Lưu thay đổi
          </>
        )}
      </button>

      {!hasChanged && (
        <p className="text-center text-xs text-slate-400">Chưa có thay đổi nào</p>
      )}
    </div>
  )
}
