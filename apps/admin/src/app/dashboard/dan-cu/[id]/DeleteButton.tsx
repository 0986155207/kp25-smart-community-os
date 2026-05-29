'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { xoaHoDan } from '../actions'

interface Props {
  id: string
  chuHo: string
}

export default function DeleteButton({ id, chuHo }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await xoaHoDan(id)
      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/dan-cu')
      } else {
        toast.error(result.message, { duration: 6000 })
        setOpen(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
      >
        <Trash2 size={14} />
        Xoá hộ dân
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Xác nhận xoá hộ dân</h3>
                <p className="text-slate-400 text-sm mt-0.5">Dữ liệu sẽ bị ẩn, không thể khôi phục qua giao diện</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
              <p className="text-sm text-slate-500 mb-0.5">Chủ hộ</p>
              <p className="text-sm text-slate-900 font-semibold">{chuHo}</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 mb-5 border border-amber-100">
              <p className="text-xs text-amber-700">
                ⚠️ Tất cả dữ liệu nhân khẩu trong hộ cũng sẽ bị ẩn cùng.
              </p>
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
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
