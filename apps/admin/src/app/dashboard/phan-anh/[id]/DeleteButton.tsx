'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { xoaPhanAnh } from '../actions'

export default function DeleteButton({ id, tieuDe }: { id: string; tieuDe: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await xoaPhanAnh(id)
      if (result.success) {
        toast.success(result.message)
        router.push('/dashboard/phan-anh')
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
        Xoá
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
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
                <h3 className="font-bold text-slate-900">Xác nhận xoá phản ánh</h3>
                <p className="text-slate-400 text-sm mt-0.5">Dữ liệu sẽ bị ẩn, không thể khôi phục qua giao diện</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
              <p className="text-sm text-slate-700 font-medium line-clamp-2">{tieuDe}</p>
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
