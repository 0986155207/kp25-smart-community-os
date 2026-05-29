'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Config trạng thái ────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, {
  label: string
  badge: string
  dot: string
  Icon: typeof Clock
}> = {
  MOI: {
    label: 'Mới — Chờ tiếp nhận',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot:   'bg-amber-400',
    Icon:  Clock,
  },
  DANG_XU_LY: {
    label: 'Đang xử lý',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot:   'bg-blue-500',
    Icon:  Clock,
  },
  DA_XU_LY: {
    label: 'Đã xử lý xong',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot:   'bg-emerald-500',
    Icon:  CheckCircle,
  },
  DONG: {
    label: 'Đã đóng',
    badge: 'bg-slate-100 text-slate-500 border border-slate-200',
    dot:   'bg-slate-400',
    Icon:  XCircle,
  },
}

interface Props {
  phanAnhId:     string
  initialStatus: string
}

/**
 * PhanAnhLiveStatus — hiển thị trạng thái phản ánh theo thời gian thực.
 * Kết nối Supabase Realtime, tự cập nhật badge khi có thay đổi.
 */
export default function PhanAnhLiveStatus({ phanAnhId, initialStatus }: Props) {
  const [trangThai, setTrangThai] = useState(initialStatus)
  const [justUpdated, setJustUpdated] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channelName = `phan-anh-${phanAnhId}`

    // Xóa channel cũ cùng tên nếu còn tồn tại (React StrictMode double-invoke)
    const stale = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
    if (stale) supabase.removeChannel(stale)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'phan_anh',
          filter: `id=eq.${phanAnhId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { trang_thai: string }).trang_thai
          if (newStatus && newStatus !== trangThai) {
            setTrangThai(newStatus)
            setJustUpdated(true)
            setTimeout(() => setJustUpdated(false), 3000)
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phanAnhId])

  const cfg = TRANG_THAI_CFG[trangThai] ?? TRANG_THAI_CFG['MOI']!
  const { Icon } = cfg

  return (
    <div className="flex flex-col gap-2">
      {/* Badge trạng thái */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold w-fit transition-all duration-500 ${cfg.badge} ${justUpdated ? 'ring-2 ring-offset-2 ring-current scale-105' : ''}`}>
        <Icon size={14} />
        {cfg.label}
        {justUpdated && (
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-70 ml-1">
            · Vừa cập nhật
          </span>
        )}
      </div>

      {/* Chỉ báo Realtime */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        {isConnected ? (
          <>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
            <span>Đang theo dõi trực tiếp</span>
          </>
        ) : (
          <>
            <Loader2 size={10} className="animate-spin" />
            <span>Đang kết nối...</span>
          </>
        )}
      </div>
    </div>
  )
}
