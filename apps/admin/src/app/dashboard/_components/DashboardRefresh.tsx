'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FALLBACK_INTERVAL_MS = 120_000   // 2 phút (dự phòng nếu Realtime mất kết nối)

export default function DashboardRefresh() {
  const router   = useRouter()
  const [spinning,   setSpinning]   = useState(false)
  const [connected,  setConnected]  = useState<boolean | null>(null)  // null = đang kết nối
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doRefresh = useCallback(() => {
    setSpinning(true)
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setSpinning(false), 800)
  }, [router])

  useEffect(() => {
    const supabase = createClient()

    // ─ Kết nối Realtime channel
    const channel = supabase
      .channel('kp25-dashboard-refresh', {
        config: { broadcast: { self: false } },
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phan_anh' },             () => doRefresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dang_ky_tam_tru' },    () => doRefresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dang_ky_tam_vang' },   () => doRefresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'thong_bao' },          () => doRefresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflow_assignments' }, () => doRefresh())
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
        if (status !== 'SUBSCRIBED') {
          // Fallback: interval dự phòng khi Realtime không kết nối được
          if (!fallbackRef.current) {
            fallbackRef.current = setInterval(doRefresh, FALLBACK_INTERVAL_MS)
          }
        } else {
          // Đã kết nối Realtime → dừng fallback interval
          if (fallbackRef.current) {
            clearInterval(fallbackRef.current)
            fallbackRef.current = null
          }
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      if (fallbackRef.current) clearInterval(fallbackRef.current)
    }
  }, [doRefresh])

  // ─── Format thời gian làm mới gần nhất
  function formatLastRefresh() {
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    if (diff < 5)   return 'vừa xong'
    if (diff < 60)  return `${diff}s trước`
    if (diff < 3600) return `${Math.floor(diff / 60)}p trước`
    return lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
  }

  const statusIcon = connected === null
    ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
    : connected
      ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      : <WifiOff size={10} className="text-slate-400" />

  return (
    <div className="flex items-center gap-2">
      {/* Trạng thái kết nối Realtime */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
        {statusIcon}
        <Wifi size={11} className={connected ? 'text-emerald-500' : 'text-slate-300'} />
        <span className="hidden lg:inline">
          {connected === null ? 'Đang kết nối...' : connected ? 'Realtime' : 'Offline'}
        </span>
      </div>

      {/* Nút làm mới thủ công */}
      <button
        onClick={doRefresh}
        title="Làm mới dữ liệu"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
      >
        <RefreshCw
          size={13}
          className={spinning ? 'animate-spin text-[#1E3A5F]' : ''}
        />
        <span className="tabular-nums hidden sm:inline">
          {spinning ? 'Đang tải...' : `Làm mới ${formatLastRefresh()}`}
        </span>
      </button>
    </div>
  )
}
