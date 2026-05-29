'use client'

import { Bell, ExternalLink } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

/**
 * Hiển thị thông báo FCM foreground như toast góc phải màn hình.
 * Đặt trong root layout, tự ẩn sau 8s.
 */
export default function ForegroundToast() {
  const { thongBaoMoi, daDangKy } = usePushNotification()

  if (!daDangKy || !thongBaoMoi) return null

  function handleClick() {
    if (thongBaoMoi?.url) window.location.href = thongBaoMoi.url
  }

  return (
    <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 z-50
      rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden
      animate-in slide-in-from-bottom-4 duration-300">
      <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#1E3A5F]" />
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-[#8B1A1A]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wide mb-0.5">
            KP25 · Thông báo mới
          </p>
          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
            {thongBaoMoi.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {thongBaoMoi.body}
          </p>
          {thongBaoMoi.url && thongBaoMoi.url !== '/' && (
            <button
              onClick={handleClick}
              className="mt-2 flex items-center gap-1 text-xs text-[#8B1A1A] hover:underline font-medium"
            >
              <ExternalLink size={11} />
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
