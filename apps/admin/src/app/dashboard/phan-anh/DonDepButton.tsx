'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { xoaHetDaXuLy } from './actions'

export default function DonDepButton({ soLuong }: { soLuong: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (soLuong === 0) return null

  function handleDonDep() {
    startTransition(async () => {
      const result = await xoaHetDaXuLy()
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-red-200 hover:text-red-600 transition-all"
      >
        <Sparkles size={14} />
        Dọn dẹp ({soLuong})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Dọn dẹp phản ánh cũ</h3>
                <p className="text-slate-400 text-sm mt-0.5">Xoá tất cả phản ánh đã xử lý / đã đóng</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold mb-1">
                Sẽ xoá {soLuong} phản ánh
              </p>
              <ul className="text-xs text-amber-700 space-y-1 mt-2">
                <li>✅ Tất cả phản ánh trạng thái <strong>Đã xử lý</strong></li>
                <li>✅ Tất cả phản ánh trạng thái <strong>Đã đóng</strong></li>
                <li className="text-amber-600 mt-2">⚠️ Dữ liệu bị ẩn, không thể khôi phục qua giao diện</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleDonDep}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Xoá {soLuong} mục
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
