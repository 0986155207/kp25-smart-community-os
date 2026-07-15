'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useEffect } from 'react'
import { Bell, X, Loader2, AlertCircle, BellOff } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

const DISMISS_KEY  = 'kp25_portal_push_dismissed'
const FCM_TOKEN_KEY = 'kp25_portal_fcm_token'

export default function PushPermissionBanner() {
  const { trangThai, loiMsg, dangKy, coCauHinh } = usePushNotification()
  const [dismissed, setDismissed] = useState(true)
  const [show,      setShow]      = useState(false)

  // Sau hydrate: kiểm tra localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem(DISMISS_KEY) === '1'
    const daCoToken   = Boolean(localStorage.getItem(FCM_TOKEN_KEY))
    setDismissed(isDismissed || daCoToken)
  }, [])

  // Hiện banner sau 2s nếu chưa đăng ký và chưa dismiss
  useEffect(() => {
    if (!coCauHinh || dismissed) return
    if (trangThai === 'cho_phep' || trangThai === 'chua_kiem_tra') {
      const t = setTimeout(() => setShow(true), 2000)
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
    // Dạng bottom sheet trên mobile, banner trên desktop
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-auto
      md:relative md:mx-0 md:rounded-none
      animate-in slide-in-from-bottom duration-300 md:slide-in-from-top-2">

      {/* Mobile: full-width card từ dưới lên */}
      <div className="bg-white border-t border-slate-200 shadow-2xl px-5 py-5 md:hidden">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-[#8B1A1A]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-base leading-tight">
              Nhận thông báo khu phố
            </p>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Cảnh báo an ninh, họp dân cư, sự kiện cộng đồng — ngay trên điện thoại bạn.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 shrink-0 -mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {loiMsg && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-3">
            <AlertCircle size={13} />
            {loiMsg}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleDangKy}
            disabled={trangThai === 'dang_xu_ly'}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              bg-[#8B1A1A] text-white text-sm font-bold
              disabled:opacity-60 active:scale-95 transition-all"
          >
            {trangThai === 'dang_xu_ly'
              ? <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</>
              : <><Bell size={15} /> Bật thông báo</>
            }
          </button>
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200
              text-sm text-slate-500 font-medium active:scale-95 transition-all"
          >
            <BellOff size={14} />
            Để sau
          </button>
        </div>
      </div>

      {/* Desktop: banner nhỏ gọn */}
      <div className="hidden md:flex items-center gap-4 bg-gradient-to-r from-[#8B1A1A]/5 to-blue-50
        border border-[#8B1A1A]/20 rounded-2xl px-5 py-4 mx-4 mt-4 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-[#8B1A1A]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            Bật thông báo để không bỏ lỡ tin tức {KHU_PHO.ten}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhận cảnh báo an ninh, thông báo họp, sự kiện cộng đồng ngay trên trình duyệt.
          </p>
          {loiMsg && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {loiMsg}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDangKy}
            disabled={trangThai === 'dang_xu_ly'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1A1A] text-white
              text-xs font-semibold hover:bg-[#6B1414] disabled:opacity-60 transition-colors"
          >
            {trangThai === 'dang_xu_ly'
              ? <><Loader2 size={12} className="animate-spin" /> Đang xử lý...</>
              : <><Bell size={12} /> Bật thông báo</>
            }
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
