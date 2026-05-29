'use client'

import { useTransition } from 'react'
import { Pin, PinOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { toggleGhim } from './actions'

export default function GhimButton({ id, ghimLen }: { id: string; ghimLen: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleGhim(id, !ghimLen)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={ghimLen ? 'Bỏ ghim' : 'Ghim lên đầu'}
      className={`p-2 rounded-lg transition-colors ${
        ghimLen
          ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {isPending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : ghimLen ? (
        <PinOff size={15} />
      ) : (
        <Pin size={15} />
      )}
    </button>
  )
}
