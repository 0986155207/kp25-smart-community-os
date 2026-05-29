'use client'

import { useEffect } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

/**
 * ForegroundToast — hiển thị thông báo foreground FCM như một toast nổi ở góc phải.
 * Đặt vào dashboard layout, tự động ẩn sau 8s.
 */
export default function ForegroundToast() {
  const { thongBaoMoi, daDangKy } = usePushNotification()

  // Effect này chỉ để mount, không cần logic thêm
  useEffect(() => {}, [])

  if (!daDangKy || !thongBaoMoi) return null

  function handleClick() {
    if (thongBaoMoi?.url) window.location.href = thongBaoMoi.url
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-white shadow-xl border border-slate-200
        overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* Thanh màu trên cùng */}
      <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#1E3A5F]" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-[#8B1A1A]" />
          </div>

          {/* Nội dung */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wide mb-0.5">
              KP25 · Thông báo mới
            </p>
            <p className="text-sm font-semibold text-slate-800 line-clamp-1">
              {thongBaoMoi.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
              {thongBaoMoi.body}
            </p>

            {thongBaoMoi.url && (
              <button
                onClick={handleClick}
                className="mt-2 flex items-center gap-1 text-xs text-[#8B1A1A] hover:underline font-medium"
              >
                <ExternalLink size={11} />
                Xem chi tiết
              </button>
            )}
          </div>

          {/* Nút đóng — chỉ để tương tác; tự ẩn theo timer trong hook */}
          <button className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
