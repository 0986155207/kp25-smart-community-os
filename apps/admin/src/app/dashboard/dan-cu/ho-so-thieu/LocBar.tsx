'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function LocBar({ defaultQ, truong }: { defaultQ: string; truong?: string }) {
  const router = useRouter()
  const [q, setQ] = useState(defaultQ)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (truong) params.set('truong', truong)
    if (q.trim()) params.set('q', q.trim())
    router.push(`/dashboard/dan-cu/ho-so-thieu${params.toString() ? `?${params}` : ''}`)
  }

  function clear() {
    setQ('')
    const params = new URLSearchParams()
    if (truong) params.set('truong', truong)
    router.push(`/dashboard/dan-cu/ho-so-thieu${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Tìm theo họ tên nhân khẩu..."
        className="w-full pl-11 pr-20 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all"
      />
      {q && (
        <button type="button" onClick={clear} className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={15} />
        </button>
      )}
      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#162d4a] transition-colors">
        Tìm
      </button>
    </form>
  )
}
