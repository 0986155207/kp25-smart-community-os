'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Home, X, ChevronDown, Check } from 'lucide-react'

interface HoDan {
  id:          string
  ma_ho:       string
  chu_ho:      string
  dia_chi_day: string | null
}

interface Props {
  /** Tên của hidden input — mặc định "ho_dan_id" */
  name?:       string
  required?:   boolean
  /** Giá trị ban đầu (khi edit) */
  defaultId?:  string
  defaultLabel?: string
  /** Màu highlight khi focus — tailwind class */
  accentColor?: string
}

export default function HoDanCombobox({
  name        = 'ho_dan_id',
  required    = false,
  defaultId   = '',
  defaultLabel = '',
  accentColor  = 'focus:ring-amber-500 focus:border-amber-400',
}: Props) {
  const [query,    setQuery]    = useState(defaultLabel)
  const [results,  setResults]  = useState<HoDan[]>([])
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<HoDan | null>(null)
  const [value,    setValue]    = useState(defaultId)

  const inputRef   = useRef<HTMLInputElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropRef.current  && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/ho-dan?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    setValue('')        // xóa selection khi gõ lại
    setSelected(null)
    setOpen(true)

    if (debounceId.current) clearTimeout(debounceId.current)
    debounceId.current = setTimeout(() => search(v), 300)
  }

  function handleFocus() {
    setOpen(true)
    if (results.length === 0 && !loading) search(query)
  }

  function handleSelect(hd: HoDan) {
    setSelected(hd)
    setValue(hd.id)
    setQuery(hd.chu_ho)
    setOpen(false)
  }

  function handleClear() {
    setSelected(null)
    setValue('')
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {/* Hidden input gửi ho_dan_id lên form */}
      <input type="hidden" name={name} value={value} />

      {/* Text input */}
      <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white transition-all ${
        open
          ? 'border-amber-400 ring-2 ring-amber-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}>
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder="Tìm theo chủ hộ hoặc địa chỉ..."
          value={query}
          onChange={handleInput}
          onFocus={handleFocus}
          required={required && !value}
          className="flex-1 outline-none bg-transparent placeholder:text-slate-400"
        />
        {value ? (
          <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </div>

      {/* Selected badge */}
      {selected && (
        <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <Check size={12} className="text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-amber-800">{selected.chu_ho}</span>
            {selected.dia_chi_day && (
              <span className="text-xs text-amber-600 ml-2">— {selected.dia_chi_day}</span>
            )}
          </div>
          {selected.ma_ho && (
            <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Hộ {selected.ma_ho}
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={dropRef}
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">Đang tìm...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">
              {query ? 'Không tìm thấy hộ dân' : 'Gõ tên chủ hộ hoặc địa chỉ để tìm'}
            </div>
          ) : (
            results.map(hd => (
              <button
                key={hd.id}
                type="button"
                onMouseDown={() => handleSelect(hd)}
                className={`w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors border-b border-slate-50 last:border-0 ${
                  value === hd.id ? 'bg-amber-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home size={13} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{hd.chu_ho}</span>
                      {hd.ma_ho && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          Hộ {hd.ma_ho}
                        </span>
                      )}
                      {value === hd.id && <Check size={13} className="text-amber-600 ml-auto" />}
                    </div>
                    {hd.dia_chi_day && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">{hd.dia_chi_day}</div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
