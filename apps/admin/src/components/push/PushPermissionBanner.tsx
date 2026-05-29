'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X, Loader2, AlertCircle } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

// Key localStorage để nhớ đã dismiss
const DISMISS_KEY = 'kp25_push_banner_dismissed'

export default function PushPermissionBanner() {
  const { trangThai, loiMsg, dangKy, coCauHinh } = usePushNotification()
  const [dismissed, setDismissed] = useState(true) // default true → ẩn khi chưa hydrate
  const [show,      setShow]      = useState(false)

  // Sau khi hydrate: đọc localStorage
  // Nếu đã có FCM token (đã đăng ký) → cũng coi như dismissed
  useEffect(() => {
    const isDismissed = localStorage.getItem(DISMISS_KEY) === '1'
    const daCoToken  = Boolean(localStorage.getItem('kp25_fcm_token'))
    setDismissed(isDismissed || daCoToken)
  }, [])

  // Hiện banner chỉ khi: có config, chưa bị dismiss, trạng thái cho phép đăng ký
  useEffect(() => {
    if (!coCauHinh || dismissed) {
      return
    }
    if (trangThai === 'cho_phep' || trangThai === 'chua_kiem_tra') {
      // Delay nhỏ để không pop-up ngay khi vào trang
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
    setShow(false)
    return
  }, [trangThai, dismissed, coCauHinh])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
    setShow(false)
  }

  async function handleDangKy() {
    const ok = await dangKy()
    if (ok) setShow(false)
  }

  if (!show) return null

  return (
    <div className="mx-6 mt-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
        <Bell size={20} className="text-blue-600" />
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          Bật thông báo để không bỏ lỡ tin tức khu phố
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Nhận cảnh báo an ninh, thông báo họp, sự kiện cộng đồng ngay trên trình duyệt của bạn.
        </p>

        {loiMsg && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={13} />
            {loiMsg}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleDangKy}
            disabled={trangThai === 'dang_xu_ly'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
              text-white text-xs font-semibold disabled:opacity-60 transition-colors"
          >
            {trangThai === 'dang_xu_ly'
              ? <><Loader2 size={13} className="animate-spin" /> Đang xử lý...</>
              : <><Bell size={13} /> Bật thông báo</>
            }
          </button>
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-500
              hover:text-slate-700 hover:bg-white/60 transition-colors"
          >
            <BellOff size={13} />
            Để sau
          </button>
        </div>
      </div>

      {/* Nút đóng */}
      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        title="Đóng"
      >
        <X size={16} />
      </button>
    </div>
  )
}
