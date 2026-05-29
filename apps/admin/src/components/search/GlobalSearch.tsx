'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, Users, AlertCircle, Bell,
  CalendarDays, FileText, User, Loader2,
  ArrowRight, Keyboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────
interface KetQuaTimKiem {
  loai:   string
  id:     string
  tieuDe: string
  moTa?:  string
  meta?:  string
  href:   string
}

// ─── Config hiển thị theo loại kết quả ───────────────────────
const LOAI_CFG: Record<string, {
  label:  string
  icon:   React.ElementType
  color:  string
  bg:     string
}> = {
  ho_dan:    { label: 'Hộ dân',    icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
  nhan_khau: { label: 'Nhân khẩu', icon: User,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
  phan_anh:  { label: 'Phản ánh',  icon: AlertCircle,  color: 'text-red-600',    bg: 'bg-red-50'    },
  thong_bao: { label: 'Thông báo', icon: Bell,         color: 'text-amber-600',  bg: 'bg-amber-50'  },
  su_kien:   { label: 'Sự kiện',   icon: CalendarDays, color: 'text-emerald-600',bg: 'bg-emerald-50'},
  tai_lieu:  { label: 'Tài liệu',  icon: FileText,     color: 'text-slate-600',  bg: 'bg-slate-100' },
}

// ─── Tô sáng từ khóa (hỗ trợ nhiều từ) ──────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>

  // Tách từng từ, escape ký tự đặc biệt
  const words = query.trim().split(/\s+/).filter(Boolean).map(
    w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  if (!words.length) return <>{text}</>

  // OR pattern: khớp bất kỳ từ nào
  const re = new RegExp(`(${words.join('|')})`, 'gi')
  const parts = text.split(re)

  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-[2px] px-0.5 not-italic font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// ─── Component chính ──────────────────────────────────────────
export default function GlobalSearch() {
  const router = useRouter()
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<KetQuaTimKiem[]>([])
  const [loading, setLoading] = useState(false)
  const [active,  setActive]  = useState(-1)

  const inputRef    = useRef<HTMLInputElement>(null)
  const listRef     = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─ Mở/đóng với phím Ctrl+K / Cmd+K ─────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input khi mở
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      setQuery('')
      setResults([])
      setActive(-1)
      document.body.style.overflow = ''
    }
  }, [open])

  // ─ Tìm kiếm debounce ─────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.results ?? [])
      setActive(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  // ─ Điều hướng bàn phím ───────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(v => Math.min(v + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(v => Math.max(v - 1, 0))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      navigate(results[active]?.href ?? '')
    }
  }

  // Scroll active item vào view
  useEffect(() => {
    if (active < 0) return
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // ─ Nhóm kết quả theo loại ────────────────────────────────────
  const grouped = results.reduce<Record<string, KetQuaTimKiem[]>>((acc, r) => {
    ;(acc[r.loai] ??= []).push(r)
    return acc
  }, {})

  // ─── Trigger button (trong TopBar) ───────────────────────────
  const Trigger = (
    <button
      onClick={() => setOpen(true)}
      className="relative flex items-center gap-2 w-full text-left
                 bg-slate-50 border border-slate-200 rounded-lg
                 px-3 py-2 text-sm text-slate-400
                 hover:border-[#1E3A5F]/40 hover:bg-white
                 transition-all duration-150 group"
    >
      <Search size={15} className="text-slate-400 group-hover:text-[#1E3A5F] shrink-0 transition-colors" />
      <span className="flex-1">Tìm kiếm...</span>
      <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-300
                      bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono
                      group-hover:border-slate-300 group-hover:text-slate-400 transition-colors">
        <span className="text-[9px]">⌘</span>K
      </kbd>
    </button>
  )

  return (
    <>
      {Trigger}

      {/* ── Overlay ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl
                          ring-1 ring-slate-200 overflow-hidden z-10
                          animate-in fade-in slide-in-from-top-4 duration-200">

            {/* ── Input ────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              {loading
                ? <Loader2 size={18} className="text-[#1E3A5F] shrink-0 animate-spin" />
                : <Search   size={18} className="text-slate-400 shrink-0" />
              }
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm hộ dân, nhân khẩu, phản ánh, thông báo..."
                className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400
                           text-[15px] outline-none leading-tight"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600
                             hover:bg-slate-100 transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium
                           border border-slate-200 rounded-md px-2 py-1 shrink-0
                           hover:bg-slate-50 transition-colors"
              >
                Esc
              </button>
            </div>

            {/* ── Results ────────────────────────────────────────── */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">

              {/* Chưa nhập gì — gợi ý nhanh */}
              {!query && (
                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Truy cập nhanh
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Quản lý dân cư',   href: '/dashboard/dan-cu',    icon: Users,        color: 'text-blue-600',    bg: 'bg-blue-50' },
                      { label: 'Phản ánh mới',      href: '/dashboard/phan-anh',  icon: AlertCircle,  color: 'text-red-600',     bg: 'bg-red-50' },
                      { label: 'Thông báo',         href: '/dashboard/thong-bao', icon: Bell,         color: 'text-amber-600',   bg: 'bg-amber-50' },
                      { label: 'Sự kiện',           href: '/dashboard/su-kien',   icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Nhật ký hoạt động', href: '/dashboard/audit-logs',icon: Keyboard,     color: 'text-violet-600',  bg: 'bg-violet-50' },
                      { label: 'Tài liệu',          href: '/dashboard/tai-lieu',  icon: FileText,     color: 'text-slate-600',   bg: 'bg-slate-100' },
                    ].map(item => (
                      <button
                        key={item.href}
                        onClick={() => navigate(item.href)}
                        className="flex items-center gap-3 p-3 rounded-xl text-left
                                   hover:bg-slate-50 transition-colors group"
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', item.bg)}>
                          <item.icon size={15} className={item.color} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          {item.label}
                        </span>
                        <ArrowRight size={13} className="ml-auto text-slate-300 group-hover:text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Đang nhập nhưng chưa đủ 2 ký tự */}
              {query.length === 1 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Search size={24} className="mb-2 opacity-30" />
                  <p className="text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
                </div>
              )}

              {/* Không có kết quả */}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Search size={24} className="mb-2 opacity-30" />
                  <p className="text-sm font-medium">Không tìm thấy kết quả</p>
                  <p className="text-xs mt-1">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              )}

              {/* Kết quả nhóm theo loại */}
              {Object.entries(grouped).map(([loai, items]) => {
                const cfg = LOAI_CFG[loai]
                if (!cfg) return null
                const Icon = cfg.icon
                return (
                  <div key={loai} className="px-2 pt-3 pb-1 last:pb-3">
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-3 mb-1">
                      <div className={cn('w-5 h-5 rounded-md flex items-center justify-center', cfg.bg)}>
                        <Icon size={11} className={cfg.color} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-slate-300 ml-0.5">{items.length}</span>
                    </div>

                    {/* Items */}
                    {items.map(item => {
                      const globalIdx = results.indexOf(item)
                      const isActive  = globalIdx === active
                      return (
                        <button
                          key={item.id}
                          data-idx={globalIdx}
                          onClick={() => navigate(item.href)}
                          onMouseEnter={() => setActive(globalIdx)}
                          className={cn(
                            'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                            isActive ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                            isActive ? 'bg-white/20' : cfg.bg
                          )}>
                            <Icon size={13} className={isActive ? 'text-white' : cfg.color} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'text-sm font-medium leading-snug truncate',
                              isActive ? 'text-white' : 'text-slate-800'
                            )}>
                              <Highlight text={item.tieuDe} query={query} />
                            </div>
                            {item.moTa && (
                              <div className={cn(
                                'text-xs leading-snug mt-0.5 line-clamp-1',
                                isActive ? 'text-white/70' : 'text-slate-400'
                              )}>
                                <Highlight text={item.moTa} query={query} />
                              </div>
                            )}
                          </div>

                          {item.meta && (
                            <span className={cn(
                              'text-[11px] font-medium shrink-0 px-2 py-0.5 rounded-full mt-0.5',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500'
                            )}>
                              {item.meta}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <kbd className="border border-slate-200 rounded px-1 py-0.5 font-mono text-[10px] bg-slate-50">↑↓</kbd>
                  điều hướng
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-slate-200 rounded px-1 py-0.5 font-mono text-[10px] bg-slate-50">↵</kbd>
                  chọn
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-slate-200 rounded px-1 py-0.5 font-mono text-[10px] bg-slate-50">Esc</kbd>
                  đóng
                </span>
              </div>
              {results.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {results.length} kết quả
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
