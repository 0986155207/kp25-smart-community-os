'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { xoaTaiLieu } from '../actions'

export default function XoaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium
          bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
      >
        <Trash2 size={15} />
        Xoá tài liệu
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
      <p className="text-xs text-red-700 font-medium text-center">Xác nhận xoá?</p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Huỷ
        </button>
        <button
          onClick={() => startTransition(async () => { await xoaTaiLieu(id) })}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
          Xoá
        </button>
      </div>
    </div>
  )
}
