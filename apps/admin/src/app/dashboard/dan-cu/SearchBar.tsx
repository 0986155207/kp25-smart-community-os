'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Props {
  defaultValue?: string
  tinhTrang?: string
}

export default function SearchBar({ defaultValue = '', tinhTrang = 'TAT_CA' }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (tinhTrang && tinhTrang !== 'TAT_CA') params.set('tinh_trang', tinhTrang)
    if (value.trim()) params.set('tim_kiem', value.trim())
    router.push(`/dashboard/dan-cu?${params.toString()}`)
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams()
    if (tinhTrang && tinhTrang !== 'TAT_CA') params.set('tinh_trang', tinhTrang)
    router.push(`/dashboard/dan-cu?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input pl-8 pr-8 py-1.5 text-sm w-56"
        placeholder="Tìm chủ hộ, địa chỉ..."
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700"
        >
          <X size={13} />
        </button>
      )}
    </form>
  )
}
