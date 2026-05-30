'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Bell, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThongKeHomNay } from '../actions'

// Luôn hiển thị giờ Việt Nam (UTC+7) bất kể server timezone
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

function gioVN(): string {
  return new Date().toLocaleTimeString('vi-VN', {
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: VN_TIMEZONE,
  })
}

interface ItemProps {
  label:   string
  value:   number
  unit?:   string
  icon:    React.ElementType
  color:   string
  bg:      string
  pulse?:  boolean
}

function Item({ label, value, unit, icon: Icon, color, bg, pulse }: ItemProps) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border', bg)}>
      <div className={cn('relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
        <Icon size={16} className={color} />
        {pulse && value > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className={cn('text-xl font-bold tabular-nums', color)}>
            {value.toLocaleString('vi-VN')}
          </span>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  )
}

export default function DaiHomNay({ data }: { data: ThongKeHomNay }) {
  // null = server / chờ hydration (tránh UTC time hiện ra từ SSR)
  // string = sau khi client mount xong → giờ VN chính xác
  const [gioHienTai, setGioHienTai] = useState<string | null>(null)

  // useEffect CHỈ chạy trên client → không bao giờ dùng UTC của server
  useEffect(() => {
    setGioHienTai(gioVN())                                    // set ngay khi mount
    const id = setInterval(() => setGioHienTai(gioVN()), 30_000) // cập nhật 30s/lần
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-gradient-to-r from-slate-900 to-[#1E3A5F] rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/70 text-xs font-medium">
            Hôm nay{gioHienTai ? ` · ${gioHienTai}` : ''}
          </span>
        </div>
        <span className="text-white/40 text-[11px]">Cập nhật realtime</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Item
          label="Phản ánh mới hôm nay"
          value={data.phanAnhMoiHomNay}
          unit="vụ"
          icon={Bell}
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
          pulse
        />
        <Item
          label="Đã xử lý hôm nay"
          value={data.phanAnhDongHomNay}
          unit="vụ"
          icon={CheckCircle2}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
        <Item
          label="Thông báo tháng này"
          value={data.thongBaoThangNay}
          unit="tin"
          icon={Bell}
          color="text-blue-400"
          bg="bg-blue-500/10 border-blue-500/20"
        />
        <Item
          label="Phản ánh khẩn cấp"
          value={data.phanAnhKhanCap}
          unit="vụ"
          icon={Flame}
          color={data.phanAnhKhanCap > 0 ? 'text-red-400' : 'text-slate-400'}
          bg={data.phanAnhKhanCap > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-500/10 border-slate-500/20'}
          pulse={data.phanAnhKhanCap > 0}
        />
      </div>
    </div>
  )
}
